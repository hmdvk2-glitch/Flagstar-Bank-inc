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
          name: string
          email: string
          account_number: string
          balance: number
          role: 'admin' | 'member'
          kyc_status: string
          pin_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          account_number: string
          balance?: number
          role?: 'admin' | 'member'
          kyc_status?: string
          pin_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          account_number?: string
          balance?: number
          role?: 'admin' | 'member'
          kyc_status?: string
          pin_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          customer_id: string
          type: string
          account_number: string
          balance: number
          status: string
          created_at: string
        }
      }
      transactions: {
        Row: {
          id: string
          account_id: string
          from_account: string | null
          to_account: string | null
          amount: number
          type: string
          description: string | null
          category: string | null
          status: string
          stage: string
          created_at: string
        }
      }
      admin_codes: {
        Row: {
          id: string
          account_id: string
          transaction_id: string | null
          cot_code: string | null
          tax_code: string | null
          irs_code: string | null
          created_by: string | null
          created_at: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          target_id: string | null
          details: Json | null
          created_at: string
        }
      }
    }
  }
}
