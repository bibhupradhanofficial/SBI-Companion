/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface UserProfile {
  id: string
  name: string
  age?: number
  income_range?: string
  employment_type?: string
  city?: string
  state?: string
  goals?: string[]
  monthly_savings?: number
  existing_investments?: string[]
  existing_insurance?: string[]
  loans?: string[]
  credit_score_range?: string
  payment_frequency?: string
  last_digest_shown?: string
}

interface GoalProgress {
  id: string
  user_id: string
  goal_name: string
  progress_percent: number
  target_amount: number
  current_amount: number
  updated_at: string
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { user_profile, goals_progress, user_id } = await req.json()

    if (!user_id && !user_profile?.id) {
      throw new Error("Missing user identification in request body")
    }

    const userId = user_id || user_profile.id
    const profile: UserProfile = user_profile || {}
    const goals: GoalProgress[] = goals_progress || []

    // 1. Initialize Supabase client if Auth Header is present
    let supabaseClient;
    const authHeader = req.headers.get("Authorization")
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")

    if (authHeader && supabaseUrl && supabaseAnonKey) {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      })
    }

    // 2. Fetch existing nudges from Database to check is_dismissed status
    let dbNudges: any[] = []
    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("nudges")
        .select("*")
        .eq("user_id", userId)
      if (!error && data) {
        dbNudges = data
      }
    }

    // 3. Evaluate rules in order
    const triggeredNudges: Array<{
      rule_id: string
      severity: "high" | "medium" | "low"
      message: string
      action_url: string
    }> = []

    // Rule 1: INSURANCE_GAP
    const existingInsurance = profile.existing_insurance || []
    const hasLifeInsurance = existingInsurance.some(i => i.toLowerCase().includes("life"))
    const hasNoneInsurance = existingInsurance.includes("None") || existingInsurance.length === 0
    if (!hasLifeInsurance || hasNoneInsurance) {
      triggeredNudges.push({
        rule_id: "INSURANCE_GAP",
        severity: "high",
        message: "No life insurance detected. A ₹1Cr term plan costs just ₹489/month — protect your family today.",
        action_url: "/insurance"
      })
    }

    // Rule 2: NO_INVESTMENTS
    const existingInvestments = profile.existing_investments || []
    const hasInvestments = existingInvestments.length > 0 && !existingInvestments.includes("None")
    if (!hasInvestments) {
      triggeredNudges.push({
        rule_id: "NO_INVESTMENTS",
        severity: "high",
        message: "Your savings aren't growing. Start a ₹500 SIP and let compounding work for you.",
        action_url: "/investments"
      })
    }

    // Rule 3: LOW_SAVINGS
    const monthlySavings = Number(profile.monthly_savings || 0)
    const incomeRange = profile.income_range || ""
    const isLowestIncome = incomeRange === "<25k"
    if (monthlySavings < 5000 && !isLowestIncome && profile.monthly_savings !== undefined) {
      triggeredNudges.push({
        rule_id: "LOW_SAVINGS",
        severity: "medium",
        message: "You could be saving more. Try the 50-30-20 rule — 20% of income to savings.",
        action_url: "/agent?prompt=help me save more"
      })
    }

    // Rule 4: CREDIT_SCORE_LOW
    const creditScore = profile.credit_score_range || ""
    if (creditScore === "Poor") {
      triggeredNudges.push({
        rule_id: "CREDIT_SCORE_LOW",
        severity: "high",
        message: "A low credit score limits your loan eligibility. Companion can help you build it up.",
        action_url: "/agent?prompt=improve credit score"
      })
    }

    // Rule 5: NO_HEALTH_INSURANCE
    const hasHealthInsurance = existingInsurance.some(i => i.toLowerCase().includes("health"))
    if (!hasHealthInsurance || hasNoneInsurance) {
      triggeredNudges.push({
        rule_id: "NO_HEALTH_INSURANCE",
        severity: "high",
        message: "Medical emergencies can drain savings in days. A ₹5L health cover starts at ₹750/month.",
        action_url: "/insurance"
      })
    }

    // Rule 6: PAYMENT_NUDGE
    const paymentFrequency = profile.payment_frequency || ""
    if (paymentFrequency === "Rarely") {
      triggeredNudges.push({
        rule_id: "PAYMENT_NUDGE",
        severity: "low",
        message: "Set up UPI AutoPay for bills — never pay a late fee again.",
        action_url: "/payments"
      })
    }

    // Rule 7: RETIREMENT_PLANNING
    const userAge = Number(profile.age || 0)
    const userGoals = profile.goals || []
    const wantsRetirement = userGoals.includes("retirement")
    const hasPpfOrPension = existingInvestments.some(i => {
      const l = i.toLowerCase()
      return l.includes("ppf") || l.includes("pension") || l.includes("retirement")
    })
    if (userAge > 35 && wantsRetirement && !hasPpfOrPension) {
      triggeredNudges.push({
        rule_id: "RETIREMENT_PLANNING",
        severity: "medium",
        message: "At 35+, retirement planning becomes urgent. SBI Retire Smart helps you build a corpus.",
        action_url: "/investments"
      })
    }

    // Rule 8: GOAL_STAGNANT
    const stagnantGoal = goals.find(g => {
      if (g.progress_percent !== 0) return false
      const updatedTime = new Date(g.updated_at).getTime()
      const diffDays = (Date.now() - updatedTime) / (24 * 3600 * 1000)
      return diffDays >= 30
    })
    if (stagnantGoal) {
      const goalLabels: { [key: string]: string } = {
        save: "Save money regularly",
        invest: "Invest for wealth creation",
        insurance: "Get insurance coverage",
        payments: "Simplify daily payments",
        retirement: "Plan for retirement",
        home_vehicle: "Buy a home or vehicle",
        education: "Children's education planning"
      }
      const gName = goalLabels[stagnantGoal.goal_name] || stagnantGoal.goal_name
      triggeredNudges.push({
        rule_id: `GOAL_STAGNANT_${stagnantGoal.goal_name}`,
        severity: "low",
        message: `Your goal '${gName}' hasn't moved. Let Companion suggest a plan.`,
        action_url: "/agent"
      })
    }

    // 4. Sync triggers with database and filter dismissed nudges
    const finalNudges: any[] = []

    for (const trig of triggeredNudges) {
      const existingDb = dbNudges.find(n => n.rule_id === trig.rule_id)

      if (existingDb) {
        // If it was already dismissed in database, we skip it
        if (existingDb.is_dismissed) {
          continue
        }
        // If not dismissed, we use the DB entry
        finalNudges.push(existingDb)
      } else {
        // Create new nudge entry
        const newNudge = {
          user_id: userId,
          rule_id: trig.rule_id,
          severity: trig.severity,
          message: trig.message,
          action_url: trig.action_url,
          is_dismissed: false,
          shown_at: new Date().toISOString(),
        }

        if (supabaseClient) {
          try {
            const { data, error } = await supabaseClient
              .from("nudges")
              .insert(newNudge)
              .select()
              .single()
            if (!error && data) {
              finalNudges.push(data)
              continue
            }
          } catch {
            // Ignore DB insert error and push to memory list
          }
        }

        // Push in-memory fallback representation
        finalNudges.push({
          id: "nudge_mem_" + Math.random().toString(36).substring(2, 11),
          ...newNudge,
          dismissed_at: null
        })
      }
    }

    // Sort: HIGH first, then MEDIUM, then LOW. Within same severity, preserve rule order.
    const severityWeight = { high: 3, medium: 2, low: 1 }
    finalNudges.sort((a, b) => {
      const weightA = severityWeight[a.severity as "high" | "medium" | "low"] || 0
      const weightB = severityWeight[b.severity as "high" | "medium" | "low"] || 0
      return weightB - weightA
    })

    // Take top 3
    const topNudges = finalNudges.slice(0, 3)

    return new Response(JSON.stringify(topNudges), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    console.error("Nudge engine error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})
