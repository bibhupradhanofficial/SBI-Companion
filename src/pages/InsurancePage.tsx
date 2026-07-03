/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  insuranceService,
  type UserInsurance,
} from "@/lib/supabase-service"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useNavigate } from "react-router-dom"
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Heart,
  Car,
  Activity,
  Calendar,
  Upload,
  Check,
  FileText,
  Sparkles,
  Clock,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

// Types matching database schema (imported from supabase-service)

interface PlanProduct {
  id: string
  name: string
  category: "Life" | "Health" | "Vehicle" | "Investment"
  typeBadge: string
  benefits: string[]
  startingPremium: string
  claimRatio: string
  solvencyRatio: string
  description: string
  checkupRequired: string
}

// 12 Hardcoded SBI Life and General Insurance products
const INSURANCE_PLANS: PlanProduct[] = [
  // Life Insurance
  {
    id: "life_1",
    name: "SBI Life eShield Next",
    category: "Life",
    typeBadge: "Term Plan",
    benefits: [
      "Low premium for high cover of ₹1 Crore+",
      "Built-in Terminal Illness benefit",
      "Accidental Death Benefit Rider option"
    ],
    startingPremium: "₹489/month",
    claimRatio: "99.03%",
    solvencyRatio: "2.15",
    description: "A non-linked, non-participating, individual, pure term life insurance plan that protects your family's financial future against life's uncertainties.",
    checkupRequired: "Yes (above age 45)"
  },
  {
    id: "life_2",
    name: "SBI Life Smart Wealth Builder",
    category: "Life",
    typeBadge: "ULIP / Investment + Cover",
    benefits: [
      "Dual benefit of market-linked investment & life cover",
      "No life insurance allocation charges from 11th policy year",
      "Choice of 11 diverse fund options (Equity, Debt, Balanced)"
    ],
    startingPremium: "₹2,000/month",
    claimRatio: "99.03%",
    solvencyRatio: "2.15",
    description: "An individual, unit-linked life insurance product that offers capital growth opportunities along with comprehensive insurance protection.",
    checkupRequired: "No"
  },
  {
    id: "life_3",
    name: "SBI Life Retire Smart",
    category: "Life",
    typeBadge: "Pension Plan",
    benefits: [
      "Guaranteed additions up to 210% of annual premium",
      "Guaranteed maturity benefit to safeguard your corpus",
      "Flexible options to pay premiums (single, limited, or regular)"
    ],
    startingPremium: "₹1,500/month",
    claimRatio: "99.03%",
    solvencyRatio: "2.15",
    description: "An individual, unit-linked pension plan that helps you build a secure retirement corpus through systematic, low-risk fund allocations.",
    checkupRequired: "No"
  },
  // Health Insurance
  {
    id: "health_1",
    name: "SBI Arogya Premier",
    category: "Health",
    typeBadge: "Individual Health",
    benefits: [
      "100% restoration of sum insured once a year",
      "No pre-policy medical check-up up to 55 years",
      "Alternative AYUSH treatment covered up to 100%"
    ],
    startingPremium: "₹750/month",
    claimRatio: "92.50%",
    solvencyRatio: "1.72",
    description: "Premium health insurance plan offering high sum insured options and wide coverage parameters for individuals who want standard protection.",
    checkupRequired: "Yes (above age 55)"
  },
  {
    id: "health_2",
    name: "SBI Arogya Plus",
    category: "Health",
    typeBadge: "Family Floater",
    benefits: [
      "Flat premium for family cover (up to 2 adults + 2 children)",
      "OPD consultation expenses covered up to specified limits",
      "Tax exemption under Section 80D of Income Tax Act"
    ],
    startingPremium: "₹1,200/month",
    claimRatio: "92.50%",
    solvencyRatio: "1.72",
    description: "Affordable family health plan offering extensive medical coverage with OPD reimbursement options for the entire household.",
    checkupRequired: "No"
  },
  {
    id: "health_3",
    name: "SBI Critical Illness Plan",
    category: "Health",
    typeBadge: "Critical Illness",
    benefits: [
      "Lump-sum payout upon diagnosis of 13 major critical illnesses",
      "Covers cancer, heart attack, stroke, kidney failure, etc.",
      "Quick claim settlement without bills or hospitalization proof"
    ],
    startingPremium: "₹300/month",
    claimRatio: "92.50%",
    solvencyRatio: "1.72",
    description: "Provides a vital cash safety net by paying the full sum assured in a single lump sum upon clinical diagnosis of major life-threatening diseases.",
    checkupRequired: "Yes (above age 45)"
  },
  // Vehicle Insurance
  {
    id: "vehicle_1",
    name: "SBI General Comprehensive Car",
    category: "Vehicle",
    typeBadge: "Car Insurance",
    benefits: [
      "Third-party liability + own damage protection",
      "Cashless repair at 3,000+ network garages pan-India",
      "Add-on options: Zero Depreciation, Engine Protect, RSA"
    ],
    startingPremium: "₹6,000/year",
    claimRatio: "90.20%",
    solvencyRatio: "1.72",
    description: "Extensive cover for private cars protecting against accident damage, natural disasters, theft, vandalism, and third-party liabilities.",
    checkupRequired: "No"
  },
  {
    id: "vehicle_2",
    name: "SBI General Two-Wheeler",
    category: "Vehicle",
    typeBadge: "Two-Wheeler",
    benefits: [
      "Multi-year policy options (up to 3 years coverage)",
      "Compulsory Personal Accident cover for owner-driver (₹15 Lakhs)",
      "Transfer of No Claim Bonus (NCB) from other providers"
    ],
    startingPremium: "₹1,200/year",
    claimRatio: "90.20%",
    solvencyRatio: "1.72",
    description: "Sass-free, simple protection for motorbikes and scooters. Avoid yearly renewals with long-term 2-year or 3-year policy terms.",
    checkupRequired: "No"
  },
  {
    id: "vehicle_3",
    name: "SBI General Commercial Vehicle",
    category: "Vehicle",
    typeBadge: "Commercial",
    benefits: [
      "Comprehensive package for goods and passenger carriers",
      "Protects against natural calamities, fire, and collision",
      "Towing assistance and rapid spot survey options"
    ],
    startingPremium: "₹15,000/year",
    claimRatio: "90.20%",
    solvencyRatio: "1.72",
    description: "Customized policy ensuring that your commercial trucks, buses, or taxis stay covered, minimizing business downtime during accidents.",
    checkupRequired: "No"
  },
  // Investment + Insurance
  {
    id: "invest_1",
    name: "SBI Life Smart Platina Assured",
    category: "Investment",
    typeBadge: "Guaranteed Savings",
    benefits: [
      "Guaranteed additions of up to 5.50% at the end of each year",
      "Premium payment term is shorter than the policy term",
      "Life cover throughout the policy term to secure your family"
    ],
    startingPremium: "₹4,000/month",
    claimRatio: "99.03%",
    solvencyRatio: "2.15",
    description: "A traditional life insurance plan that offers maturity security through guaranteed returns alongside a regular life insurance cover.",
    checkupRequired: "No"
  },
  {
    id: "invest_2",
    name: "SBI Life Smart Champ Insurance",
    category: "Investment",
    typeBadge: "Child Education Plan",
    benefits: [
      "Smart benefits paid in 4 equal annual installments for education",
      "Waiver of future premiums in the event of parent's demise",
      "Additional accident benefit rider built into the policy"
    ],
    startingPremium: "₹2,000/month",
    claimRatio: "99.03%",
    solvencyRatio: "2.15",
    description: "Designed specifically to secure your child's future educational needs. Ensures payments are made at crucial milestones even in your absence.",
    checkupRequired: "No"
  },
  {
    id: "invest_3",
    name: "SBI Life Smart Shield",
    category: "Investment",
    typeBadge: "Traditional Life Cover",
    benefits: [
      "High sum assured rebates discount on premium rates",
      "Multiple rider options: Accidental death, Permanent disability",
      "Option to choose increasing term cover to counter inflation"
    ],
    startingPremium: "₹500/month",
    claimRatio: "99.03%",
    solvencyRatio: "2.15",
    description: "An individual, non-participating, traditional term assurance plan providing broad security and customization options at nominal prices.",
    checkupRequired: "Yes (above age 45)"
  }
]

export const InsurancePage: React.FC = () => {
  const { user, profile, addActivity } = useAuth()
  const navigate = useNavigate()

  // State Management
  const [activeTab, setActiveTab] = useState<"coverage" | "explore" | "claims">("coverage")
  const [policies, setPolicies] = useState<UserInsurance[]>([])

  // Tab 2: Explore Plans Filters & Comparison
  const [categoryFilter, setCategoryFilter] = useState<"Life" | "Health" | "Vehicle" | "Investment">("Life")
  const [compareList, setCompareList] = useState<PlanProduct[]>([])
  const [showCompareSection, setShowCompareSection] = useState(false)

  // Premium Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quotePlan, setQuotePlan] = useState<PlanProduct | null>(null)

  // Quote inputs - Life
  const [lifeAge, setLifeAge] = useState<number>(30)
  const [lifeSumAssured, setLifeSumAssured] = useState<number>(10000000) // 1 Crore
  const [lifeTenure, setLifeTenure] = useState<number>(20)
  const [lifeIsSmoker, setLifeIsSmoker] = useState<boolean>(false)

  // Quote inputs - Health
  const [healthMembersCount, setHealthMembersCount] = useState<number>(2)
  const [healthAges, setHealthAges] = useState<number[]>([30, 28])
  const [healthCityTier, setHealthCityTier] = useState<string>("Tier 1")

  // Quote inputs - Vehicle
  const [vehicleType, setVehicleType] = useState<"Car" | "Two-Wheeler" | "Commercial">("Car")
  const [vehicleAge, setVehicleAge] = useState<number>(1)
  const [vehicleIdv, setVehicleIdv] = useState<number>(500000)

  // Quote inputs - Investment
  const [investAmount, setInvestAmount] = useState<number>(5000)
  const [investTenure, setInvestTenure] = useState<number>(15)

  // Calculated Premium Display
  const [calculatedPremium, setCalculatedPremium] = useState<number>(0)
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false)

  // Claims Stepper Modal State
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimStep, setClaimStep] = useState<1 | 2 | 3 | 4>(1)
  const [claimPolicyId, setClaimPolicyId] = useState<string>("")
  const [claimType, setClaimType] = useState<string>("Cashless")
  const [claimDescription, setClaimDescription] = useState<string>("")
  const [claimUploadedFiles, setClaimUploadedFiles] = useState<string[]>([])
  const [generatedClaimId, setGeneratedClaimId] = useState<string>("")

  // Health coverage setting indicator: individual or family
  const [healthTargetType, setHealthTargetType] = useState<"individual" | "family">("family")

  // Toast notifications state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<"success" | "info" | "warning">("success")

  // Load user profile details to prefill quote modals
  useEffect(() => {
    if (profile?.age) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLifeAge(profile.age)
      setHealthAges([profile.age, Math.max(18, profile.age - 2)])
    }
    if (profile && profile.city) {
      const cityLower = profile.city.toLowerCase()
      const isTier1 = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"].some(
        c => cityLower.includes(c.toLowerCase())
      )
      setHealthCityTier(isTier1 ? "Tier 1" : "Tier 2")
    }
  }, [profile])

  // Recalculate Quote Premiums
  useEffect(() => {
    if (!quotePlan) return

    let premium = 0
    if (quotePlan.category === "Life") {
      // Life premium formula
      // Base: ₹400/month for ₹1Cr sum assured at age 18.
      const base = (lifeSumAssured / 10000000) * 400
      const ageMultiplier = 1 + (lifeAge - 18) * 0.05
      const smokerMultiplier = lifeIsSmoker ? 1.6 : 1.0
      const tenureDiscount = 1 - (lifeTenure - 10) * 0.005 // slight discount for longer commitments
      premium = Math.round(base * ageMultiplier * smokerMultiplier * tenureDiscount * 12) // Annual premium
    } else if (quotePlan.category === "Health") {
      // Health premium formula
      let memberSum = 0
      for (let i = 0; i < healthMembersCount; i++) {
        const age = healthAges[i] || 30
        memberSum += 3000 + age * 120
      }
      const tierMultiplier = healthCityTier === "Tier 1" ? 1.3 : healthCityTier === "Tier 2" ? 1.15 : 1.0
      const familyDiscount = healthMembersCount > 1 ? 0.85 : 1.0
      premium = Math.round(memberSum * tierMultiplier * familyDiscount)
    } else if (quotePlan.category === "Vehicle") {
      // Vehicle premium formula
      const idvRate = vehicleType === "Car" ? 0.025 : vehicleType === "Two-Wheeler" ? 0.018 : 0.035
      const depreciationMultiplier = Math.max(0.5, 1 - vehicleAge * 0.1)
      premium = Math.round(vehicleIdv * idvRate * depreciationMultiplier)
    } else if (quotePlan.category === "Investment") {
      // Investment + Insurance plan: Premium is directly based on investment amount
      premium = Math.round(investAmount * 12)
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCalculatedPremium(premium)
  }, [
    quotePlan,
    lifeAge,
    lifeSumAssured,
    lifeTenure,
    lifeIsSmoker,
    healthMembersCount,
    healthAges,
    healthCityTier,
    vehicleType,
    vehicleAge,
    vehicleIdv,
    investAmount,
    investTenure
  ])

  const loadDefaultPolicies = async (userId: string) => {
    const defaultPolicies: UserInsurance[] = [
      {
        id: "pol_1",
        user_id: userId,
        type: "life",
        provider: "SBI Life",
        policy_number: "SBI-LIFE-4011",
        sum_assured: 10000000, // ₹1 Crore
        premium_amount: 980,
        premium_frequency: "monthly",
        start_date: new Date(Date.now() - 365 * 24 * 3600000).toISOString(),
        end_date: new Date(Date.now() + 9 * 365 * 24 * 3600000).toISOString(),
        status: "active",
        created_at: new Date(Date.now() - 365 * 24 * 3600000).toISOString()
      },
      {
        id: "pol_2",
        user_id: userId,
        type: "health",
        provider: "SBI General",
        policy_number: "SBI-HLT-9281",
        sum_assured: 300000, // ₹3 Lakhs
        premium_amount: 750,
        premium_frequency: "monthly",
        start_date: new Date(Date.now() - 340 * 24 * 3600000).toISOString(),
        end_date: new Date(Date.now() + 25 * 24 * 3600000).toISOString(), // expires in 25 days!
        status: "active",
        created_at: new Date(Date.now() - 340 * 24 * 3600000).toISOString()
      },
      {
        id: "pol_3",
        user_id: userId,
        type: "vehicle",
        provider: "SBI General",
        policy_number: "SBI-MOT-8812",
        sum_assured: 80000, // ₹80k (two-wheeler)
        premium_amount: 1200,
        premium_frequency: "annual",
        start_date: new Date(Date.now() - 300 * 24 * 3600000).toISOString(),
        end_date: new Date(Date.now() + 65 * 24 * 3600000).toISOString(), // expires in 65 days!
        status: "active",
        created_at: new Date(Date.now() - 300 * 24 * 3600000).toISOString()
      }
    ]
    // Insert default policies into Supabase
    try {
      const inserted = await insuranceService.add(defaultPolicies[0])
      const inserted2 = await insuranceService.add(defaultPolicies[1])
      const inserted3 = await insuranceService.add(defaultPolicies[2])
      setPolicies([inserted, inserted2, inserted3])
    } catch {
      // If insert fails (e.g. table not yet created), show defaults in UI
      setPolicies(defaultPolicies)
    }
  }

  // DB Load
  const loadPolicies = async (userId: string) => {
    try {
      const data = await insuranceService.list(userId)
      if (data.length > 0) {
        setPolicies(data)
      } else {
        loadDefaultPolicies(userId)
      }
    } catch (err) {
      console.error("Failed to load insurance policies:", err)
      loadDefaultPolicies(userId)
    }
  }

  // Fetch policies on mount
  useEffect(() => {
    if (user?.id) {
      loadPolicies(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Toast display trigger
  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // Handle plan purchase application
  const handleProceedApply = async () => {
    if (!quotePlan || !user) return

    setIsSubmittingQuote(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmittingQuote(false)
    setShowQuoteModal(false)

    // Calculate premium amount monthly or annual based on choice
    const premAmt = quotePlan.startingPremium.includes("year")
      ? Math.round(calculatedPremium)
      : Math.round(calculatedPremium / 12)
    const premFreq = quotePlan.startingPremium.includes("year") ? "annual" : "monthly"

    // Sum assured
    const sumAssuredAmt = quotePlan.category === "Life"
      ? lifeSumAssured
      : quotePlan.category === "Health"
        ? (healthMembersCount === 1 ? 500000 : 1000000)
        : quotePlan.category === "Vehicle"
          ? vehicleIdv
          : investAmount * investTenure * 12

    // Create new policy object
    const newPolicy: UserInsurance = {
      id: "pol_" + Math.random().toString(36).substring(2, 11),
      user_id: user.id,
      type: quotePlan.category.toLowerCase() === "investment" ? "life" : quotePlan.category.toLowerCase() as any,
      provider: quotePlan.name.includes("Life") ? "SBI Life" : "SBI General",
      policy_number: "SBI-" + quotePlan.name.slice(-4).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000),
      sum_assured: sumAssuredAmt,
      premium_amount: premAmt,
      premium_frequency: premFreq as any,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + lifeTenure * 365 * 24 * 3600000).toISOString(),
      status: "active",
      created_at: new Date().toISOString()
    }

    try {
      const data = await insuranceService.add({
        user_id: user.id,
        type: (quotePlan.category.toLowerCase() === "investment" ? "life" : quotePlan.category.toLowerCase()) as any,
        provider: quotePlan.name.includes("Life") ? "SBI Life" : "SBI General",
        policy_number: "SBI-" + quotePlan.name.slice(-4).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000),
        sum_assured: sumAssuredAmt,
        premium_amount: premAmt,
        premium_frequency: premFreq as any,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + lifeTenure * 365 * 24 * 3600000).toISOString(),
        status: "active",
      })
      setPolicies(prev => [...prev, data])
    } catch (err) {
      console.error("DB policy insert failed:", err)
    }

    // Add activity
    await addActivity("insurance", `Purchased insurance plan: ${quotePlan.name} with Cover ₹${sumAssuredAmt.toLocaleString("en-IN")}`, premAmt)
    showToast(`Application submitted! Policy ${newPolicy.policy_number} has been activated.`, "success")
  }

  // Handle policy renewal
  const handleRenewNow = async (policy: UserInsurance) => {
    if (!user) return

    const confirmRenew = window.confirm(`Renew policy ${policy.policy_number} for ₹${policy.premium_amount.toLocaleString("en-IN")} (${policy.premium_frequency})?`)
    if (!confirmRenew) return

    const renewalPrice = policy.premium_amount
    // Extend end date by 1 year or 1 month based on frequency
    const extension = policy.premium_frequency === "annual" ? 365 * 24 * 3600000 : 30 * 24 * 3600000
    const newEndDate = new Date(new Date(policy.end_date).getTime() + extension).toISOString()

    // Local updatedPolicy unused, using inline db updates

    try {
      const updated = await insuranceService.update(policy.id, {
        end_date: newEndDate,
        status: "active",
      })
      setPolicies(prev => prev.map(p => p.id === policy.id ? updated : p))
    } catch (err) {
      console.error("DB policy renewal update failed:", err)
    }

    await addActivity("payment", `Renewed insurance policy ${policy.policy_number}`, renewalPrice)
    showToast(`Policy ${policy.policy_number} successfully renewed! Extended coverage.`, "success")
  }

  // Handle claim submission
  const handleClaimSubmit = async () => {
    if (!user) return

    // Create reference number
    const refNum = "CLM-" + Math.floor(100000 + Math.random() * 900000)
    setGeneratedClaimId(refNum)
    setClaimStep(4)

    // Save activity
    const matchedPolicy = policies.find(p => p.id === claimPolicyId)
    await addActivity("agent", `Filed claim ${refNum} for policy ${matchedPolicy?.policy_number || 'Insurance'}`)
  }

  // Compare List toggle
  const handleToggleCompare = (plan: PlanProduct) => {
    if (compareList.some(p => p.id === plan.id)) {
      setCompareList(prev => prev.filter(p => p.id !== plan.id))
    } else {
      if (compareList.length >= 3) {
        showToast("You can compare up to 3 plans at a time.", "warning")
        return
      }
      setCompareList(prev => [...prev, plan])
    }
  }

  // Calculate Coverage Recommendations & Gaps
  const getCoverageAnalytics = () => {
    // 1. Annual income mapping
    let annualIncome = 900000 // default 9L
    if (profile?.income_range) {
      if (profile.income_range === "<25k") annualIncome = 240000
      else if (profile.income_range === "25k–50k") annualIncome = 450000
      else if (profile.income_range === "50k–1L") annualIncome = 900000
      else if (profile.income_range === "1L–5L") annualIncome = 3000000
      else if (profile.income_range === "5L+") annualIncome = 6000000
    }

    // Recommended amounts
    const recLife = Math.max(annualIncome * 10, 5000000)
    const recHealth = healthTargetType === "individual" ? 500000 : 1000000
    const recVehicle = 500000 // default recommendation for vehicle
    const recCritical = 2500000

    // Sum assured totals from active policies
    let activeLifeSum = 0
    let activeHealthSum = 0
    let activeVehicleSum = 0
    let activeCriticalSum = 0

    policies.forEach(p => {
      if (p.status !== "active") return
      if (p.type === "life") activeLifeSum += Number(p.sum_assured)
      else if (p.type === "health") activeHealthSum += Number(p.sum_assured)
      else if (p.type === "vehicle") activeVehicleSum += Number(p.sum_assured)
      else if (p.type === "critical") activeCriticalSum += Number(p.sum_assured)
    })

    // Compute gaps
    const gapLife = Math.max(0, recLife - activeLifeSum)
    const gapHealth = Math.max(0, recHealth - activeHealthSum)
    const gapVehicle = Math.max(0, recVehicle - activeVehicleSum)
    const gapCritical = Math.max(0, recCritical - activeCriticalSum)

    // Helper for Status
    const getStatus = (sum: number, rec: number) => {
      if (sum >= rec) return "covered"
      if (sum > 0) return "partial"
      return "none"
    }

    const lifeStatus = getStatus(activeLifeSum, recLife)
    const healthStatus = getStatus(activeHealthSum, recHealth)
    const vehicleStatus = getStatus(activeVehicleSum, recVehicle)
    const criticalStatus = getStatus(activeCriticalSum, recCritical)

    // Compute Adequacy Score out of 100
    // Each covered type at recommended amount = 25 points. Partial = 12.5. None = 0.
    let score = 0
    score += lifeStatus === "covered" ? 25 : lifeStatus === "partial" ? 12.5 : 0
    score += healthStatus === "covered" ? 25 : healthStatus === "partial" ? 12.5 : 0
    score += vehicleStatus === "covered" ? 25 : vehicleStatus === "partial" ? 12.5 : 0
    score += criticalStatus === "covered" ? 25 : criticalStatus === "partial" ? 12.5 : 0

    // Create gaps list
    const gapsList = []
    if (lifeStatus !== "covered") {
      gapsList.push({
        type: "life",
        title: "Life Insurance Gap",
        severity: lifeStatus === "none" ? "High" : "Medium",
        desc: "Without adequate life cover, your family could face severe financial distress to meet daily expenses, debt obligations, or educational expenses.",
        gapAmount: gapLife,
        estPremium: Math.round((gapLife / 1000000) * 120), // approx ₹120 per Lakh annual
      })
    }
    if (healthStatus !== "covered") {
      gapsList.push({
        type: "health",
        title: "Health Insurance Gap",
        severity: healthStatus === "none" ? "High" : "Medium",
        desc: "Hospitalization and medical costs rise by 15% yearly. A small medical cover can be exhausted rapidly, depleting your savings.",
        gapAmount: gapHealth,
        estPremium: Math.round((gapHealth / 100000) * 1200), // approx ₹1200 per Lakh annual
      })
    }
    if (vehicleStatus !== "none" && vehicleStatus !== "covered") {
      gapsList.push({
        type: "vehicle",
        title: "Vehicle Insufficient Cover",
        severity: "Low",
        desc: "Depreciation and accident liabilities can cause severe out-of-pocket expenses if your vehicle lacks a comprehensive zero-dep policy.",
        gapAmount: gapVehicle,
        estPremium: 4500,
      })
    } else if (vehicleStatus === "none") {
      // only show if user has vehicle or user goals indicate vehicles
      const wantsVehicle = ((profile?.goals as string[])?.includes("home_vehicle")) || ((profile?.loans as string[])?.includes("Car Loan"))
      if (wantsVehicle) {
        gapsList.push({
          type: "vehicle",
          title: "Vehicle Insurance Missing",
          severity: "Medium",
          desc: "Driving without third-party insurance is illegal. Lacking comprehensive damage protection could expose you to massive loss.",
          gapAmount: gapVehicle,
          estPremium: 6000,
        })
      }
    }
    if (criticalStatus !== "covered") {
      gapsList.push({
        type: "critical",
        title: "Critical Illness Shield Missing",
        severity: "Medium",
        desc: "Treating life-threatening conditions like heart stroke or cancer is extremely expensive and requires an upfront cash lumpsum for care.",
        gapAmount: gapCritical,
        estPremium: Math.round((gapCritical / 100000) * 250), // approx ₹250 per Lakh annual
      })
    }

    return {
      recLife,
      recHealth,
      recVehicle,
      recCritical,
      activeLifeSum,
      activeHealthSum,
      activeVehicleSum,
      activeCriticalSum,
      gapLife,
      gapHealth,
      gapVehicle,
      gapCritical,
      lifeStatus,
      healthStatus,
      vehicleStatus,
      criticalStatus,
      score,
      gapsList
    }
  }

  const analytics = getCoverageAnalytics()

  // Stepper Modal step actions
  const nextClaimStep = () => setClaimStep((prev) => Math.min(prev + 1, 4) as any)
  const prevClaimStep = () => setClaimStep((prev) => Math.max(prev - 1, 1) as any)

  const handleOpenQuote = (plan: PlanProduct) => {
    setQuotePlan(plan)
    if (plan.category === "Vehicle") {
      setVehicleType(plan.name.includes("Two-Wheeler") ? "Two-Wheeler" : plan.name.includes("Commercial") ? "Commercial" : "Car")
    }
    setShowQuoteModal(true)
  }

  // Simple Month Calendar generation (June 2026 as example)
  const renderCalendar = () => {
    // Show June 2026
    const daysInMonth = 30
    const startOffset = 1 // June 1st, 2026 is Monday

    // Create days array
    const days = []

    // Add empty spaces for offset
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10 text-slate-300 dark:text-slate-700"></div>)
    }

    // Map active policies due dates to calendar days
    // Life policy: 10th
    // Health policy: 15th
    // Vehicle policy: 20th
    for (let day = 1; day <= daysInMonth; day++) {
      let isDue = false
      let policyName = ""
      let amount = 0

      if (day === 10) {
        const lifePol = policies.find(p => p.type === "life" && p.status === "active")
        if (lifePol) {
          isDue = true
          policyName = lifePol.provider + " Term Plan"
          amount = lifePol.premium_amount
        }
      } else if (day === 15) {
        const healthPol = policies.find(p => p.type === "health" && p.status === "active")
        if (healthPol) {
          isDue = true
          policyName = healthPol.provider + " Health Plan"
          amount = healthPol.premium_amount
        }
      }

      days.push(
        <div
          key={`day-${day}`}
          className={`h-10 w-10 rounded-lg flex flex-col items-center justify-center text-xs relative group cursor-pointer border ${isDue
            ? "bg-amber-100/60 dark:bg-amber-950/20 border-amber-400 text-amber-800 dark:text-amber-300 font-bold"
            : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
        >
          <span>{day}</span>
          {isDue && (
            <>
              <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-slate-900 text-white rounded p-2 text-[10px] w-36 z-30 font-normal leading-normal shadow-lg">
                <span className="font-bold">{policyName}</span>
                <span>Premium: ₹{amount.toLocaleString("en-IN")}</span>
                <span className="text-amber-400">Due Today</span>
              </div>
            </>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-sm font-bold text-slate-850 dark:text-slate-200">June 2026</span>
          <div className="flex gap-2">
            <button className="h-6 w-6 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button className="h-6 w-6 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
          <span>Su</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    )
  }

  // Filter plans based on Category
  const filteredPlans = INSURANCE_PLANS.filter(plan => plan.category === categoryFilter)

  // Expiring policies: expiring in next 90 days
  const expiringPolicies = policies.filter(p => {
    // eslint-disable-next-line react-hooks/purity
    const daysLeft = Math.ceil((new Date(p.end_date).getTime() - Date.now()) / (24 * 3600000))
    return daysLeft > 0 && daysLeft <= 90 && p.status === "active"
  })

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl rounded-xl border p-4 max-w-sm flex items-center gap-3 bg-white dark:bg-slate-900 ${toastType === "success"
          ? "border-emerald-500/20"
          : toastType === "warning"
            ? "border-rose-500/20"
            : "border-blue-500/20"
          }`}>
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${toastType === "success"
            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
            : toastType === "warning"
              ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450"
              : "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
            }`}>
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-450 hover:text-slate-600 dark:hover:text-slate-350">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 text-left">

        {/* Top Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary dark:text-blue-500" />
              Insurance Protection
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Audit your financial safety cover, bridge security gaps, and explore SBI Life / General plans.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="inline-flex rounded-xl bg-slate-200/50 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("coverage")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "coverage"
                ? "bg-white text-primary dark:bg-slate-850 dark:text-blue-400 shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
            >
              My Coverage
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "explore"
                ? "bg-white text-primary dark:bg-slate-850 dark:text-blue-400 shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
            >
              Explore Plans
            </button>
            <button
              onClick={() => setActiveTab("claims")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${activeTab === "claims"
                ? "bg-white text-primary dark:bg-slate-850 dark:text-blue-400 shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
            >
              Claims & Renewals
            </button>
          </div>
        </div>

        {/* Insurance Score Dashboard Section */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-white to-slate-50/20 dark:from-slate-900 dark:to-slate-950/20">
          <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
            <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                strokeWidth="8"
                stroke="currentColor"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                strokeWidth="8"
                stroke="currentColor"
                className="text-primary dark:text-blue-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - analytics.score / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{analytics.score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
            </div>
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-primary dark:bg-blue-950/30 dark:text-blue-400 border border-primary/10">
                SBI Companion PROTECTION SUMMARY
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                Your family is {analytics.score}% financially protected
              </h2>
            </div>

            <p className="text-xs text-slate-555 leading-relaxed max-w-2xl">
              {analytics.score === 100
                ? "Outstanding! You have met all basic insurance recommendations (Life, Health, Vehicle, and Critical Illness protection). Your assets and dependent relatives are robustly shielded."
                : analytics.score >= 50
                  ? "Good progress, but you have critical coverage gaps. You are shielded in some areas, but a health emergency or sudden event could put your assets at risk."
                  : "Caution: Your insurance protection score is low. You lack active policies or hold cover amounts far below recommended benchmarks. Let's fix this."
              }
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveTab("explore")
                  setCategoryFilter("Health")
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow transition-all hover:translate-x-0.5"
              >
                Improve your protection
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Coverage Audit */}
        {activeTab === "coverage" && (
          <div className="space-y-8 animate-fadeIn">

            {/* Health Settings Quick-Toggle */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-200">Coverage Overview</h3>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-800">
                <button
                  onClick={() => setHealthTargetType("individual")}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${healthTargetType === "individual"
                    ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-450"
                    }`}
                >
                  Individual Health
                </button>
                <button
                  onClick={() => setHealthTargetType("family")}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${healthTargetType === "family"
                    ? "bg-white text-slate-900 shadow dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-450"
                    }`}
                >
                  Family Health (₹10L recommended)
                </button>
              </div>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* LIFE CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-primary dark:text-blue-400 flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    {analytics.lifeStatus === "covered" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Covered ✅
                      </span>
                    ) : analytics.lifeStatus === "partial" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        Partial ⚠️
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-450">
                        Not Covered ❌
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-200">Life Insurance</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Protects family dependents</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sum Assured:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{analytics.activeLifeSum.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{analytics.recLife.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {analytics.gapLife > 0 && (
                    <div className="flex justify-between text-rose-600 dark:text-rose-450 font-bold">
                      <span>Coverage Gap:</span>
                      <span>₹{analytics.gapLife.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveTab("explore")
                    setCategoryFilter("Life")
                  }}
                  className="w-full text-center text-xs font-bold text-primary dark:text-blue-400 hover:text-blue-700 pt-1 flex items-center justify-center gap-1 group"
                >
                  Improve Coverage
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* HEALTH CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 flex items-center justify-center">
                      <Heart className="h-5 w-5" />
                    </div>
                    {analytics.healthStatus === "covered" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Covered ✅
                      </span>
                    ) : analytics.healthStatus === "partial" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        Partial ⚠️
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-450">
                        Not Covered ❌
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-200">Health Insurance</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Covers medical emergencies</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sum Assured:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{analytics.activeHealthSum.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{analytics.recHealth.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {analytics.gapHealth > 0 && (
                    <div className="flex justify-between text-rose-600 dark:text-rose-450 font-bold">
                      <span>Coverage Gap:</span>
                      <span>₹{analytics.gapHealth.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveTab("explore")
                    setCategoryFilter("Health")
                  }}
                  className="w-full text-center text-xs font-bold text-primary dark:text-blue-400 hover:text-blue-700 pt-1 flex items-center justify-center gap-1 group"
                >
                  Improve Coverage
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* VEHICLE CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                      <Car className="h-5 w-5" />
                    </div>
                    {analytics.vehicleStatus === "covered" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Covered ✅
                      </span>
                    ) : analytics.vehicleStatus === "partial" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        Partial ⚠️
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-450">
                        Not Covered ❌
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-200">Vehicle Insurance</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Third-party and Own Damage</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sum Assured:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{analytics.activeVehicleSum.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      As per vehicle value
                    </span>
                  </div>
                  {analytics.gapVehicle > 0 && (
                    <div className="flex justify-between text-rose-600 dark:text-rose-450 font-bold">
                      <span>Coverage Gap:</span>
                      <span>₹{analytics.gapVehicle.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveTab("explore")
                    setCategoryFilter("Vehicle")
                  }}
                  className="w-full text-center text-xs font-bold text-primary dark:text-blue-400 hover:text-blue-700 pt-1 flex items-center justify-center gap-1 group"
                >
                  Improve Coverage
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* CRITICAL ILLNESS CARD */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Activity className="h-5 w-5" />
                    </div>
                    {analytics.criticalStatus === "covered" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Covered ✅
                      </span>
                    ) : analytics.criticalStatus === "partial" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        Partial ⚠️
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/30 dark:text-rose-450">
                        Not Covered ❌
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-850 dark:text-slate-200">Critical Illness</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Cancer, cardiac stroke cover</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sum Assured:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{analytics.activeCriticalSum.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{analytics.recCritical.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {analytics.gapCritical > 0 && (
                    <div className="flex justify-between text-rose-600 dark:text-rose-450 font-bold">
                      <span>Coverage Gap:</span>
                      <span>₹{analytics.gapCritical.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveTab("explore")
                    setCategoryFilter("Health")
                  }}
                  className="w-full text-center text-xs font-bold text-primary dark:text-blue-400 hover:text-blue-700 pt-1 flex items-center justify-center gap-1 group"
                >
                  Improve Coverage
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

            </div>

            {/* Coverage Gap Analyzer Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Companion found {analytics.gapsList.length} coverage gaps in your profile
                </h3>
              </div>

              {analytics.gapsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.gapsList.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-left flex flex-col justify-between space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{gap.title}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${gap.severity === "High"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450"
                              : gap.severity === "Medium"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              }`}
                          >
                            {gap.severity} Severity
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {gap.desc}
                        </p>
                      </div>

                      <div className="border-t border-slate-150 dark:border-slate-800/60 pt-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Estimated Gap Premium:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            ~₹{gap.estPremium.toLocaleString("en-IN")}/year
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab("explore")
                            setCategoryFilter(gap.type === "life" ? "Life" : gap.type === "vehicle" ? "Vehicle" : "Health")
                          }}
                          className="rounded-lg bg-primary/10 px-3 py-1.5 font-bold text-primary hover:bg-primary/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 text-[10px]"
                        >
                          Bridge Gap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10 text-center flex flex-col items-center gap-3">
                  <ShieldCheck className="h-12 w-12 text-emerald-600 dark:text-emerald-450" />
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                    Excellent! You have fully bridged all protection gaps and secured your family.
                  </p>
                </div>
              )}

              {/* Chat CTA Link */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const message = `Hi Companion, I want to discuss my insurance audit details. I have a protection score of ${analytics.score}/100 and detected ${analytics.gapsList.length} coverage gaps. Can you guide me through fixing them?`
                    navigate("/agent", { state: { prefilledMessage: message } })
                  }}
                  className="inline-flex items-center gap-1 font-bold text-primary hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300 text-xs transition-all hover:translate-x-0.5"
                >
                  Talk to Companion about my coverage <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Explore Plans */}
        {activeTab === "explore" && (
          <div className="space-y-8 animate-fadeIn">

            {/* Category selection filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex flex-wrap gap-2">
                {["Life", "Health", "Vehicle", "Investment"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat as any)}
                    className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all border ${categoryFilter === cat
                      ? "bg-primary text-white border-primary dark:bg-blue-600 dark:border-blue-600 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 hover:bg-slate-50 dark:text-slate-350"
                      }`}
                  >
                    {cat === "Life"
                      ? "Life Insurance"
                      : cat === "Health"
                        ? "Health Insurance"
                        : cat === "Vehicle"
                          ? "Vehicle Insurance"
                          : "Investment + Insurance"
                    }
                  </button>
                ))}
              </div>

              {/* Floating Compare trigger */}
              {compareList.length > 0 && (
                <button
                  onClick={() => setShowCompareSection(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow animate-pulse"
                >
                  Compare Plans ({compareList.length}/3)
                </button>
              )}
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => {
                const isComparing = compareList.some(p => p.id === plan.id)
                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-6 hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    {/* Hover highlights */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary dark:bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-all origin-left"></div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="rounded bg-primary/10 px-2.5 py-1 text-[9px] font-extrabold text-primary dark:bg-blue-500/10 dark:text-blue-400 uppercase tracking-wide">
                          {plan.typeBadge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          CSR: {plan.claimRatio}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-slate-400 leading-normal line-clamp-2">
                          {plan.description}
                        </p>
                      </div>

                      {/* Benefits Bullets */}
                      <ul className="space-y-2 text-xs text-slate-555 leading-relaxed">
                        {plan.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Starting from</span>
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {plan.startingPremium}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Solvency: {plan.solvencyRatio}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleToggleCompare(plan)}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${isComparing
                            ? "bg-amber-100/50 border-amber-400 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 hover:bg-slate-50 dark:text-slate-350"
                            }`}
                        >
                          {isComparing ? "Comparing ✓" : "Compare"}
                        </button>
                        <button
                          onClick={() => handleOpenQuote(plan)}
                          className="rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-3 py-2.5 text-xs font-bold text-white shadow transition-all"
                        >
                          Get Quote
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Compare Drawer / Section */}
            {(showCompareSection || compareList.length > 0) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Plan Comparison Matrix
                  </h3>
                  <button
                    onClick={() => {
                      setCompareList([])
                      setShowCompareSection(false)
                    }}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                {compareList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 uppercase font-black text-[10px] tracking-wider">
                          <th className="py-3 px-4 w-1/4">Parameters</th>
                          {compareList.map(p => (
                            <th key={p.id} className="py-3 px-4 w-1/4 text-center">
                              {p.name}
                            </th>
                          ))}
                          {compareList.length < 3 && (
                            <th className="py-3 px-4 text-center text-slate-300 dark:text-slate-700">
                              Select plan to compare
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="py-4 px-4 font-bold text-slate-500">Plan Category</td>
                          {compareList.map(p => (
                            <td key={p.id} className="py-4 px-4 text-center font-semibold text-slate-850 dark:text-slate-200">
                              {p.typeBadge}
                            </td>
                          ))}
                          {compareList.length < 3 && <td></td>}
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="py-4 px-4 font-bold text-slate-500">Starting Premium</td>
                          {compareList.map(p => (
                            <td key={p.id} className="py-4 px-4 text-center font-bold text-slate-900 dark:text-white">
                              {p.startingPremium}
                            </td>
                          ))}
                          {compareList.length < 3 && <td></td>}
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="py-4 px-4 font-bold text-slate-500">Claim Settlement Ratio</td>
                          {compareList.map(p => (
                            <td key={p.id} className="py-4 px-4 text-center font-semibold text-slate-850 dark:text-slate-200">
                              {p.claimRatio}
                            </td>
                          ))}
                          {compareList.length < 3 && <td></td>}
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="py-4 px-4 font-bold text-slate-500">Solvency Ratio</td>
                          {compareList.map(p => (
                            <td key={p.id} className="py-4 px-4 text-center font-semibold text-slate-850 dark:text-slate-200">
                              {p.solvencyRatio}
                            </td>
                          ))}
                          {compareList.length < 3 && <td></td>}
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="py-4 px-4 font-bold text-slate-500">Medical Checkup</td>
                          {compareList.map(p => (
                            <td key={p.id} className="py-4 px-4 text-center text-slate-500">
                              {p.checkupRequired}
                            </td>
                          ))}
                          {compareList.length < 3 && <td></td>}
                        </tr>
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                          <td className="py-4 px-4 font-bold text-slate-500">Key Benefits</td>
                          {compareList.map(p => (
                            <td key={p.id} className="py-4 px-4 text-left font-normal text-slate-500 leading-normal align-top">
                              <ul className="space-y-1 list-disc list-inside">
                                {p.benefits.map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                            </td>
                          ))}
                          {compareList.length < 3 && <td></td>}
                        </tr>
                        <tr>
                          <td></td>
                          {compareList.map(p => (
                            <td key={p.id} className="py-4 px-4 text-center">
                              <button
                                onClick={() => handleOpenQuote(p)}
                                className="rounded-lg bg-primary text-white hover:bg-blue-700 px-4 py-2 font-bold text-[10px]"
                              >
                                Apply Now
                              </button>
                            </td>
                          ))}
                          {compareList.length < 3 && <td></td>}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-450 text-center py-4">
                    Click "Compare" on the plan cards above to view a detailed parameter comparison matrix here.
                  </p>
                )}
              </div>
            )}

          </div>
        )}

        {/* Tab 3: Claims & Renewals */}
        {activeTab === "claims" && (
          <div className="space-y-8 animate-fadeIn">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Claims Left Card */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary dark:text-blue-400" />
                    File an Insurance Claim
                  </h3>
                  <p className="text-xs text-slate-555 leading-relaxed">
                    Experiencing a medical emergency, minor vehicle scrape, or critical diagnosis?
                    Submit details through Companion's claim helper. We'll pre-fill your documentation
                    and submit it directly to SBI claim surveyors for swift assessment.
                  </p>

                  {/* Claim Guidelines List */}
                  <div className="bg-slate-50/50 p-4 rounded-xl dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
                    <span className="font-bold text-slate-850 dark:text-slate-200 block uppercase tracking-wider text-[10px]">
                      Required Documents Checklist:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Policy document copy</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Medical discharge or FIR bills</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>KYC documents (Aadhaar / PAN)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span>Bank details (Cancelled cheque)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      if (policies.length === 0) {
                        showToast("You don't have any active policies to file a claim against.", "warning")
                        return
                      }
                      setClaimPolicyId(policies[0].id)
                      setClaimStep(1)
                      setShowClaimModal(true)
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-3 text-xs font-bold text-white shadow"
                  >
                    File a Claim Now
                  </button>
                </div>
              </div>

              {/* Renewals Right Calendar Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  Premium Calendar
                </h3>

                {renderCalendar()}
              </div>

            </div>

            {/* Renewals List Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500 animate-pulse" />
                Policies Expiring in Next 90 Days
              </h3>

              {expiringPolicies.length > 0 ? (
                <div className="space-y-4">
                  {expiringPolicies.map((pol) => {
                    // eslint-disable-next-line react-hooks/purity
                    const daysLeft = Math.ceil((new Date(pol.end_date).getTime() - Date.now()) / (24 * 3600000))
                    const isUrgent = daysLeft <= 30
                    return (
                      <div
                        key={pol.id}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isUrgent
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            }`}>
                            <ShieldAlert className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {pol.provider} {pol.type.toUpperCase()} Cover
                              </h4>
                              <span className={`rounded px-2 py-0.5 text-[9px] font-black uppercase ${isUrgent
                                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                }`}>
                                {daysLeft} Days Left
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Policy No: {pol.policy_number} • Sum Assured: ₹{pol.sum_assured.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Premium due</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              ₹{pol.premium_amount.toLocaleString("en-IN")}
                              <span className="text-[10px] font-medium text-slate-450">/{pol.premium_frequency}</span>
                            </span>
                          </div>
                          <button
                            onClick={() => handleRenewNow(pol)}
                            className="rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow"
                          >
                            Renew Now
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 text-center text-slate-450 text-xs">
                  No policies are expiring in the next 90 days. All active covers are secure.
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* 1. Premium Quote Modal */}
      {showQuoteModal && quotePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800 max-h-[90vh] overflow-y-auto text-left relative space-y-6">

            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-primary dark:text-blue-400 tracking-wider">
                SBI Premium Quote Calculator
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {quotePlan.name}
              </h3>
            </div>

            {/* Dynamic Quote Fields based on Category */}
            <div className="space-y-4">

              {/* LIFE INSURANCE INPUTS */}
              {quotePlan.category === "Life" && (
                <div className="space-y-4">
                  {/* Age Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>APPLICANT AGE</span>
                      <span className="text-primary dark:text-blue-400">{lifeAge} years</span>
                    </div>
                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={lifeAge}
                      onChange={(e) => setLifeAge(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-slate-850"
                    />
                  </div>

                  {/* Sum Assured Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>DESIRED SUM ASSURED</span>
                      <span className="text-primary dark:text-blue-400">
                        ₹{(lifeSumAssured / 100000).toLocaleString("en-IN")} Lakhs (₹{(lifeSumAssured / 10000000).toFixed(1)} Cr)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2500000" // 25 Lakhs
                      max="50000000" // 5 Crore
                      step="2500000"
                      value={lifeSumAssured}
                      onChange={(e) => setLifeSumAssured(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-slate-850"
                    />
                  </div>

                  {/* Tenure Input */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>COVERAGE TENURE</span>
                      <span className="text-primary dark:text-blue-400">{lifeTenure} years</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={lifeTenure}
                      onChange={(e) => setLifeTenure(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-slate-850"
                    />
                  </div>

                  {/* Smoker Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <div className="text-xs">
                      <span className="font-bold text-slate-850 dark:text-slate-200 block">Tobacco / Smoking Consumer</span>
                      <span className="text-[10px] text-slate-400">Required for accurate underwriting calculations.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lifeIsSmoker}
                        onChange={(e) => setLifeIsSmoker(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* HEALTH INSURANCE INPUTS */}
              {quotePlan.category === "Health" && (
                <div className="space-y-4">
                  {/* Members count select */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500">NUMBER OF MEMBERS COVERED</label>
                    <div className="grid grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            setHealthMembersCount(num)
                            // Resize ages array
                            const newAges = [...healthAges]
                            while (newAges.length < num) newAges.push(28)
                            setHealthAges(newAges.slice(0, num))
                          }}
                          className={`py-2 rounded-lg text-xs font-bold border ${healthMembersCount === num
                            ? "bg-primary text-white border-primary dark:bg-blue-600"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600"
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Members ages inputs */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500">MEMBER AGES (YEARS)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: healthMembersCount }).map((_, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[10px] text-slate-400 block font-bold">
                            Member {idx === 0 ? "1 (Primary)" : idx + 1}
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={healthAges[idx] || 30}
                            onChange={(e) => {
                              const newAges = [...healthAges]
                              newAges[idx] = parseInt(e.target.value) || 0
                              setHealthAges(newAges)
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:bg-white outline-none dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* City Tier Select */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500">CITY OF RESIDENCE RESIDENCY TIER</label>
                    <select
                      value={healthCityTier}
                      onChange={(e) => setHealthCityTier(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="Tier 1">Tier 1 (Metro Cities: Delhi, Mumbai, Bengaluru, etc.)</option>
                      <option value="Tier 2">Tier 2 (Non-Metro State Capitals: Jaipur, Lucknow, etc.)</option>
                      <option value="Tier 3">Tier 3 (Other Cities / Districts)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* VEHICLE INSURANCE INPUTS */}
              {quotePlan.category === "Vehicle" && (
                <div className="space-y-4">
                  {/* Vehicle Type selection (read only matched to plan) */}
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-400 block font-bold">VEHICLE TYPE CATEGORY</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded inline-block">
                      {vehicleType === "Car" ? "Car" : vehicleType === "Two-Wheeler" ? "Two-Wheeler" : "Commercial Truck"}
                    </span>
                  </div>

                  {/* IDV Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>INSURED DECLARED VALUE (IDV)</span>
                      <span className="text-primary dark:text-blue-400">
                        ₹{vehicleIdv.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={vehicleType === "Two-Wheeler" ? "30000" : vehicleType === "Car" ? "200000" : "800000"}
                      max={vehicleType === "Two-Wheeler" ? "200000" : vehicleType === "Car" ? "2500000" : "6000000"}
                      step={vehicleType === "Two-Wheeler" ? "5000" : "50000"}
                      value={vehicleIdv}
                      onChange={(e) => setVehicleIdv(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-slate-850"
                    />
                  </div>

                  {/* Vehicle Age */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>VEHICLE AGE</span>
                      <span className="text-primary dark:text-blue-400">{vehicleAge} years</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={vehicleAge}
                      onChange={(e) => setVehicleAge(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-slate-850"
                    />
                  </div>
                </div>
              )}

              {/* INVESTMENT INPUTS */}
              {quotePlan.category === "Investment" && (
                <div className="space-y-4">
                  {/* Monthly Investment */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>MONTHLY DEPOSIT AMOUNT</span>
                      <span className="text-primary dark:text-blue-400">₹{investAmount.toLocaleString("en-IN")}/month</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="1000"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-slate-850"
                    />
                  </div>

                  {/* Policy term */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>INVESTMENT TERM (YEARS)</span>
                      <span className="text-primary dark:text-blue-400">{investTenure} years</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      value={investTenure}
                      onChange={(e) => setInvestTenure(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-slate-850"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Calculated Quote Results */}
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-450 block font-bold uppercase tracking-wider text-[9px]">
                  Estimated Annual Premium
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{calculatedPremium.toLocaleString("en-IN")}
                  <span className="text-[10px] text-slate-450 font-normal"> /year</span>
                </span>
                {quotePlan.startingPremium.includes("month") && (
                  <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                    (~₹{Math.round(calculatedPremium / 12).toLocaleString("en-IN")}/month)
                  </span>
                )}
              </div>

              {quotePlan.category === "Investment" && (
                <div className="text-right">
                  <span className="text-slate-450 block font-bold uppercase tracking-wider text-[9px]">
                    Guaranteed Maturity Cover
                  </span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    ~₹{Math.round(investAmount * 12 * investTenure * 1.5).toLocaleString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedApply}
                disabled={isSubmittingQuote}
                className="flex-1 rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 py-3 text-xs font-bold text-white shadow disabled:opacity-50"
              >
                {isSubmittingQuote ? "Submitting..." : "Proceed to Apply"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Claims Stepper Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 dark:bg-slate-900 dark:border-slate-800 text-left relative space-y-6">

            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Stepper Progress Indicator */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>File an Insurance Claim</span>
                <span className="text-primary dark:text-blue-400">Step {claimStep} of 4</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary dark:bg-blue-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${(claimStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Dynamic Step Contents */}
            <div className="min-h-[200px] flex flex-col justify-between">

              {/* STEP 1: Select Policy */}
              {claimStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Select coverage policy</h4>
                    <p className="text-xs text-slate-400">Choose the active insurance cover to file the surveyor claim against.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Active Policies</label>
                    <select
                      value={claimPolicyId}
                      onChange={(e) => setClaimPolicyId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      {policies.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.provider} ({p.type.toUpperCase()}) Cover • Policy No: {p.policy_number}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Claim details */}
              {claimStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Enter claim details</h4>
                    <p className="text-xs text-slate-400">Provide incident specifications and type of claim payout.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Payout Mode</label>
                      <div className="grid grid-cols-2 gap-4">
                        {["Cashless", "Reimbursement"].map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setClaimType(mode)}
                            className={`py-2 rounded-lg text-xs font-bold border ${claimType === mode
                              ? "bg-primary text-white border-primary dark:bg-blue-600"
                              : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600"
                              }`}
                          >
                            {mode} Settlement
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase">Incident Description</label>
                      <textarea
                        value={claimDescription}
                        onChange={(e) => setClaimDescription(e.target.value)}
                        placeholder="Please describe what happened (hospital admission details, vehicle damage details, etc.)"
                        rows={4}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none dark:border-slate-700 dark:bg-slate-850 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Upload files */}
              {claimStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Upload supporting files</h4>
                    <p className="text-xs text-slate-400">Attach clinical reports, bills, receipts, or damage photographs.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Drag and drop zone */}
                    <div
                      onClick={() => setClaimUploadedFiles(["medical_bills_report.pdf", "discharge_slip.pdf"])}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100/50 cursor-pointer transition-all flex flex-col items-center gap-2 group"
                    >
                      <Upload className="h-8 w-8 text-slate-400 group-hover:text-primary dark:group-hover:text-blue-400 transition-all" />
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-250 mt-1">
                        Click to upload supporting documents
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Supports PDF, JPEG, PNG (Max 10MB)
                      </span>
                    </div>

                    {/* Show files list */}
                    {claimUploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Uploaded Files:</span>
                        <div className="space-y-1.5">
                          {claimUploadedFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 text-xs">
                              <span className="text-slate-700 dark:text-slate-300 font-semibold">{f}</span>
                              <button onClick={() => setClaimUploadedFiles([])} className="text-rose-500">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Success confirmation */}
              {claimStep === 4 && (
                <div className="text-center p-6 flex flex-col items-center gap-4 animate-fadeIn">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-10 w-10" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Claim Filed Successfully!</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Your claim request has been registered and is undergoing verify audits by SBI surveyors.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 font-mono text-xs w-full">
                    Reference ID: <span className="font-bold text-primary dark:text-blue-400">{generatedClaimId}</span>
                  </div>
                </div>
              )}

              {/* Stepper Actions footer */}
              <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800 mt-6">
                {claimStep > 1 && claimStep < 4 ? (
                  <button
                    onClick={prevClaimStep}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {claimStep === 4 ? (
                  <button
                    onClick={() => setShowClaimModal(false)}
                    className="w-full rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 py-3 text-xs font-bold text-white shadow"
                  >
                    Finish Setup
                  </button>
                ) : claimStep === 3 ? (
                  <button
                    onClick={handleClaimSubmit}
                    className="rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow"
                  >
                    Submit Claim
                  </button>
                ) : (
                  <button
                    onClick={nextClaimStep}
                    className="rounded-xl bg-primary hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 px-6 py-2.5 text-xs font-bold text-white shadow"
                  >
                    Continue
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
