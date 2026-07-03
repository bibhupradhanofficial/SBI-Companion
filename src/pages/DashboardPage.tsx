/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { transactionsService, nudgesService } from "@/lib/supabase-service"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  TrendingUp,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  Bell,
  Wallet,
  ArrowRight,
  X,
  Compass,
  AlertTriangle,
  LogOut,
  Smartphone,
  HelpCircle,
  Sparkles
} from "lucide-react"

export const DashboardPage: React.FC = () => {
  const [showAboutModal, setShowAboutModal] = useState(false)
  const {
    user,
    profile,
    goalsProgress,
    activities,
    signOut,
    updateGoalProgress,
    addActivity,
    updateProfile
  } = useAuth()
  const navigate = useNavigate()

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Nudge states
  const [nudges, setNudges] = useState<any[]>([])
  const [nudgesLoading, setNudgesLoading] = useState(true)

  // Weekly Digest states
  const [showWeeklyDigest, setShowWeeklyDigest] = useState(false)
  const [digestData, setDigestData] = useState<any>(null)

  // Goals modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [selectedGoalForUpdate, setSelectedGoalForUpdate] = useState("")
  const [currentAmountInput, setCurrentAmountInput] = useState("")
  const [targetAmountInput, setTargetAmountInput] = useState("")
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false)

  const userName = profile?.name || user?.user_metadata?.full_name || "Valued Customer"

  // 1. Translation layer
  const t = (key: string) => {
    const isHindi = profile?.preferred_language === "Hindi"
    if (!isHindi) return key

    const translations: { [key: string]: string } = {
      // Top bar
      "Good morning": "शुभ प्रभात",
      "Valued Customer": "प्रिय ग्राहक",
      // Health score
      "Financial Health Score": "वित्तीय स्वास्थ्य स्कोर",
      "Needs Review": "समीक्षा की आवश्यकता",
      "Fair Security": "मध्यम सुरक्षा",
      "Excellent": "उत्कृष्ट",
      "Companion Analysis Tips": "साथी विश्लेषण सुझाव",
      "Calculated based on savings depth, covers, and debt ratios.": "बचत गहराई, बीमा कवर और ऋण अनुपात के आधार पर गणना की गई।",
      "Improve Score via SBI AI": "एआई साथी के साथ स्कोर सुधारें",
      // Quick Actions
      "Quick Actions": "त्वरित कार्य",
      "Pay / Transfer": "भुगतान / ट्रांसफर",
      "Start SIP": "एसआईपी शुरू करें",
      "Check Insurance": "बीमा जांचें",
      "Talk to Companion": "साथी से बात करें",
      // Goals
      "Goals Progress": "लक्ष्यों की प्रगति",
      "Wealth Focus": "संपत्ति संवर्धन",
      "Update progress": "प्रगति अपडेट करें",
      "Save money regularly": "नियमित बचत करें",
      "Invest for wealth": "सम्पत्ति संवर्धन",
      "Get insurance coverage": "बीमा कवरेज",
      "Simplify daily payments": "दैनिक भुगतान",
      "Plan for retirement": "सेवानिवृत्ति योजना",
      "Buy home/vehicle": "घर/वाहन खरीदें",
      "Kids education planning": "शिक्षा योजना",
      "No active goals. Add goals in profile setup to track them.": "कोई सक्रिय लक्ष्य नहीं। उन्हें ट्रैक करने के लिए प्रोफ़ाइल में लक्ष्य जोड़ें।",
      // Suggests & Stats
      "Companion Suggests 💡": "साथी का सुझाव 💡",
      "Your safety and financial layout is fully aligned. Great job!": "आपकी सुरक्षा और वित्तीय ढांचा पूरी तरह से संरेखित है। बहुत बढ़िया!",
      "Banking Statistics": "बैंकिंग आंकड़े",
      "Average Savings": "औसत बचत",
      "Active Investments": "सक्रिय निवेश",
      "Insurance Policies": "सक्रिय बीमा",
      // Recent activities
      "Recent Activities": "हालिया गतिविधियां",
      "View All": "सभी देखें",
      "No activity yet. Start by talking to Companion.": "अभी कोई गतिविधि नहीं है। साथी से बात करके शुरुआत करें।",
      // Banner strips & Notifications
      "Complete your profile onboarding": "अपना प्रोफ़ाइल ऑनबोर्डिंग पूरा करें",
      "Set up your financial objectives to enable the agent to analyze records.": "एजेंट को रिकॉर्ड का विश्लेषण करने में सक्षम बनाने के लिए अपने वित्तीय उद्देश्य सेट करें।",
      "Setup Now": "अभी सेट करें",
      "Action Required: Establish Health/Life Safety Net": "कार्रवाई आवश्यक: स्वास्थ्य/जीवन सुरक्षा चक्र बनाएं",
      "Your profile specifies zero active policies. A single health emergency could disrupt your long-term plan.": "आपके प्रोफ़ाइल में शून्य सक्रिय नीतियां हैं। एक भी स्वास्थ्य आपातकाल आपके दीर्घकालिक लक्ष्य को प्रभावित कर सकता है।",
      "Bridge Gap": "अंतर को पाटें",
      "Explore Funds": "म्यूचुअल फंड देखें",
      "Based on your wealth creation goal, explore SBI's top-performing mutual funds and start compounding your wealth today.": "अपने संपत्ति संवर्धन लक्ष्य के आधार पर, एसबीआई के शीर्ष म्यूचुअल फंड देखें और आज ही अपनी संपत्ति बढ़ाएं।",
      "Take Action": "कार्रवाई करें",
      "Alerts & Tips": "अलर्ट और सुझाव",
      "Clear All": "सभी हटाएं",
      "No active alerts.": "कोई सक्रिय अलर्ट नहीं।",
      "Notifications": "सूचनाएं",
      "Mark all as read": "सभी पढ़े हुए मार्क करें",
      "You're all caught up! Companion is watching over your finances 🎉": "आप पूरी तरह अपडेट हैं! साथी आपकी वित्तीय स्थिति पर नज़र रखे हुए है 🎉",
      "Dismiss": "खारिज करें",
      // Weekly Digest
      "This Week with Companion": "इस सप्ताह साथी के साथ",
      "Summary of your weekly financial progress": "आपकी साप्ताहिक वित्तीय प्रगति का विवरण",
      "Transactions": "लेन-देन",
      "Volume": "कुल राशि",
      "Score Change": "स्कोर में बदलाव",
      "New Nudges": "नए सुझाव",
      "Motivational Quote": "प्रेरक सुझाव",
      "View Full Report": "पूरी रिपोर्ट देखें",
      "Here's a breakdown of your financial activities and safety progress over the last 7 days.": "पिछले 7 दिनों में आपकी वित्तीय गतिविधियों और सुरक्षा प्रगति का विवरण इस प्रकार है।",
      "Weekly Summary": "साप्ताहिक सारांश",
      "Current Score": "वर्तमान स्कोर",
      "Critical Alert": "महत्वपूर्ण चेतावनी",
      // Sidebar
      "Home": "होम",
      "SBI AI": "एआई साथी",
      "Payments": "भुगतान",
      "Investments": "निवेश",
      "Insurance": "बीमा",
      "Support": "सहायता",
      "Profile": "प्रोफ़ाइल",
      "Logout": "लॉगआउट",
      "Sign Out": "साइन आउट",
      "My Profile": "मेरी प्रोफ़ाइल",
      // Improvement Tips
      "Establish a monthly savings goal of at least ₹5,000 to earn +10 points.": "बचत स्कोर में +10 अंक जोड़ने के लिए कम से कम ₹5,000 का मासिक बचत लक्ष्य निर्धारित करें।",
      "Diversify with FDs or Mutual Funds SIPs to add up to +15 points.": "+15 अंक जोड़ने के लिए एफडी या म्यूचुअल फंड एसआईपी के साथ विविधता लाएं।",
      "Set up medical and term insurance coverages to earn +10 points.": "+10 अंक प्राप्त करने के लिए चिकित्सा और टर्म जीवन बीमा कवर स्थापित करें।",
      "Add an extra safety layer (Term life plan) to optimize coverage points.": "कवरेज अंकों को अनुकूलित करने के लिए एक अतिरिक्त सुरक्षा परत (टर्म प्लान) जोड़ें।",
      "Consolidate high-interest loan balances to reduce debt score deductions.": "ऋण स्कोर में कटौती को कम करने के लिए उच्च ब्याज वाले ऋण शेष को समेकित करें।",
      "Make digital credit payments consistently on due dates to boost credit range.": "क्रेडिट सीमा को बढ़ावा देने के लिए देय तिथियों पर लगातार डिजिटल क्रेडिट भुगतान करें।",
      "Utilize Companion conversation budgets to track miscellaneous spending.": "विविध खर्चों को ट्रैक करने के लिए साथी वार्तालाप बजट का उपयोग करें।"
    }

    if (translations[key]) return translations[key]

    if (key.startsWith("Good morning, ")) {
      const name = key.replace("Good morning, ", "")
      return `शुभ प्रभात, ${name}`
    }

    return key
  }

  // 2. Nudge processing text helper
  const processNudgeText = (nudge: any, preferredLanguage: string | null | undefined, communicationStyle: string | null | undefined) => {
    const isHindi = preferredLanguage === "Hindi"
    const isBrief = communicationStyle === "Brief & Direct"

    const ruleKey = nudge.rule_id.startsWith("GOAL_STAGNANT_") ? "GOAL_STAGNANT" : nudge.rule_id

    const data: {
      [key: string]: {
        en: string
        en_brief: string
        hi: string
        hi_brief: string
      }
    } = {
      INSURANCE_GAP: {
        en: "No life insurance detected. A ₹1Cr term plan costs just ₹489/month — protect your family today.",
        en_brief: "Protect your family with a ₹1Cr life cover for ₹489/mo.",
        hi: "कोई जीवन बीमा नहीं मिला। ₹1 करोड़ का टर्म प्लान सिर्फ ₹489/माह से शुरू — आज ही अपने परिवार को सुरक्षित करें।",
        hi_brief: "₹489/माह में ₹1 करोड़ का जीवन बीमा लें।"
      },
      NO_INVESTMENTS: {
        en: "Your savings aren't growing. Start a ₹500 SIP and let compounding work for you.",
        en_brief: "Start a ₹500 SIP today to grow your savings.",
        hi: "आपकी बचत बढ़ नहीं रही है। ₹500 का SIP शुरू करें और चक्रवृद्धि ब्याज का लाभ उठाएं।",
        hi_brief: "अपनी बचत बढ़ाने के लिए ₹500 का SIP शुरू करें।"
      },
      LOW_SAVINGS: {
        en: "You could be saving more. Try the 50-30-20 rule — 20% of income to savings.",
        en_brief: "Apply the 50-30-20 rule to save 20% of income.",
        hi: "आप अधिक बचत कर सकते हैं। 50-30-20 नियम अपनाएं — आय का 20% बचत में डालें।",
        hi_brief: "20% बचत के लिए 50-30-20 नियम अपनाएं।"
      },
      CREDIT_SCORE_LOW: {
        en: "A low credit score limits your loan eligibility. Companion can help you build it up.",
        en_brief: "Improve your credit score to unlock better loan offers.",
        hi: "कम क्रेडिट स्कोर आपकी ऋण पात्रता को सीमित करता है। साथी इसे बढ़ाने में आपकी मदद कर सकता है।",
        hi_brief: "ऋण के लिए अपना क्रेडिट स्कोर सुधारें।"
      },
      NO_HEALTH_INSURANCE: {
        en: "Medical emergencies can drain savings in days. A ₹5L health cover starts at ₹750/month.",
        en_brief: "Get ₹5L health cover starting at ₹750/mo.",
        hi: "मेडिकल इमरजेंसी आपकी बचत को खत्म कर सकती है। ₹5 लाख का स्वास्थ्य बीमा ₹750/माह से शुरू।",
        hi_brief: "₹750/माह में ₹5 लाख का स्वास्थ्य बीमा लें।"
      },
      PAYMENT_NUDGE: {
        en: "Set up UPI AutoPay for bills — never pay a late fee again.",
        en_brief: "Use UPI AutoPay to avoid late fees.",
        hi: "बिलों के लिए UPI ऑटोपे सेट करें — कभी भी लेट फीस न दें।",
        hi_brief: "लेट फीस से बचने के लिए UPI ऑटोपे सेट करें।"
      },
      RETIREMENT_PLANNING: {
        en: "At 35+, retirement planning becomes urgent. SBI Retire Smart helps you build a corpus.",
        en_brief: "Start planning your retirement now with SBI Retire Smart.",
        hi: "35+ की उम्र में, सेवानिवृत्ति योजना महत्वपूर्ण है। SBI रिटायर स्मार्ट आपको एक कोष बनाने में मदद करता है।",
        hi_brief: "SBI रिटायर स्मार्ट के साथ सेवानिवृत्ति की योजना बनाएं।"
      },
      GOAL_STAGNANT: {
        en: "Your goal '[goal_name]' hasn't moved. Let Companion suggest a plan.",
        en_brief: "Goal '[goal_name]' is stagnant. Ask Companion for a plan.",
        hi: "आपका लक्ष्य '[goal_name]' आगे नहीं बढ़ा है। साथी से योजना सुझाव लें।",
        hi_brief: "लक्ष्य '[goal_name]' रुका हुआ है। साथी से सलाह लें।"
      }
    }

    const translations = data[ruleKey]
    if (!translations) return nudge.message

    let msg = isHindi
      ? (isBrief ? translations.hi_brief : translations.hi)
      : (isBrief ? translations.en_brief : translations.en)

    if (nudge.rule_id.startsWith("GOAL_STAGNANT_")) {
      const goalNameRaw = nudge.rule_id.substring("GOAL_STAGNANT_".length)
      const goalLabelsEN: { [key: string]: string } = {
        save: "Save money regularly",
        invest: "Invest for wealth creation",
        insurance: "Get insurance coverage",
        payments: "Simplify daily payments",
        retirement: "Plan for retirement",
        home_vehicle: "Buy a home or vehicle",
        education: "Children's education planning"
      }
      const goalLabelsHI: { [key: string]: string } = {
        save: "नियमित बचत करें",
        invest: "सम्पत्ति संवर्धन",
        insurance: "बीमा कवरेज प्राप्त करें",
        payments: "दैनिक भुगतान सरल करें",
        retirement: "सेवानिवृत्ति की योजना",
        home_vehicle: "घर या वाहन खरीदें",
        education: "बच्चों की शिक्षा योजना"
      }
      const goalLabel = isHindi ? (goalLabelsHI[goalNameRaw] || goalNameRaw) : (goalLabelsEN[goalNameRaw] || goalNameRaw)
      msg = msg.replace("[goal_name]", goalLabel).replace("'[goal_name]'", `'${goalLabel}'`).replace('"[goal_name]"', `"${goalLabel}"`)
    }

    return msg
  }

  // 3. Local nudge calculation logic
  const computeNudgesLocally = async (prof: any, goalsProg: any[]) => {
    const triggered: any[] = []
    const existingInsurance = prof?.existing_insurance || []
    const hasLifeInsurance = existingInsurance.some((i: string) => i.toLowerCase().includes("life"))
    const hasNoneInsurance = existingInsurance.includes("None") || existingInsurance.length === 0

    // Rule 1: INSURANCE_GAP
    if (!hasLifeInsurance || hasNoneInsurance) {
      triggered.push({
        id: "INSURANCE_GAP",
        rule_id: "INSURANCE_GAP",
        severity: "high",
        message: "No life insurance detected. A ₹1Cr term plan costs just ₹489/month — protect your family today.",
        action_url: "/insurance"
      })
    }

    // Rule 2: NO_INVESTMENTS
    const existingInvestments = prof?.existing_investments || []
    const hasInvestments = existingInvestments.length > 0 && !existingInvestments.includes("None")
    if (!hasInvestments) {
      triggered.push({
        id: "NO_INVESTMENTS",
        rule_id: "NO_INVESTMENTS",
        severity: "high",
        message: "Your savings aren't growing. Start a ₹500 SIP and let compounding work for you.",
        action_url: "/investments"
      })
    }

    // Rule 3: LOW_SAVINGS
    const monthlySavings = Number(prof?.monthly_savings || 0)
    const incomeRange = prof?.income_range || ""
    const isLowestIncome = incomeRange === "<25k"
    if (monthlySavings < 5000 && !isLowestIncome && prof?.monthly_savings !== undefined) {
      triggered.push({
        id: "LOW_SAVINGS",
        rule_id: "LOW_SAVINGS",
        severity: "medium",
        message: "You could be saving more. Try the 50-30-20 rule — 20% of income to savings.",
        action_url: "/agent?prompt=help me save more"
      })
    }

    // Rule 4: CREDIT_SCORE_LOW
    const creditScore = prof?.credit_score_range || ""
    if (creditScore === "Poor") {
      triggered.push({
        id: "CREDIT_SCORE_LOW",
        rule_id: "CREDIT_SCORE_LOW",
        severity: "high",
        message: "A low credit score limits your loan eligibility. Companion can help you build it up.",
        action_url: "/agent?prompt=improve credit score"
      })
    }

    // Rule 5: NO_HEALTH_INSURANCE
    const hasHealthInsurance = existingInsurance.some((i: string) => i.toLowerCase().includes("health"))
    if (!hasHealthInsurance || hasNoneInsurance) {
      triggered.push({
        id: "NO_HEALTH_INSURANCE",
        rule_id: "NO_HEALTH_INSURANCE",
        severity: "high",
        message: "Medical emergencies can drain savings in days. A ₹5L health cover starts at ₹750/month.",
        action_url: "/insurance"
      })
    }

    // Rule 6: PAYMENT_NUDGE
    const paymentFrequency = prof?.payment_frequency || ""
    if (paymentFrequency === "Rarely") {
      triggered.push({
        id: "PAYMENT_NUDGE",
        rule_id: "PAYMENT_NUDGE",
        severity: "low",
        message: "Set up UPI AutoPay for bills — never pay a late fee again.",
        action_url: "/payments"
      })
    }

    // Rule 7: RETIREMENT_PLANNING
    const userAge = Number(prof?.age || 0)
    const userGoals = prof?.goals || []
    const wantsRetirement = userGoals.includes("retirement")
    const hasPpfOrPension = existingInvestments.some((i: string) => {
      const l = i.toLowerCase()
      return l.includes("ppf") || l.includes("pension") || l.includes("retirement")
    })
    if (userAge > 35 && wantsRetirement && !hasPpfOrPension) {
      triggered.push({
        id: "RETIREMENT_PLANNING",
        rule_id: "RETIREMENT_PLANNING",
        severity: "medium",
        message: "At 35+, retirement planning becomes urgent. SBI Retire Smart helps you build a corpus.",
        action_url: "/investments"
      })
    }

    // Rule 8: GOAL_STAGNANT
    const stagnantGoal = goalsProg.find((g: any) => {
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
      triggered.push({
        id: `GOAL_STAGNANT_${stagnantGoal.goal_name}`,
        rule_id: `GOAL_STAGNANT_${stagnantGoal.goal_name}`,
        severity: "low",
        message: `Your goal '${gName}' hasn't moved. Let Companion suggest a plan.`,
        action_url: "/agent"
      })
    }

    // Filter dismissed nudges via Supabase
    let dismissedRuleIds: string[] = []
    try {
      dismissedRuleIds = await nudgesService.getDismissedRuleIds(prof?.id || "")
    } catch {
      dismissedRuleIds = JSON.parse(localStorage.getItem(`sbi_saathi_dismissed_nudges_${prof?.id}`) || "[]")
    }
    const activeList = triggered.filter((n: any) => !dismissedRuleIds.includes(n.rule_id))

    // Sort: HIGH first, then MEDIUM, then LOW.
    const severityWeight = { high: 3, medium: 2, low: 1 }
    activeList.sort((a: any, b: any) => {
      const weightA = severityWeight[a.severity as "high" | "medium" | "low"] || 0
      const weightB = severityWeight[b.severity as "high" | "medium" | "low"] || 0
      return weightB - weightA
    })

    return activeList.slice(0, 3)
  }

  // Fetch nudges on mount / profile change
  useEffect(() => {
    const loadNudgesData = async () => {
      if (!user?.id) return
      setNudgesLoading(true)
      try {
        const { data, error } = await supabase.functions.invoke("nudge-engine", {
          body: {
            user_profile: profile,
            goals_progress: goalsProgress,
            user_id: user.id
          }
        })
        if (error) throw error
        setNudges(data || [])
      } catch (err) {
        console.warn("Failed to fetch nudges from edge function, running locally:", err)
        const computed = await computeNudgesLocally(profile, goalsProgress)
        setNudges(computed)
      } finally {
        setNudgesLoading(false)
      }
    }

    loadNudgesData()
  }, [profile, goalsProgress, user])

  // Health Score logic
  const calculateHealthScore = () => {
    let score = 50

    if (profile?.monthly_savings && Number(profile.monthly_savings) > 0) {
      score += 10
    }

    const activeInvestments = ((profile?.existing_investments as string[]) || []).filter((i: string) => i !== "None")
    score += Math.min(15, activeInvestments.length * 5)

    const activeInsurance = ((profile?.existing_insurance as string[]) || []).filter((i: string) => i !== "None")
    score += Math.min(10, activeInsurance.length * 5)

    const activeLoans = ((profile?.loans as string[]) || []).filter((i: string) => i !== "None")
    score -= Math.min(15, activeLoans.length * 5)

    const creditScore = profile?.credit_score_range || ""
    if (creditScore === "Good" || creditScore === "Excellent") {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  const healthScore = calculateHealthScore()

  // Gauge configurations
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * healthScore) / 100

  // Get gauge stroke color
  const getGaugeColor = (score: number) => {
    if (score <= 40) return "#EF4444"
    if (score <= 70) return "#F97316"
    return "#10B981"
  }

  // Get dynamic tips
  const getImprovementTips = () => {
    const tips = []

    if (!profile?.monthly_savings || Number(profile.monthly_savings) === 0) {
      tips.push(t("Establish a monthly savings goal of at least ₹5,000 to earn +10 points."))
    }

    const activeInvestments = ((profile?.existing_investments as string[]) || []).filter((i: string) => i !== "None")
    if (activeInvestments.length === 0) {
      tips.push(t("Diversify with FDs or Mutual Funds SIPs to add up to +15 points."))
    }

    const activeInsurance = ((profile?.existing_insurance as string[]) || []).filter((i: string) => i !== "None")
    if (activeInsurance.length === 0) {
      tips.push(t("Set up medical and term insurance coverages to earn +10 points."))
    } else if (activeInsurance.length < 2) {
      tips.push(t("Add an extra safety layer (Term life plan) to optimize coverage points."))
    }

    const activeLoans = ((profile?.loans as string[]) || []).filter((i: string) => i !== "None")
    if (activeLoans.length > 0) {
      tips.push(t("Consolidate high-interest loan balances to reduce debt score deductions."))
    }

    const creditScore = profile?.credit_score_range || ""
    if (creditScore !== "Good" && creditScore !== "Excellent") {
      tips.push(t("Make digital credit payments consistently on due dates to boost credit range."))
    }

    while (tips.length < 3) {
      tips.push(t("Utilize Companion conversation budgets to track miscellaneous spending."))
    }

    return tips.slice(0, 3)
  }

  const tips = getImprovementTips()

  // Weekly Digest Checker Effect
  useEffect(() => {
    if (profile && user?.id && !nudgesLoading) {
      const checkWeeklyDigest = async () => {
        const lastShownStr = profile.last_digest_shown || localStorage.getItem(`sbi_saathi_last_digest_shown_${user.id}`)
        const shouldShow = !lastShownStr || (Date.now() - new Date(lastShownStr).getTime()) > 7 * 24 * 3600000

        if (shouldShow) {
          // Fetch transactions of the last 7 days
          let txns: any[] = []
          try {
            txns = await transactionsService.listRecent(user.id, 7)
          } catch {
            // ignore
          }

          const totalCount = txns.length
          const totalAmount = txns.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0)

          // Health score change — persist via profile
          const prevScore = Math.max(50, healthScore - 3)
          const scoreDiff = healthScore - prevScore

          const tipsList = [
            "Do not save what is left after spending; instead spend what is left after saving. – Warren Buffett",
            "Compound interest is the eighth wonder of the world. He who understands it, earns it... he who doesn't, pays it. – Albert Einstein",
            "The safe way to double your money is to fold it over once and put it in your pocket. – Kin Hubbard",
            "An investment in knowledge pays the best interest. – Benjamin Franklin",
            "Opportunity is missed by most people because it is dressed in overalls and looks like work. – Thomas Edison",
            "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey",
            "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make, so you can give money back and have money to invest.",
            "Beware of little expenses; a small leak will sink a great ship. – Benjamin Franklin",
            "It’s not how much money you make, but how much money you keep, how hard it works for you, and how many generations you keep it for. – Robert Kiyosaki",
            "The goal isn't more money. The goal is living life on your terms."
          ]
          const tipIndex = Math.floor(Math.random() * tipsList.length)
          const randomTip = tipsList[tipIndex]

          setDigestData({
            totalCount,
            totalAmount,
            scoreDiff,
            newNudgesCount: nudges.length,
            tip: randomTip
          })
          setShowWeeklyDigest(true)
        }
      }

      checkWeeklyDigest()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, user, nudgesLoading])

  // Adaptive logic details
  const hasWealthGoal = ((profile?.goals as string[]) || []).includes("invest")
  const hasNoInsurance = !profile?.existing_insurance || (profile.existing_insurance as string[]).length === 0 || (profile.existing_insurance as string[]).includes("None")
  const onboardingIncomplete = profile?.onboarding_complete !== true

  // Nudge dismissal handler
  const handleDismissNudge = async (nudgeId: string, ruleId: string) => {
    // Remove from local state
    setNudges(prev => prev.filter(n => n.id !== nudgeId && n.rule_id !== ruleId))

    // Persist dismissal to Supabase
    try {
      await nudgesService.dismiss(user?.id || "", ruleId)
    } catch (err) {
      // Fallback to localStorage if Supabase fails
      if (profile?.id) {
        const key = `sbi_saathi_dismissed_nudges_${profile.id}`
        const dismissed = JSON.parse(localStorage.getItem(key) || "[]")
        if (!dismissed.includes(ruleId)) {
          dismissed.push(ruleId)
          localStorage.setItem(key, JSON.stringify(dismissed))
        }
      }
      console.warn("Failed to dismiss nudge in DB:", err)
    }
  }

  // Dismiss all nudges
  const handleMarkAllAsRead = async () => {
    if (nudges.length === 0) return
    const ruleIds = nudges.map(n => n.rule_id)

    setNudges([])

    try {
      await nudgesService.dismissAll(user?.id || "", ruleIds)
    } catch (err) {
      // Fallback to localStorage
      if (profile?.id) {
        const key = `sbi_saathi_dismissed_nudges_${profile.id}`
        const dismissed = JSON.parse(localStorage.getItem(key) || "[]")
        ruleIds.forEach(rid => {
          if (!dismissed.includes(rid)) dismissed.push(rid)
        })
        localStorage.setItem(key, JSON.stringify(dismissed))
      }
      console.warn("Failed to mark all nudges as read in DB:", err)
    }
  }

  // Weekly digest closing handler
  const handleCloseWeeklyDigest = async (openReport = false) => {
    setShowWeeklyDigest(false)
    if (user?.id) {
      const nowStr = new Date().toISOString()
      try {
        await updateProfile({ last_digest_shown: nowStr })
      } catch (err) {
        // Fallback to localStorage
        localStorage.setItem(`sbi_saathi_last_digest_shown_${user.id}`, nowStr)
        console.warn("Failed to update last_digest_shown in DB profile:", err)
      }
    }
    if (openReport) {
      setShowNotifications(true)
    }
  }

  // Sidebar Menu Items
  const menuItems = [
    { name: t("Home"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("SBI AI"), path: "/agent", icon: Bot },
    { name: t("Payments"), path: "/payments", icon: Wallet },
    { name: t("Mobile Banking"), path: "/mobile-banking", icon: Smartphone },
    { name: t("Credit Cards"), path: "/cards", icon: CreditCard },
    { name: t("Investments"), path: "/investments", icon: TrendingUp },
    { name: t("Insurance"), path: "/insurance", icon: Shield },
    { name: t("Support"), path: "/support", icon: HelpCircle },
    { name: t("Profile"), path: "/profile", icon: User },
  ]

  // Handlers for goals progress
  const openGoalProgressModal = (goalName: string) => {
    const existing = goalsProgress.find((g) => g.goal_name === goalName)
    setSelectedGoalForUpdate(goalName)
    setCurrentAmountInput(existing ? existing.current_amount.toString() : "0")
    setTargetAmountInput(existing ? existing.target_amount.toString() : "100000")
    setIsGoalModalOpen(true)
  }

  const handleUpdateGoalProgress = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingGoal(true)
    const current = Number(currentAmountInput)
    const target = Number(targetAmountInput)

    if (isNaN(current) || isNaN(target) || target <= 0) {
      alert(t("Please enter valid amounts."))
      setIsUpdatingGoal(false)
      return
    }

    const { error } = await updateGoalProgress(selectedGoalForUpdate, current, target)
    if (!error) {
      await addActivity("investment", `Updated savings progress for goal: ${selectedGoalForUpdate}`, current)
      setIsGoalModalOpen(false)
    } else {
      alert(t("Failed to update goal."))
    }
    setIsUpdatingGoal(false)
  }

  const handleLogout = async () => {
    await signOut()
    navigate("/")
  }

  // HIGH severity nudges list
  const highSeverityNudges = nudges.filter(n => n.severity === "high")
  // Badge count is number of HIGH severity nudges
  const highSeverityCount = highSeverityNudges.length

  // Helper for rendering Sheet Nudges
  const renderSheetNudgeItem = (nudge: any) => {
    const borderColors = {
      high: "border-red-500",
      medium: "border-amber-500",
      low: "border-blue-500"
    }
    const icons = {
      high: "🚨",
      medium: "💡",
      low: "⚡"
    }

    const msg = processNudgeText(nudge, profile?.preferred_language, profile?.communication_style)

    return (
      <div
        key={nudge.id}
        className={`rounded-xl border-l-4 ${borderColors[nudge.severity as "high" | "medium" | "low"]} border bg-slate-50 dark:bg-slate-950/20 p-4 relative pr-8 flex gap-3 shadow-xs hover:shadow-sm transition-shadow`}
      >
        <button
          onClick={() => handleDismissNudge(nudge.id, nudge.rule_id)}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          aria-label="Dismiss nudge"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-xl shrink-0">{icons[nudge.severity as "high" | "medium" | "low"]}</span>
        <div className="space-y-2 flex-1">
          <p className="text-xs text-slate-750 dark:text-slate-200 leading-relaxed font-semibold">
            {msg}
          </p>
          <button
            onClick={() => {
              setShowNotifications(false)
              navigate(nudge.action_url)
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer"
          >
            {t("Take Action")} <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside
        className={`flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 ${sidebarCollapsed ? "w-20" : "w-64"
          } shrink-0 relative`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-150 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <img
              src="/logo.png"
              alt="SBI Companion Logo"
              className="h-8 w-8 object-contain shrink-0"
            />
            {!sidebarCollapsed && (
              <span className="text-md font-extrabold tracking-tight text-slate-900 dark:text-white shrink-0">
                SBI <span className="text-primary dark:text-blue-400">Companion</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-880 text-slate-450 hidden md:block cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${isActive
                  ? "bg-blue-50 text-primary dark:bg-blue-950/20 dark:text-blue-400"
                  : "text-slate-550 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-white"
                  }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary dark:text-blue-400" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer Utilities & Logout */}
        <div className="p-2 border-t border-slate-150 dark:border-slate-800 space-y-1">
          {/* About Button */}
          <button
            onClick={() => setShowAboutModal(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-550 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 shrink-0 text-slate-450 dark:text-slate-405" />
            {!sidebarCollapsed && <span>{t("About Companion")}</span>}
          </button>

          {/* Theme toggler removed */}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>{t("Logout")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 2. TOP BAR */}
        <header className="h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 relative z-30">
          <div className="text-left">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">
              {t("Good morning")}, {userName} 👋
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(true)
                  setShowUserMenu(false)
                }}
                className="rounded-full p-2 text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 relative focus:outline-none cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {highSeverityCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-bounce">
                    {highSeverityCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm focus:outline-none ring-2 ring-slate-100 dark:ring-slate-800 cursor-pointer"
              >
                {userName.charAt(0)}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-left z-55">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350"
                  >
                    <User className="h-4 w-4" /> {t("My Profile")}
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> {t("Sign Out")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. MAIN CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* URGENT NUDGE STRIP */}
          {highSeverityNudges.length > 0 && (
            <div className="rounded-xl bg-red-600 text-white p-4 text-left flex justify-between items-center shadow-md border border-red-700 animate-pulse">
              <div className="flex gap-3 items-center">
                <AlertTriangle className="h-5 w-5 text-white shrink-0" />
                <div>
                  <h4 className="text-sm font-extrabold">{t("Critical Alert")}</h4>
                  <p className="text-xs text-red-100 mt-0.5 font-medium">
                    {processNudgeText(highSeverityNudges[0], profile?.preferred_language, profile?.communication_style)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(highSeverityNudges[0].action_url)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors shadow-sm cursor-pointer"
                >
                  {t("Take Action")}
                </button>
                <button
                  onClick={() => handleDismissNudge(highSeverityNudges[0].id, highSeverityNudges[0].rule_id)}
                  className="rounded-full p-1.5 hover:bg-red-700 text-white transition-colors cursor-pointer"
                  aria-label="Dismiss banner"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}

          {/* ADAPTIVE TOP BANNERS */}
          {onboardingIncomplete && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50 p-4 text-left flex justify-between items-center">
              <div className="flex gap-3">
                <Bot className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">{t("Complete your profile onboarding")}</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">{t("Set up your financial objectives to enable the agent to analyze records.")}</p>
                </div>
              </div>
              <Link to="/onboarding" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700">
                {t("Setup Now")}
              </Link>
            </div>
          )}

          {hasNoInsurance && !onboardingIncomplete && (
            <div className="rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 p-4 text-left flex justify-between items-center">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">{t("Action Required: Establish Health/Life Safety Net")}</h4>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{t("Your profile specifies zero active policies. A single health emergency could disrupt your long-term plan.")}</p>
                </div>
              </div>
              <Link to="/insurance" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-red-755">
                {t("Bridge Gap")}
              </Link>
            </div>
          )}

          {/* EXPLORE FUNDS SHORTCUT (ADAPTIVE INVEST TARGET) */}
          {hasWealthGoal && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-900 dark:from-slate-900 dark:to-slate-850 text-left flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t("Explore Funds")} 📈
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {t("Based on your wealth creation goal, explore SBI's top-performing mutual funds and start compounding your wealth today.")}
                </p>
              </div>
              <Link
                to="/investments"
                className="shrink-0 rounded-lg bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold px-4 py-2.5 text-xs transition-colors flex items-center gap-1.5 shadow-md"
              >
                {t("Explore Funds")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* WIDGET 1: Financial Health Score (SVG Circular progress, tips) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row gap-6 text-left">
              {/* Circular Gauge Left Column */}
              <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-6 md:pb-0 md:pr-6">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke="#F1F5F9"
                      strokeWidth="8"
                      fill="none"
                      className="dark:stroke-slate-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={getGaugeColor(healthScore)}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{healthScore}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t("Financial Health Score")}</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: getGaugeColor(healthScore) }}
                  >
                    {healthScore <= 40 ? t("Needs Review") : healthScore <= 70 ? t("Fair Security") : t("Excellent")}
                  </span>
                </div>
              </div>

              {/* Tips list Right Column */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-md font-bold text-slate-900 dark:text-white">{t("Companion Analysis Tips")}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{t("Calculated based on savings depth, covers, and debt ratios.")}</p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-blue-400 mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Link
                    to="/agent"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-4 py-2.5 text-xs font-bold text-primary hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 transition-colors"
                  >
                    {t("Improve Score via SBI AI")}
                    <ArrowRight className="h-4.5 w-4.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* WIDGET 2: Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">
              <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6">{t("Quick Actions")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/payments"
                  className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50 hover:bg-blue-50/40 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-850 hover:-translate-y-0.5 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center mb-2">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">{t("Pay / Transfer")}</span>
                </Link>

                <Link
                  to="/investments"
                  className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-yellow-200 bg-slate-50 hover:bg-yellow-50/20 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-850 hover:-translate-y-0.5 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-accent flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">{t("Start SIP")}</span>
                </Link>

                <Link
                  to="/insurance"
                  className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-emerald-200 bg-slate-50 hover:bg-emerald-50/20 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-850 hover:-translate-y-0.5 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">{t("Check Insurance")}</span>
                </Link>

                <Link
                  to="/agent"
                  className="group flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 bg-slate-50 hover:bg-purple-50/20 dark:border-slate-850 dark:bg-slate-900 dark:hover:bg-slate-850 hover:-translate-y-0.5 transition-all"
                >
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold">{t("Talk to Companion")}</span>
                </Link>
              </div>
            </div>

            {/* ADAPTIVE / REARRANGED MIDDLE GRID WIDGETS */}
            {(() => {
              const widgets = [
                {
                  id: "goals",
                  el: (
                    <div
                      key="goals-widget"
                      className={`rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900 text-left flex flex-col justify-between ${hasWealthGoal
                        ? "border-primary dark:border-blue-500 ring-1 ring-blue-50 dark:ring-blue-950/20"
                        : "border-slate-200 dark:border-slate-800"
                        }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Compass className="h-5 w-5 text-primary" />
                            {t("Goals Progress")}
                          </h3>
                          {hasWealthGoal && (
                            <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold text-primary dark:bg-blue-950/30 dark:text-blue-400">
                              {t("Wealth Focus")}
                            </span>
                          )}
                        </div>

                        {goalsProgress.length > 0 ? (
                          <div className="space-y-4">
                            {goalsProgress.map((g) => {
                              const goalLabels: { [key: string]: string } = {
                                save: t("Save money regularly"),
                                invest: t("Invest for wealth"),
                                insurance: t("Get insurance coverage"),
                                payments: t("Simplify daily payments"),
                                retirement: t("Plan for retirement"),
                                home_vehicle: t("Buy home/vehicle"),
                                education: t("Kids education planning"),
                              }
                              return (
                                <div key={g.goal_name} className="space-y-2">
                                  <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-slate-800 dark:text-slate-200">
                                      {goalLabels[g.goal_name] || g.goal_name}
                                    </span>
                                    <span className="text-slate-500">
                                      ₹{g.current_amount.toLocaleString()} / ₹{g.target_amount.toLocaleString()} ({g.progress_percent}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="bg-primary dark:bg-blue-500 h-full transition-all duration-300"
                                      style={{ width: `${g.progress_percent}%` }}
                                    />
                                  </div>
                                  <button
                                    onClick={() => openGoalProgressModal(g.goal_name)}
                                    className="text-[10px] text-primary dark:text-blue-400 font-bold hover:underline block cursor-pointer"
                                  >
                                    {t("Update progress")}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 text-center py-6">
                            {t("No active goals. Add goals in profile setup to track them.")}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  id: "nudges",
                  el: (
                    <div key="nudges-widget" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left flex flex-col justify-between">
                      <div>
                        <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6">{t("Companion Suggests 💡")}</h3>
                        {nudges.length > 0 ? (
                          <div className="space-y-3">
                            {nudges.map((nudge) => {
                              const msg = processNudgeText(nudge, profile?.preferred_language, profile?.communication_style)
                              const emojiMap: { [key: string]: string } = {
                                INSURANCE_GAP: "🛡️",
                                NO_INVESTMENTS: "💰",
                                LOW_SAVINGS: "📊",
                                CREDIT_SCORE_LOW: "💳",
                                NO_HEALTH_INSURANCE: "🏥",
                                PAYMENT_NUDGE: "⚡",
                                RETIREMENT_PLANNING: "🌴",
                                GOAL_STAGNANT: "🎯"
                              }
                              const ruleKey = nudge.rule_id.startsWith("GOAL_STAGNANT_") ? "GOAL_STAGNANT" : nudge.rule_id
                              const emoji = emojiMap[ruleKey] || "💡"

                              return (
                                <div
                                  key={nudge.id}
                                  className="rounded-xl border border-slate-150 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 relative pr-8"
                                >
                                  <button
                                    onClick={() => handleDismissNudge(nudge.id, nudge.rule_id)}
                                    className="absolute top-2 right-2 text-slate-450 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                  <div className="flex gap-2">
                                    <span className="text-lg shrink-0">{emoji}</span>
                                    <div className="text-xs pr-4 space-y-2">
                                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">{msg}</p>
                                      <button
                                        onClick={() => navigate(nudge.action_url)}
                                        className="inline-flex items-center gap-0.5 font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer"
                                      >
                                        {t("Take Action")} <ArrowRight className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 text-center py-8">
                            {t("Your safety and financial layout is fully aligned. Great job!")}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                },
                {
                  id: "stats",
                  el: (
                    <div key="stats-widget" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">
                      <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6">{t("Banking Statistics")}</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-850">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4.5 w-4.5 text-primary" />
                            <span className="text-xs font-semibold text-slate-500">{t("Average Savings")}</span>
                          </div>
                          <span className="text-sm font-bold">₹{Number(profile?.monthly_savings || 0).toLocaleString()} / mo</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-850">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4.5 w-4.5 text-yellow-600" />
                            <span className="text-xs font-semibold text-slate-500">{t("Active Investments")}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {(profile?.existing_investments as string[])?.filter((i: string) => i !== "None").length || 0}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-850">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4.5 w-4.5 text-emerald-600" />
                            <span className="text-xs font-semibold text-slate-500">{t("Insurance Policies")}</span>
                          </div>
                          <span className="text-sm font-bold">
                            {(profile?.existing_insurance as string[])?.filter((i: string) => i !== "None").length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }
              ]

              // If has wealth goal, show Goals widget first, else Nudges widget first
              if (hasWealthGoal) {
                return widgets.map(w => w.el)
              } else {
                return [
                  widgets.find(w => w.id === "nudges")?.el,
                  widgets.find(w => w.id === "goals")?.el,
                  widgets.find(w => w.id === "stats")?.el
                ]
              }
            })()}

          </div>

          {/* WIDGET 5: Recent Activity Feed (Full width) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-bold text-slate-900 dark:text-white">{t("Recent Activities")}</h3>
              <Link to="/payments" className="text-xs font-bold text-primary dark:text-blue-400 hover:underline">
                {t("View All")}
              </Link>
            </div>

            {activities.length > 0 ? (
              <div className="flow-root">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activities.map((act) => {
                    const getIcon = (type: string) => {
                      if (type === "payment") return <CreditCard className="h-4 w-4 text-primary" />
                      if (type === "investment") return <TrendingUp className="h-4 w-4 text-yellow-600" />
                      if (type === "insurance") return <Shield className="h-4 w-4 text-emerald-600" />
                      return <Bot className="h-4 w-4 text-purple-600" />
                    }
                    return (
                      <li key={act.id} className="py-3.5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-850 flex items-center justify-center shrink-0">
                            {getIcon(act.type)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{act.description}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(act.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                            </span>
                          </div>
                        </div>
                        {act.amount && (
                          <span className={`text-xs font-extrabold ${act.type === "payment" ? "text-red-500" : "text-emerald-600"}`}>
                            {act.type === "payment" ? "-" : "+"} ₹{Number(act.amount).toLocaleString()}
                          </span>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-xs text-slate-500">{t("No activity yet. Start by talking to Companion.")}</p>
                <Link
                  to="/agent"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  {t("Talk to Companion")} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. UPDATE GOAL PROGRESS MODAL OVERLAY */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-left step-transition">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t("Goals Progress")}</h4>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-450 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGoalProgress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">{t("Goals Progress")}</label>
                <input
                  type="text"
                  disabled
                  value={selectedGoalForUpdate}
                  className="mt-1.5 block w-full rounded-lg border border-slate-250 bg-slate-50 p-2.5 text-xs font-semibold text-slate-550 capitalize dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Current Saved Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={currentAmountInput}
                  onChange={(e) => setCurrentAmountInput(e.target.value)}
                  placeholder="e.g. 15000"
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Target Savings Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  placeholder="e.g. 100000"
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingGoal}
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 dark:bg-blue-600 cursor-pointer"
                >
                  {isUpdatingGoal ? "Saving..." : "Save Progress"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SLIDING NOTIFICATIONS CENTER PANEL (Radix UI Sheet mockup) */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 transform ${showNotifications ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="h-full flex flex-col p-6 text-left justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-150 pb-4 mb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-md font-extrabold text-slate-900 dark:text-white">
                  {t("Notifications")}
                </h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-450 dark:hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action button */}
            {nudges.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-primary dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {t("Mark all as read")}
                </button>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {nudges.length > 0 ? (
                <>
                  {/* Group High */}
                  {nudges.filter(n => n.severity === "high").length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold tracking-widest text-red-500 uppercase block">
                        {t("High Priority")}
                      </span>
                      {nudges.filter(n => n.severity === "high").map(n => renderSheetNudgeItem(n))}
                    </div>
                  )}

                  {/* Group Medium */}
                  {nudges.filter(n => n.severity === "medium").length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase block">
                        {t("Medium Priority")}
                      </span>
                      {nudges.filter(n => n.severity === "medium").map(n => renderSheetNudgeItem(n))}
                    </div>
                  )}

                  {/* Group Low */}
                  {nudges.filter(n => n.severity === "low").length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase block">
                        {t("Low Priority")}
                      </span>
                      {nudges.filter(n => n.severity === "low").map(n => renderSheetNudgeItem(n))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <span className="text-4xl">🎉</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {t("You're all caught up! Companion is watching over your finances 🎉")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* 6. WEEKLY DIGEST EMAIL SIMULATION MODAL OVERLAY */}
      {showWeeklyDigest && digestData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-left relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-primary/5 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-primary dark:text-blue-400 uppercase">
                  {t("Weekly Summary")}
                </span>
                <h4 className="font-extrabold text-xl text-slate-900 dark:text-white mt-1">
                  {t("This Week with Companion")} 📊
                </h4>
              </div>
              <button
                onClick={() => handleCloseWeeklyDigest(false)}
                className="text-slate-450 hover:text-slate-600 dark:hover:text-white rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {t("Here's a breakdown of your financial activities and safety progress over the last 7 days.")}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Transactions Widget */}
              <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
                <p className="text-[10px] font-extrabold tracking-wider text-slate-450 dark:text-slate-400 uppercase mb-1">
                  {t("Transactions")}
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {digestData.totalCount}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {t("Volume")}: <span className="font-bold">₹{digestData.totalAmount.toLocaleString()}</span>
                </p>
              </div>

              {/* Health Score Change Widget */}
              <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
                <p className="text-[10px] font-extrabold tracking-wider text-slate-450 dark:text-slate-400 uppercase mb-1">
                  {t("Score Change")}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {digestData.scoreDiff >= 0 ? (
                    <span className="text-emerald-500 text-xl font-extrabold">▲ +{digestData.scoreDiff}</span>
                  ) : (
                    <span className="text-red-500 text-xl font-extrabold">▼ {digestData.scoreDiff}</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {t("Current Score")}: <span className="font-bold">{healthScore}</span>
                </p>
              </div>

              {/* New Nudges since last week */}
              <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 col-span-2 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-extrabold tracking-wider text-slate-450 dark:text-slate-400 uppercase mb-1">
                    {t("New Nudges")}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {digestData.newNudgesCount > 0
                      ? `${digestData.newNudgesCount} new items require your attention.`
                      : "No new notifications since last week."}
                  </p>
                </div>
                <span className="text-2xl">💡</span>
              </div>
            </div>

            {/* Motivational quote bubble */}
            <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 mb-6 text-left">
              <span className="text-xs font-bold text-primary dark:text-blue-400 uppercase block mb-1">
                {t("Motivational Quote")} 🌟
              </span>
              <p className="text-xs italic text-slate-600 dark:text-slate-305 leading-relaxed">
                "{digestData.tip}"
              </p>
            </div>

            {/* CTA Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleCloseWeeklyDigest(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-xs font-bold hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 transition-colors cursor-pointer"
              >
                {t("Dismiss")}
              </button>
              <button
                type="button"
                onClick={() => handleCloseWeeklyDigest(true)}
                className="rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-5 py-2.5 text-xs font-extrabold text-white transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                {t("View Full Report")} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-sm w-full text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="SBI Companion Logo"
                className="h-12 w-12 object-contain"
              />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">SBI Companion</h3>
              <p className="text-xs text-slate-400">Version 1.0.0-sandbox</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              SBI Companion is your premium AI-powered financial copilot designed to secure and optimize your personal wealth, insurance net, and day-to-day banking.
            </p>

            <div className="flex flex-wrap gap-1.5 justify-center">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                React 18
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                Supabase DB
              </span>
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
                Tailwind CSS
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-black text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Powered by Google Gemini
              </div>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="mt-2 w-full rounded-lg bg-primary py-2 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
