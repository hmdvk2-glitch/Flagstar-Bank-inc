/**
 * ================================================================
 * FLAGSTAR BANK  SECURITY ENGINE v7.0
 * Banking Security Simulation Layer
 * ================================================================
 * All transfer verification must be validated before finalization.
 * Required modules: COT, TAX, IRS, Admin Access, Session Protection
 * ================================================================
 */

import { SystemLogger } from '../services/systemLogger.js';
import { StorageEngine } from './storageEngine.js';

export const SecurityEngine = {
    _verificationState: {
        cotVerified: false,
        taxVerified: false,
        irsVerified: false
    },

    /**
     * Initialize security engine
     */
    init() {
        this.resetVerification();
        SystemLogger.log('SECURITY_INIT', 'SYSTEM', 'Security Engine initialized. All verification gates locked.');
    },

    // ================================================================
    // COT CODE SYSTEM
    // ================================================================

    /**
     * Validate a COT (Certificate of Transfer) code (Async)
     * @param {string} code - User-entered COT code
     * @param {string} accountId - Account to validate against
     * @returns {Promise<Object>} Validation result
     */
    async validateCOT(code, accountId) {
        if (!code || code.trim() === '') {
            SystemLogger.log('COT_VALIDATION', 'SECURITY', 'COT validation failed: empty code', 'WARN');
            return { valid: false, reason: 'COT code is required.' };
        }

        const codes = await StorageEngine.find('transferCodes', { cotCode: code, status: 'active' });

        if (codes.length > 0) {
            this._verificationState.cotVerified = true;
            SystemLogger.log('COT_VALIDATION', 'SECURITY', `COT code verified for account ${accountId}`);
            return { valid: true, reason: 'COT code verified.' };
        }

        SystemLogger.log('COT_VALIDATION', 'SECURITY', `COT validation failed for account ${accountId}: invalid code`, 'WARN');
        return { valid: false, reason: 'Invalid COT code. Contact your account manager.' };
    },

    // ================================================================
    // TAX CODE SYSTEM
    // ================================================================

    /**
     * Validate a TAX code (Async)
     * @param {string} code - User-entered TAX code
     * @param {string} accountId - Account to validate against
     * @returns {Promise<Object>} Validation result
     */
    async validateTAX(code, accountId) {
        if (!code || code.trim() === '') {
            SystemLogger.log('TAX_VALIDATION', 'SECURITY', 'TAX validation failed: empty code', 'WARN');
            return { valid: false, reason: 'TAX code is required.' };
        }

        const codes = await StorageEngine.find('transferCodes', { taxCode: code, status: 'active' });

        if (codes.length > 0) {
            this._verificationState.taxVerified = true;
            SystemLogger.log('TAX_VALIDATION', 'SECURITY', `TAX code verified for account ${accountId}`);
            return { valid: true, reason: 'TAX code verified.' };
        }

        SystemLogger.log('TAX_VALIDATION', 'SECURITY', `TAX validation failed for account ${accountId}: invalid code`, 'WARN');
        return { valid: false, reason: 'Invalid TAX code. Contact your account manager.' };
    },

    // ================================================================
    // IRS CODE SYSTEM
    // ================================================================

    /**
     * Validate an IRS code (Async)
     * @param {string} code - User-entered IRS code
     * @param {string} accountId - Account to validate against
     * @returns {Promise<Object>} Validation result
     */
    async validateIRS(code, accountId) {
        if (!code || code.trim() === '') {
            SystemLogger.log('IRS_VALIDATION', 'SECURITY', 'IRS validation failed: empty code', 'WARN');
            return { valid: false, reason: 'IRS code is required.' };
        }

        const codes = await StorageEngine.find('transferCodes', { irsCode: code, status: 'active' });

        if (codes.length > 0) {
            this._verificationState.irsVerified = true;
            SystemLogger.log('IRS_VALIDATION', 'SECURITY', `IRS code verified for account ${accountId}`);
            return { valid: true, reason: 'IRS code verified.' };
        }

        SystemLogger.log('IRS_VALIDATION', 'SECURITY', `IRS validation failed for account ${accountId}: invalid code`, 'WARN');
        return { valid: false, reason: 'Invalid IRS code. Contact your account manager.' };
    },

    // ================================================================
    // TRANSFER AUTHORIZATION
    // ================================================================

    /**
     * Check if all verification steps are complete
     * @returns {Object} Verification status
     */
    getVerificationStatus() {
        return {
            cotVerified: this._verificationState.cotVerified,
            taxVerified: this._verificationState.taxVerified,
            irsVerified: this._verificationState.irsVerified,
            allVerified: this._verificationState.cotVerified &&
                this._verificationState.taxVerified &&
                this._verificationState.irsVerified
        };
    },

    /**
     * Check if transfer can proceed
     * @param {number} amount - Transfer amount
     * @returns {Object} Authorization result
     */
    authorizeTransfer(amount) {
        const status = this.getVerificationStatus();

        // Transfers under $100 only need COT
        if (amount < 100) {
            if (status.cotVerified) {
                SystemLogger.log('TRANSFER_AUTHORIZED', 'SECURITY', `Transfer of $${amount} authorized (COT only  small amount).`);
                return { authorized: true, reason: 'Transfer authorized.' };
            }
            return { authorized: false, reason: 'COT verification required.', nextStep: 'COT' };
        }

        // Transfers $100 - $5000 need COT + TAX
        if (amount < 5000) {
            if (!status.cotVerified) {
                return { authorized: false, reason: 'COT verification required.', nextStep: 'COT' };
            }
            if (!status.taxVerified) {
                return { authorized: false, reason: 'TAX verification required.', nextStep: 'TAX' };
            }
            SystemLogger.log('TRANSFER_AUTHORIZED', 'SECURITY', `Transfer of $${amount} authorized (COT + TAX).`);
            return { authorized: true, reason: 'Transfer authorized.' };
        }

        // Transfers $5000+ need ALL THREE
        if (!status.cotVerified) {
            return { authorized: false, reason: 'COT verification required.', nextStep: 'COT' };
        }
        if (!status.taxVerified) {
            return { authorized: false, reason: 'TAX verification required.', nextStep: 'TAX' };
        }
        if (!status.irsVerified) {
            return { authorized: false, reason: 'IRS verification required.', nextStep: 'IRS' };
        }

        SystemLogger.log('TRANSFER_AUTHORIZED', 'SECURITY', `Transfer of $${amount} authorized (full verification).`);
        return { authorized: true, reason: 'Transfer authorized.' };
    },

    /**
     * Reset all verification states
     */
    resetVerification() {
        this._verificationState = {
            cotVerified: false,
            taxVerified: false,
            irsVerified: false
        };
    },

    // ================================================================
    // ADMIN ACCESS CONTROL
    // ================================================================

    /**
     * Validate admin access
     * @param {Object} user - User object with role
     * @returns {boolean}
     */
    isAdmin(user) {
        if (!user || user.role !== 'admin') {
            SystemLogger.log('ADMIN_ACCESS_DENIED', 'SECURITY', `Access denied for ${user ? user.id : 'unknown'}`, 'WARN');
            return false;
        }
        SystemLogger.log('ADMIN_ACCESS', 'SECURITY', `Admin access granted for ${user.id}`);
        return true;
    },

    /**
     * Verify user credentials via Supabase Auth (Async)
     * @param {string} email - User email
     * @param {string} pass - Password
     * @returns {Promise<Object|null>} User profile or null
     */
    async verifyCredentials(email, pass) {
        SystemLogger.log('AUTH_ATTEMPT', 'SECURITY', `Login attempt for ${email}`);
        
        try {
            // First, try to find the user in the 'customers' table (simulation)
            const users = await StorageEngine.find('users', { email: email });
            
            if (users.length > 0) {
                // Simulation: Any password works for the seeded user for now
                // In Phase 9, we would use supabase.auth.signInWithPassword
                SystemLogger.log('AUTH_SUCCESS', 'SECURITY', `Authenticated ${email}`);
                return users[0];
            }
            
            SystemLogger.log('AUTH_FAILED', 'SECURITY', `User not found: ${email}`, 'WARN');
            return null; 
        } catch (error) {
            SystemLogger.log('AUTH_ERROR', 'SECURITY', error.message, 'ERROR');
            return null;
        }
    },

    // ================================================================
    // SESSION PROTECTION
    // ================================================================

    /**
     * Validate session is still active
     * @returns {boolean}
     */
    validateSession() {
        const session = StorageEngine.getSession();
        if (!session) return false;

        // Check session freshness (30 minute timeout simulation)
        if (session._loginTime) {
            const elapsed = Date.now() - new Date(session._loginTime).getTime();
            const thirtyMinutes = 30 * 60 * 1000;
            if (elapsed > thirtyMinutes) {
                SystemLogger.log('SESSION_EXPIRED', 'SECURITY', 'Session expired after 30 minutes of inactivity.', 'WARN');
                StorageEngine.clearSession();
                return false;
            }
        }

        return true;
    },

    // ================================================================
    // CODE GENERATION (Admin)
    // ================================================================

    /**
     * Generate a security code
     * @param {string} prefix - Code prefix (COT, TAX, IRS)
     * @returns {string} Generated code
     */
    generateCode(prefix) {
        const chars = 'ABCDEF0123456789';
        let code = prefix + '-';
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        code += '-';
        for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    },

    /**
     * Generate a complete code set for an account (Async)
     * @param {string} accountId - Account ID
     * @param {string} customer - Customer name
     * @returns {Promise<Object>} Generated code set
     */
    async generateCodeSet(accountId, customer) {
        const codeSet = {
            accountId,
            customer,
            cotCode: this.generateCode('COT'),
            taxCode: this.generateCode('TAX'),
            irsCode: this.generateCode('IRS'),
            status: 'active'
        };

        const recorded = await StorageEngine.insert('transferCodes', codeSet);

        SystemLogger.log('CODE_GENERATED', 'SECURITY', `Code set generated for ${customer} (${accountId})`);
        return recorded;
    }
};
