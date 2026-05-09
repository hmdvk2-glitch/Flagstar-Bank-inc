/**
 * ================================================================
 * FLAGSTAR BANK  STORAGE ENGINE v7.0
 * Local Storage Database with Schema Enforcement
 * ================================================================
 * All data persistence must occur through this engine.
 * Direct localStorage writes are forbidden outside this module.
 * ================================================================
 */

import { SystemLogger } from '../services/systemLogger.js';
import { supabase } from '../lib/supabase.js';

export const StorageEngine = {
    _dbKey: 'flagstar_db',
    _sessionKey: 'flagstar_session',
    _supabase: supabase, // Bridge reference

    /**
     * Database schema definition.
     * All tables must be declared here.
     */
    _schema: {
        users: [],
        accounts: [],
        transactions: [],
        loans: [],
        transferCodes: [],
        leads: []
    },

    /**
     * Initialize the storage engine.
     * Loads existing data or seeds with defaults.
     */
    init() {
        const existing = this._rawLoad();
        if (!existing) {
            this._seed();
            SystemLogger.log('STORAGE_INIT', 'SYSTEM', 'Storage engine initialized with seed data.');
        } else {
            // Ensure all schema tables exist (migration safety)
            let migrated = false;
            for (const table in this._schema) {
                if (!existing[table]) {
                    existing[table] = this._schema[table];
                    migrated = true;
                }
            }
            if (migrated) {
                this._rawSave(existing);
                SystemLogger.log('STORAGE_MIGRATION', 'SYSTEM', 'Schema migration applied  missing tables added.');
            }
            SystemLogger.log('STORAGE_INIT', 'SYSTEM', `Storage engine loaded. Tables: ${Object.keys(existing).join(', ')}`);
        }
    },

    /**
     * Load the entire database
     * @returns {Object} The complete database object
     */
    loadDB() {
        const db = this._rawLoad();
        if (!db) {
            SystemLogger.error('StorageEngine', 'Database not found', 'All operations blocked', 'Call StorageEngine.init()');
            return JSON.parse(JSON.stringify(this._schema));
        }
        return db;
    },

    /**
     * Save the entire database
     * @param {Object} db - The complete database object
     */
    saveDB(db) {
        if (!db || typeof db !== 'object') {
            SystemLogger.error('StorageEngine', 'Invalid database object', 'Save aborted', 'Pass a valid object to saveDB()');
            return false;
        }

        // Validate schema integrity
        for (const table in this._schema) {
            if (!Array.isArray(db[table])) {
                SystemLogger.error('StorageEngine', `Table "${table}" is malformed`, 'Data integrity risk', `Ensure db.${table} is an array`);
                return false;
            }
        }

        this._rawSave(db);
        return true;
    },

    /**
     * Get all records from a table (Supabase)
     * @param {string} table - Table name
     * @returns {Promise<Array>} Records
     */
    async getAll(table) {
        this._validateTable(table);
        const mappedTable = this._mapTable(table);
        
        const { data, error } = await supabase
            .from(mappedTable)
            .select('*');

        if (error) {
            SystemLogger.error('StorageEngine', `Failed to fetch from ${table}`, error.message);
            return [];
        }
        return data;
    },

    /**
     * Get a single record by ID (Supabase)
     * @param {string} table - Table name
     * @param {string} id - Record ID
     * @returns {Promise<Object|null>} Record or null
     */
    async getById(table, id) {
        this._validateTable(table);
        const mappedTable = this._mapTable(table);

        const { data, error } = await supabase
            .from(mappedTable)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            SystemLogger.error('StorageEngine', `Failed to get ${table}/${id}`, error.message);
            return null;
        }
        return data;
    },

    /**
     * Find records matching a filter (Supabase)
     * @param {string} table - Table name
     * @param {Object} filter - Filter object { column: value }
     * @returns {Promise<Array>} Matching records
     */
    async find(table, filter = {}) {
        this._validateTable(table);
        const mappedTable = this._mapTable(table);

        let query = supabase.from(mappedTable).select('*');
        
        for (const key in filter) {
            query = query.eq(key, filter[key]);
        }

        const { data, error } = await query;

        if (error) {
            SystemLogger.error('StorageEngine', `Find failed in ${table}`, error.message);
            return [];
        }
        return data;
    },

    /**
     * Insert a record into a table (Supabase)
     * @param {string} table - Table name
     * @param {Object} record - Record to insert
     * @returns {Promise<Object>} The inserted record
     */
    async insert(table, record) {
        this._validateTable(table);
        const mappedTable = this._mapTable(table);

        const { data, error } = await supabase
            .from(mappedTable)
            .insert([record])
            .select()
            .single();

        if (error) {
            SystemLogger.error('StorageEngine', `Insert failed into ${table}`, error.message);
            throw error;
        }

        SystemLogger.log('RECORD_INSERT', 'STORAGE', `Inserted into ${table}`);
        return data;
    },

    /**
     * Update a record by ID (Supabase)
     * @param {string} table - Table name
     * @param {string} id - Record ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object|null>} Updated record or null
     */
    async update(table, id, updates) {
        this._validateTable(table);
        const mappedTable = this._mapTable(table);

        const { data, error } = await supabase
            .from(mappedTable)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            SystemLogger.error('StorageEngine', `Update failed on ${table}/${id}`, error.message);
            return null;
        }

        SystemLogger.log('RECORD_UPDATE', 'STORAGE', `Updated ${table}/${id}`);
        return data;
    },

    /**
     * Delete a record by ID (Supabase)
     * @param {string} table - Table name
     * @param {string} id - Record ID
     * @returns {Promise<boolean>} Success
     */
    async remove(table, id) {
        this._validateTable(table);
        const mappedTable = this._mapTable(table);

        const { error } = await supabase
            .from(mappedTable)
            .delete()
            .eq('id', id);

        if (error) {
            SystemLogger.error('StorageEngine', `Delete failed on ${table}/${id}`, error.message);
            return false;
        }

        SystemLogger.log('RECORD_DELETE', 'STORAGE', `Deleted ${table}/${id}`);
        return true;
    },

    // --- Session Management ---

    getSession() {
        try {
            const session = localStorage.getItem(this._sessionKey);
            return session ? JSON.parse(session) : null;
        } catch (e) {
            return null;
        }
    },

    setSession(data) {
        localStorage.setItem(this._sessionKey, JSON.stringify(data));
    },

    clearSession() {
        localStorage.removeItem(this._sessionKey);
    },

    // --- Private Methods ---

    _rawLoad() {
        try {
            const data = localStorage.getItem(this._dbKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            SystemLogger.error('StorageEngine', 'Failed to parse database', 'Data corruption', 'Reset database');
            return null;
        }
    },

    _rawSave(db) {
        try {
            localStorage.setItem(this._dbKey, JSON.stringify(db));
        } catch (e) {
            SystemLogger.error('StorageEngine', 'Failed to save database', 'Data will not persist', 'Clear storage or reduce data');
        }
    },

    _validateTable(table) {
        if (!(table in this._schema)) {
            throw new Error(`[StorageEngine] Invalid table: "${table}". Valid tables: ${Object.keys(this._schema).join(', ')}`);
        }
    },

    _mapTable(table) {
        const mapping = {
            users: 'users',
            accounts: 'accounts',
            transactions: 'ledger',
            loans: 'loans',
            transferCodes: 'transfer_codes',
            leads: 'leads'
        };
        return mapping[table] || table;
    },

    _generateId(prefix) {
        const p = prefix ? prefix.toUpperCase().substring(0, 3) : 'REC';
        return `${p}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
    },

    /**
     * Seed the database with initial simulation data
     */
    _seed() {
        const db = JSON.parse(JSON.stringify(this._schema));

        // Seed default user
        db.users.push({
            id: 'USR-default-001',
            accountId: 'FS-99281',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            dob: '1988-05-14',
            ssn: '--4567',
            address: '123 Financial Way, Suite 400, New York, NY 10001',
            role: 'member',
            kycStatus: 'verified',
            _createdAt: '2021-01-15T08:00:00Z',
            _updatedAt: new Date().toISOString()
        });

        // Seed accounts
        db.accounts.push(
            {
                id: 'ACC-checking-001',
                userId: 'USR-default-001',
                accountNumber: '1234',
                type: 'Essential Checking',
                balance: 12450.32,
                status: 'active',
                _createdAt: '2021-01-15T08:00:00Z',
                _updatedAt: new Date().toISOString()
            },
            {
                id: 'ACC-savings-001',
                userId: 'USR-default-001',
                accountNumber: '5678',
                type: 'High-Yield Savings',
                balance: 45230.89,
                status: 'active',
                _createdAt: '2021-01-15T08:00:00Z',
                _updatedAt: new Date().toISOString()
            },
            {
                id: 'ACC-holiday-001',
                userId: 'USR-default-001',
                accountNumber: '9012',
                type: 'Holiday Club',
                balance: 1200.00,
                status: 'active',
                _createdAt: '2021-06-01T08:00:00Z',
                _updatedAt: new Date().toISOString()
            }
        );

        // Seed transactions
        db.transactions.push(
            { id: 'TXN-001', accountNumber: '1234', type: 'debit', amount: -4.85, fees: 0, desc: 'Starbucks Coffee', category: 'Food & Dining', timestamp: '2026-03-14T10:30:00Z' },
            { id: 'TXN-002', accountNumber: '1234', type: 'credit', amount: 3250.00, fees: 0, desc: 'Salary Deposit', category: 'Income', timestamp: '2026-03-13T08:00:00Z' },
            { id: 'TXN-003', accountNumber: '1234', type: 'debit', amount: -67.32, fees: 0, desc: 'Amazon.com', category: 'Shopping', timestamp: '2026-03-12T14:22:00Z' },
            { id: 'TXN-004', accountNumber: '1234', type: 'debit', amount: -150.00, fees: 5.40, desc: 'Transfer to Sarah', category: 'Transfer', timestamp: '2026-03-10T09:15:00Z' },
            { id: 'TXN-005', accountNumber: '1234', type: 'debit', amount: -124.50, fees: 0, desc: 'Whole Foods Market', category: 'Groceries', timestamp: '2026-03-08T16:45:00Z' },
            { id: 'TXN-006', accountNumber: '1234', type: 'debit', amount: -15.99, fees: 0, desc: 'Netflix Subscription', category: 'Entertainment', timestamp: '2026-03-05T00:00:00Z' },
            { id: 'TXN-007', accountNumber: '1234', type: 'debit', amount: -1800.00, fees: 0, desc: 'Rent Payment', category: 'Housing', timestamp: '2026-03-01T08:00:00Z' },
            { id: 'TXN-008', accountNumber: '1234', type: 'debit', amount: -45.00, fees: 0, desc: 'Gas Station', category: 'Transport', timestamp: '2026-02-28T11:30:00Z' },
            { id: 'TXN-009', accountNumber: '1234', type: 'credit', amount: 500.00, fees: 0, desc: 'Freelance Payment', category: 'Income', timestamp: '2026-02-25T14:00:00Z' }
        );

        // Seed transfer codes
        db.transferCodes.push(
            { id: 'CODE-001', accountId: 'FS-99281', customer: 'John Doe', cotCode: 'COT-4A7F-92B3', taxCode: 'TAX-8D2E-41C9', irsCode: 'IRS-3F6A-75D1', status: 'active', _createdAt: new Date().toISOString() },
            { id: 'CODE-002', accountId: 'FS-99282', customer: 'Sarah Jenkins', cotCode: 'COT-92B3-1A2B', taxCode: 'TAX-41C9-3C4D', irsCode: 'IRS-75D1-5E6F', status: 'active', _createdAt: new Date().toISOString() }
        );

        this._rawSave(db);
    },

    /**
     * Reset the database to seed data
     */
    reset() {
        this._seed();
        SystemLogger.log('DATABASE_RESET', 'SYSTEM', 'Database reset to seed data.');
    }
};
