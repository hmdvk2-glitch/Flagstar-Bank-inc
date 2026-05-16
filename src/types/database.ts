export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          full_name: string
          name?: string
          email: string
          account_number: string
          balance: number
          role: 'admin' | 'customer'
          kyc_status: string
          pin: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          name?: string
          email: string
          account_number: string
          balance?: number
          role?: 'admin' | 'customer'
          kyc_status?: string
          pin: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          name?: string
          email?: string
          account_number?: string
          balance?: number
          role?: 'admin' | 'customer'
          kyc_status?: string
          pin?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          customer_id: string
          from_account: string | null
          to_account: string | null
          amount: number
          type: 'credit' | 'debit'
          narration: string | null
          status: string
          stage: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          from_account?: string | null
          to_account?: string | null
          amount: number
          type: 'credit' | 'debit'
          narration?: string | null
          status?: string
          stage?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          from_account?: string | null
          to_account?: string | null
          amount?: number
          type?: 'credit' | 'debit'
          narration?: string | null
          status?: string
          stage?: string
          created_at?: string
        }
      }
      transfer_codes: {
        Row: {
          id: string
          customer_id: string
          cot_code: string | null
          cot_enabled: boolean
          tax_code: string | null
          tax_enabled: boolean
          irs_code: string | null
          irs_enabled: boolean
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          cot_code?: string | null
          cot_enabled?: boolean
          tax_code?: string | null
          tax_enabled?: boolean
          irs_code?: string | null
          irs_enabled?: boolean
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          cot_code?: string | null
          cot_enabled?: boolean
          tax_code?: string | null
          tax_enabled?: boolean
          irs_code?: string | null
          irs_enabled?: boolean
          status?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          actor: string
          action: string
          target: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor: string
          action: string
          target?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor?: string
          action?: string
          target?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}
