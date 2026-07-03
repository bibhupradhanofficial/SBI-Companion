/**
 * supabase-service.ts
 * Centralized service layer for all Supabase database operations.
 * Every table has typed CRUD helpers — no localStorage anywhere.
 */
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

// ─── Type aliases ──────────────────────────────────────────────────────────────
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export type GoalProgress = Database["public"]["Tables"]["goal_progress"]["Row"]
export type Activity = Database["public"]["Tables"]["activities"]["Row"]
export type ActivityInsert = Database["public"]["Tables"]["activities"]["Insert"]

export type Conversation = Database["public"]["Tables"]["conversations"]["Row"]
export type ConversationInsert = Database["public"]["Tables"]["conversations"]["Insert"]

export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"]
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"]

export type Beneficiary = Database["public"]["Tables"]["beneficiaries"]["Row"]
export type BeneficiaryInsert = Database["public"]["Tables"]["beneficiaries"]["Insert"]

export type UserInvestment = Database["public"]["Tables"]["user_investments"]["Row"]
export type UserInvestmentInsert = Database["public"]["Tables"]["user_investments"]["Insert"]
export type UserInvestmentUpdate = Database["public"]["Tables"]["user_investments"]["Update"]

export type UserInsurance = Database["public"]["Tables"]["user_insurance"]["Row"]
export type UserInsuranceInsert = Database["public"]["Tables"]["user_insurance"]["Insert"]
export type UserInsuranceUpdate = Database["public"]["Tables"]["user_insurance"]["Update"]

export type Nudge = Database["public"]["Tables"]["nudges"]["Row"]
export type NudgeInsert = Database["public"]["Tables"]["nudges"]["Insert"]

// ─── Generic error wrapper ─────────────────────────────────────────────────────
function handleError(error: unknown): never {
  if (error instanceof Error) throw error
  throw new Error(String(error))
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILES
// ═══════════════════════════════════════════════════════════════════════════════
export const profilesService = {
  async get(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (error) {
      // Not found (PGRST116) means no profile yet — return null
      if (error.code === "PGRST116") return null
      handleError(error)
    }
    return data
  },

  async upsert(profile: ProfileInsert): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(profile)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async update(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOAL PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════
export const goalsService = {
  async list(userId: string): Promise<GoalProgress[]> {
    const { data, error } = await supabase
      .from("goal_progress")
      .select("*")
      .eq("user_id", userId)
    if (error) handleError(error)
    return data ?? []
  },

  async upsert(
    userId: string,
    goalName: string,
    currentAmount: number,
    targetAmount: number
  ): Promise<GoalProgress> {
    const progressPercent = Math.min(
      100,
      Math.round((currentAmount / targetAmount) * 100)
    )

    // Check if row exists
    const { data: existing } = await supabase
      .from("goal_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("goal_name", goalName)
      .maybeSingle()

    const payload = {
      user_id: userId,
      goal_name: goalName,
      current_amount: currentAmount,
      target_amount: targetAmount,
      progress_percent: progressPercent,
      updated_at: new Date().toISOString(),
    }

    if (existing?.id) {
      const { data, error } = await supabase
        .from("goal_progress")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single()
      if (error) handleError(error)
      return data!
    } else {
      const { data, error } = await supabase
        .from("goal_progress")
        .insert(payload)
        .select()
        .single()
      if (error) handleError(error)
      return data!
    }
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVITIES
// ═══════════════════════════════════════════════════════════════════════════════
export const activitiesService = {
  async list(userId: string, limit = 10): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) handleError(error)
    return data ?? []
  },

  async add(activity: ActivityInsert): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .insert(activity)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════════════════════════════════════
export const conversationsService = {
  async list(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) handleError(error)
    return data ?? []
  },

  async create(userId: string, title: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title })
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async delete(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId)
    if (error) handleError(error)
  },

  async updateTitle(conversationId: string, title: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", conversationId)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════
export const messagesService = {
  async list(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
    if (error) handleError(error)
    return data ?? []
  },

  async add(message: MessageInsert): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert(message)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async deleteByConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId)
    if (error) handleError(error)
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export const transactionsService = {
  async list(userId: string, limit = 50): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) handleError(error)
    return data ?? []
  },

  /** Transactions from the last N days */
  async listRecent(userId: string, days = 7): Promise<Transaction[]> {
    const since = new Date(Date.now() - days * 24 * 3600000).toISOString()
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
    if (error) handleError(error)
    return data ?? []
  },

  async add(transaction: TransactionInsert): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transaction)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENEFICIARIES
// ═══════════════════════════════════════════════════════════════════════════════
export const beneficiariesService = {
  async list(userId: string): Promise<Beneficiary[]> {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) handleError(error)
    return data ?? []
  },

  async add(beneficiary: BeneficiaryInsert): Promise<Beneficiary> {
    const { data, error } = await supabase
      .from("beneficiaries")
      .insert(beneficiary)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async toggleFavourite(id: string, isFavourite: boolean): Promise<Beneficiary> {
    const { data, error } = await supabase
      .from("beneficiaries")
      .update({ is_favourite: isFavourite })
      .eq("id", id)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("beneficiaries").delete().eq("id", id)
    if (error) handleError(error)
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER INVESTMENTS
// ═══════════════════════════════════════════════════════════════════════════════
export const investmentsService = {
  async list(userId: string): Promise<UserInvestment[]> {
    const { data, error } = await supabase
      .from("user_investments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) handleError(error)
    return data ?? []
  },

  async add(investment: UserInvestmentInsert): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from("user_investments")
      .insert(investment)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async update(id: string, updates: UserInvestmentUpdate): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from("user_investments")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("user_investments")
      .delete()
      .eq("id", id)
    if (error) handleError(error)
  },

  async updateSip(
    id: string,
    sipAmount: number | null,
    sipDate: number | null
  ): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from("user_investments")
      .update({ sip_amount: sipAmount, sip_date: sipDate })
      .eq("id", id)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async updateStatus(
    id: string,
    status: "active" | "paused" | "stopped"
  ): Promise<UserInvestment> {
    const { data, error } = await supabase
      .from("user_investments")
      .update({ status })
      .eq("id", id)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER INSURANCE
// ═══════════════════════════════════════════════════════════════════════════════
export const insuranceService = {
  async list(userId: string): Promise<UserInsurance[]> {
    const { data, error } = await supabase
      .from("user_insurance")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (error) handleError(error)
    return data ?? []
  },

  async add(policy: UserInsuranceInsert): Promise<UserInsurance> {
    const { data, error } = await supabase
      .from("user_insurance")
      .insert(policy)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async update(id: string, updates: UserInsuranceUpdate): Promise<UserInsurance> {
    const { data, error } = await supabase
      .from("user_insurance")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("user_insurance")
      .delete()
      .eq("id", id)
    if (error) handleError(error)
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// NUDGES
// ═══════════════════════════════════════════════════════════════════════════════
export const nudgesService = {
  async listActive(userId: string): Promise<Nudge[]> {
    const { data, error } = await supabase
      .from("nudges")
      .select("*")
      .eq("user_id", userId)
      .eq("is_dismissed", false)
      .order("created_at", { ascending: false })
    if (error) handleError(error)
    return data ?? []
  },

  async add(nudge: NudgeInsert): Promise<Nudge> {
    const { data, error } = await supabase
      .from("nudges")
      .insert(nudge)
      .select()
      .single()
    if (error) handleError(error)
    return data!
  },

  /** Dismiss a single nudge by nudge row id */
  async dismissById(id: string): Promise<void> {
    const { error } = await supabase
      .from("nudges")
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq("id", id)
    if (error) handleError(error)
  },

  /** Dismiss a nudge by userId + ruleId — used by Dashboard computed nudges */
  async dismiss(userId: string, ruleId: string): Promise<void> {
    const { error } = await supabase
      .from("nudges")
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("rule_id", ruleId)
    if (error) handleError(error)
  },

  /** Dismiss multiple nudges by ruleIds */
  async dismissAll(userId: string, ruleIds: string[]): Promise<void> {
    if (ruleIds.length === 0) return
    const { error } = await supabase
      .from("nudges")
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .in("rule_id", ruleIds)
    if (error) handleError(error)
  },

  async dismissByRuleId(userId: string, ruleId: string): Promise<void> {
    const { error } = await supabase
      .from("nudges")
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("rule_id", ruleId)
    if (error) handleError(error)
  },

  /** Return list of rule_ids that are already dismissed (for local filtering) */
  async getDismissedRuleIds(userId: string): Promise<string[]> {
    if (!userId) return []
    const { data, error } = await supabase
      .from("nudges")
      .select("rule_id")
      .eq("user_id", userId)
      .eq("is_dismissed", true)
    if (error) handleError(error)
    return (data ?? []).map(r => r.rule_id).filter(Boolean) as string[]
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// USER SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
export type UserSetting = Database["public"]["Tables"]["user_settings"]["Row"]
export type UserSettingInsert = Database["public"]["Tables"]["user_settings"]["Insert"]
export type UserSettingUpdate = Database["public"]["Tables"]["user_settings"]["Update"]

export const userSettingsService = {
  async get(userId: string): Promise<UserSetting | null> {
    if (!userId) return null
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
    if (error) {
      console.error("userSettingsService.get error:", error)
      return null
    }
    return data
  },

  async upsert(userId: string, upiLimit: number, atmLimit: number): Promise<UserSetting> {
    const { data: existing } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    const payload = {
      user_id: userId,
      daily_upi_limit: upiLimit,
      daily_atm_limit: atmLimit,
      updated_at: new Date().toISOString()
    }

    if (existing?.id) {
      const { data, error } = await supabase
        .from("user_settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single()
      if (error) handleError(error)
      return data!
    } else {
      const { data, error } = await supabase
        .from("user_settings")
        .insert(payload)
        .select()
        .single()
      if (error) handleError(error)
      return data!
    }
  }
}

