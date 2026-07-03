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
      profiles: {
        Row: {
          id: string
          name: string
          age: number | null
          income_range: string | null
          employment_type: string | null
          city: string | null
          state: string | null
          goals: Json
          monthly_savings: number | null
          existing_investments: Json
          existing_insurance: Json
          loans: Json
          credit_score_range: string | null
          banking_apps: Json
          payment_frequency: string | null
          banking_worry: string | null
          communication_style: string | null
          preferred_language: string | null
          nudges_enabled: boolean
          onboarding_complete: boolean
          last_digest_shown: string | null
          phone: string | null
          dob: string | null
          pan: string | null
          created_at: string
          updated_at: string
          has_credit_card: boolean
          existing_credit_card: string | null
        }
        Insert: {
          id: string
          name: string
          age?: number | null
          income_range?: string | null
          employment_type?: string | null
          city?: string | null
          state?: string | null
          goals?: Json
          monthly_savings?: number | null
          existing_investments?: Json
          existing_insurance?: Json
          loans?: Json
          credit_score_range?: string | null
          banking_apps?: Json
          payment_frequency?: string | null
          banking_worry?: string | null
          communication_style?: string | null
          preferred_language?: string | null
          nudges_enabled?: boolean
          onboarding_complete?: boolean
          last_digest_shown?: string | null
          phone?: string | null
          dob?: string | null
          pan?: string | null
          created_at?: string
          updated_at?: string
          has_credit_card?: boolean
          existing_credit_card?: string | null
        }
        Update: {
          id?: string
          name?: string
          age?: number | null
          income_range?: string | null
          employment_type?: string | null
          city?: string | null
          state?: string | null
          goals?: Json
          monthly_savings?: number | null
          existing_investments?: Json
          existing_insurance?: Json
          loans?: Json
          credit_score_range?: string | null
          banking_apps?: Json
          payment_frequency?: string | null
          banking_worry?: string | null
          communication_style?: string | null
          preferred_language?: string | null
          nudges_enabled?: boolean
          onboarding_complete?: boolean
          last_digest_shown?: string | null
          phone?: string | null
          dob?: string | null
          pan?: string | null
          created_at?: string
          updated_at?: string
          has_credit_card?: boolean
          existing_credit_card?: string | null
        }
      }
      goal_progress: {
        Row: {
          id: string
          user_id: string
          goal_name: string
          progress_percent: number
          target_amount: number
          current_amount: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_name: string
          progress_percent?: number
          target_amount: number
          current_amount?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_name?: string
          progress_percent?: number
          target_amount?: number
          current_amount?: number
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: "payment" | "investment" | "insurance" | "agent"
          description: string
          amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "payment" | "investment" | "insurance" | "agent"
          description: string
          amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "payment" | "investment" | "insurance" | "agent"
          description?: string
          amount?: number | null
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          tool_uses: Json
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: "user" | "assistant"
          content: string
          tool_uses?: Json
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: "user" | "assistant"
          content?: string
          tool_uses?: Json
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: "upi" | "neft" | "imps" | "rtgs"
          recipient_name: string
          recipient_id: string
          amount: number
          purpose: string
          note: string | null
          status: "success" | "pending" | "failed"
          reference_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "upi" | "neft" | "imps" | "rtgs"
          recipient_name: string
          recipient_id: string
          amount: number
          purpose: string
          note?: string | null
          status: "success" | "pending" | "failed"
          reference_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "upi" | "neft" | "imps" | "rtgs"
          recipient_name?: string
          recipient_id?: string
          amount?: number
          purpose?: string
          note?: string | null
          status?: "success" | "pending" | "failed"
          reference_id?: string
          created_at?: string
        }
      }
      beneficiaries: {
        Row: {
          id: string
          user_id: string
          name: string
          account_or_upi: string
          bank_name: string | null
          ifsc: string | null
          type: "upi" | "bank"
          is_favourite: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          account_or_upi: string
          bank_name?: string | null
          ifsc?: string | null
          type: "upi" | "bank"
          is_favourite?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          account_or_upi?: string
          bank_name?: string | null
          ifsc?: string | null
          type?: "upi" | "bank"
          is_favourite?: boolean
          created_at?: string
        }
      }
      user_investments: {
        Row: {
          id: string
          user_id: string
          fund_name: string
          fund_type: "Equity" | "Debt" | "Hybrid" | "ELSS" | "Gold"
          invested_amount: number
          current_value: number
          units: number
          nav: number
          sip_amount: number | null
          sip_date: number | null
          status: "active" | "paused" | "stopped"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fund_name: string
          fund_type: "Equity" | "Debt" | "Hybrid" | "ELSS" | "Gold"
          invested_amount: number
          current_value: number
          units: number
          nav: number
          sip_amount?: number | null
          sip_date?: number | null
          status: "active" | "paused" | "stopped"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fund_name?: string
          fund_type?: "Equity" | "Debt" | "Hybrid" | "ELSS" | "Gold"
          invested_amount?: number
          current_value?: number
          units?: number
          nav?: number
          sip_amount?: number | null
          sip_date?: number | null
          status?: "active" | "paused" | "stopped"
          created_at?: string
        }
      }
      user_insurance: {
        Row: {
          id: string
          user_id: string
          type: "life" | "health" | "vehicle" | "critical"
          provider: string
          policy_number: string
          sum_assured: number
          premium_amount: number
          premium_frequency: "monthly" | "annual"
          start_date: string
          end_date: string
          status: "active" | "expired" | "lapsed"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: "life" | "health" | "vehicle" | "critical"
          provider: string
          policy_number: string
          sum_assured: number
          premium_amount: number
          premium_frequency: "monthly" | "annual"
          start_date: string
          end_date: string
          status: "active" | "expired" | "lapsed"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: "life" | "health" | "vehicle" | "critical"
          provider?: string
          policy_number?: string
          sum_assured?: number
          premium_amount?: number
          premium_frequency?: "monthly" | "annual"
          start_date?: string
          end_date?: string
          status?: "active" | "expired" | "lapsed"
          created_at?: string
        }
      }
      nudges: {
        Row: {
          id: string
          user_id: string
          rule_id: string
          severity: "high" | "medium" | "low"
          message: string
          action_url: string
          is_dismissed: boolean
          shown_at: string
          dismissed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rule_id: string
          severity: "high" | "medium" | "low"
          message: string
          action_url: string
          is_dismissed?: boolean
          shown_at?: string
          dismissed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rule_id?: string
          severity?: "high" | "medium" | "low"
          message?: string
          action_url?: string
          is_dismissed?: boolean
          shown_at?: string
          dismissed_at?: string | null
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          daily_upi_limit: number
          daily_atm_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_upi_limit?: number
          daily_atm_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_upi_limit?: number
          daily_atm_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
