/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import {
  CreditCard,
  Check,
  Gift,
  HelpCircle,
  Award,
  ShieldCheck,
  TrendingUp,
  Compass,
  ChevronRight,
  User,
  MapPin,
  Briefcase,
  Layers,
  ArrowRightLeft,
  Smartphone,
  CheckCircle2
} from "lucide-react"

// Hardcoded credit card database
const CREDIT_CARDS_DATA = [
  {
    id: "elite",
    name: "SBI Card ELITE",
    category: "Premium",
    fee: "₹4,999 + GST",
    rewards: "5X Reward Points on Dining, Departmental stores & Movie bookings. 2 Reward Points per ₹100 spent on all other categories.",
    perks: "Welcome e-Gift Voucher worth ₹5,000, free domestic & international airport lounge access (6 Priority Pass visits/year), 2 complimentary movie tickets worth ₹500 every month.",
    features: [
      "Welcome Gift: e-Gift Voucher worth ₹5,000 from top brands",
      "Free Movie Tickets: Worth ₹6,000 per year (₹500/month)",
      "Lounge Access: 6 free international & 8 free domestic visits/year",
      "Milestone Rewards: Up to 50,000 Bonus Reward Points (worth ₹12,500) annually",
      "Low Foreign Markup: 1.99% currency conversion rate"
    ],
    colorClass: "from-slate-950 via-slate-800 to-amber-950",
    textClass: "text-amber-400",
    cardType: "ELITE"
  },
  {
    id: "prime",
    name: "SBI Card Prime",
    category: "Premium",
    fee: "₹2,999 + GST",
    rewards: "10 Reward Points per ₹100 spent on Dining, Groceries, Departmental stores & Movies. 2 Reward Points on other categories.",
    perks: "Welcome Pizza Hut/Shopper Stop Voucher worth ₹3,000, 4 free international lounge visits/year, Trident & Club Vistara membership privileges.",
    features: [
      "Welcome Gift: Voucher worth ₹3,000 from partner brands",
      "Dining & Grocery Boost: 10 Reward Points (4% return) on everyday items",
      "Lounge Privileges: 4 free international & 8 free domestic visits/year",
      "Milestone Reward: Get ₹7,000 worth of gift vouchers on ₹5 Lakh annual spend",
      "Trident Privilege Red Tier: Complimentary membership with welcome points"
    ],
    colorClass: "from-indigo-950 via-blue-900 to-slate-900",
    textClass: "text-indigo-200",
    cardType: "PRIME"
  },
  {
    id: "simplyclick",
    name: "SimplyClick SBI Card",
    category: "Shopping",
    fee: "₹499 + GST",
    rewards: "10X Reward Points on online spending with partners (Amazon, Netmeds, Cleartrip, Apollo). 5X on other online spending.",
    perks: "Welcome Amazon Gift Card worth ₹500, annual fee reversal on annual spends of ₹1,00,000.",
    features: [
      "Welcome Gift: Amazon e-Gift Voucher worth ₹500",
      "Online Shopping Boost: 10X rewards (2.5% return) on partner brands",
      "Other Online Spends: 5X rewards (1.25% return) on all online websites",
      "Fee Waiver: Reversed in subsequent year on ₹1 Lakh annual spend",
      "Milestone Bonus: ₹2,000 Cleartrip/online vouchers on ₹1 Lakh and ₹2 Lakh spends"
    ],
    colorClass: "from-teal-700 via-emerald-600 to-cyan-800",
    textClass: "text-emerald-100",
    cardType: "SimplyClick"
  },
  {
    id: "simplysave",
    name: "SimplySAVE SBI Card",
    category: "Shopping",
    fee: "₹499 + GST",
    rewards: "10X Reward Points on Dining, Movies, Departmental stores & Grocery spends. 1 point per ₹100 on other categories.",
    perks: "2,000 bonus reward points (worth ₹500) on spends of ₹2,000 or more in the first 60 days, fuel surcharge waiver.",
    features: [
      "Welcome Benefit: 2,000 Bonus points on ₹2,000 spent within 60 days",
      "Everyday Spends Boost: 10X points (2.5% value) on dining, movies, and groceries",
      "Cashback Redemption: Convert reward points to pay card outstanding balance",
      "Fee Waiver: Reversed in subsequent year on ₹90,000 annual spend",
      "Fuel Surcharge Waiver: 1% waiver at all petrol pumps globally"
    ],
    colorClass: "from-rose-600 via-orange-500 to-amber-600",
    textClass: "text-orange-100",
    cardType: "SimplySAVE"
  },
  {
    id: "pulse",
    name: "SBI Card Pulse",
    category: "Wellness",
    fee: "₹1,499 + GST",
    rewards: "5X Reward Points on Chemists, Pharmacies, Dining & Movie spends. 2 Reward Points on all other retail categories.",
    perks: "Noise ColorFit Pulse Smartwatch welcome gift, annual FITPASS PRO & Netmeds First memberships, lounge access.",
    features: [
      "Welcome Gift: Noise ColorFit Pulse Smartwatch worth ₹4,999",
      "Health Memberships: Annual FITPASS PRO (gym/fitness) & Netmeds First",
      "Medical Spends Boost: 5X reward points on pharmacies and chemists",
      "Lounge Access: 8 free domestic visits/year & Priority Pass annual membership",
      "Fee Waiver: Reversed in subsequent year on ₹2 Lakh annual spend"
    ],
    colorClass: "from-slate-900 via-emerald-800 to-slate-950",
    textClass: "text-emerald-400",
    cardType: "PULSE"
  },
  {
    id: "airindia",
    name: "Air India SBI Signature",
    category: "Travel",
    fee: "₹4,999 + GST",
    rewards: "Up to 30 Reward Points per ₹100 spent on Air India flight bookings. 4 Reward Points per ₹100 on other categories.",
    perks: "Welcome gift of 20,000 Air India frequent flyer miles, domestic & international lounge access, milestone mileage gifts.",
    features: [
      "Welcome Gift: 20,000 Air India Flying Returns Points",
      "Travel Supercharge: 30 points (approx 12% back) booking Air India flights",
      "Mileage Conversion: Convert points to Air India flying returns miles (1:1)",
      "Domestic Lounge Access: 8 free visits/year in select Indian airports",
      "Milestone Bonus: Up to 1,00,000 Air India bonus miles on high annual spends"
    ],
    colorClass: "from-red-600 via-amber-500 to-rose-700",
    textClass: "text-amber-200",
    cardType: "TRAVEL"
  }
]

export const CardsPage: React.FC = () => {
  const { profile, addActivity } = useAuth()

  const ownedCard = profile?.existing_credit_card === "other"
    ? {
        id: "other",
        name: "Premium Platinum Card",
        category: "Shopping & Travel",
        fee: "₹0 (Other Bank)",
        rewards: "Standard cashback on all transactions.",
        perks: "Airport Lounge access, Fuel surcharge waiver.",
        features: ["Worldwide acceptance", "Complimentary fraud protection"],
        colorClass: "from-slate-700 via-zinc-800 to-slate-900",
        textClass: "text-zinc-200",
        cardType: "PLATINUM"
      }
    : CREDIT_CARDS_DATA.find(c => c.id === profile?.existing_credit_card)

  const creditLimit = profile?.income_range === "5L+" ? 1000000 : profile?.income_range === "1L–5L" ? 500000 : 150000
  const dueDate = "July 12, 2026"

  // Tab State
  const [activeCategory, setActiveCategory] = useState("All")

  // Comparison State
  const [compareCard1, setCompareCard1] = useState("elite")
  const [compareCard2, setCompareCard2] = useState("simplyclick")

  // Eligibility Recommender Wizard State
  const [incomeRange, setIncomeRange] = useState("")
  const [primarySpend, setPrimarySpend] = useState("")
  const [recommendedCard, setRecommendedCard] = useState<any | null>(null)

  // Application Modal State
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [selectedCardForApply, setSelectedCardForApply] = useState<any>(CREDIT_CARDS_DATA[0])
  const [applyStep, setApplyStep] = useState(1) // 1: Personal, 2: Financial, 3: OTP, 4: Success

  // Application Form Inputs
  const [applyName, setApplyName] = useState("")
  const [applyPhone, setApplyPhone] = useState("")
  const [applyCity, setApplyCity] = useState("")
  const [applyEmployer, setApplyEmployer] = useState("")
  const [applyJobType, setApplyJobType] = useState("salaried")
  const [applyIncome, setApplyIncome] = useState("")
  const [otpInput, setOtpInput] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(30)
  const [otpError, setOtpError] = useState("")
  const [applicationId, setApplicationId] = useState("")
  const timerRef = useRef<any>(null)

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState<"success" | "info" | "error">("success")
  const [showToast, setShowToast] = useState(false)

  // Active Card States
  const [outstanding, setOutstanding] = useState(24505)
  const [showPayModal, setShowPayModal] = useState(false)
  const [payAmount, setPayAmount] = useState("")

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(payAmount)
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount.")
      return
    }
    if (amt > outstanding) {
      alert("Amount cannot exceed outstanding balance.")
      return
    }
    setOutstanding(prev => prev - amt)
    setShowPayModal(false)
    setPayAmount("")
    triggerToast(`Payment of ₹${amt.toLocaleString()} processed successfully!`, "success")
  }

  const triggerToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage(msg)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Populate prefilled personal details from user profile
  useEffect(() => {
    if (profile) {
      setApplyName(profile.name || "")
      setApplyCity(profile.city || "")
      // Set phone if available, or keep blank
      setApplyPhone((profile as any).phone || "")
    }
  }, [profile])

  // OTP Timer countdown
  useEffect(() => {
    if (otpSent && otpTimer > 0) {
      timerRef.current = setTimeout(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [otpSent, otpTimer])

  // Filter Cards list
  const filteredCards = activeCategory === "All"
    ? CREDIT_CARDS_DATA
    : CREDIT_CARDS_DATA.filter(c => c.category === activeCategory)

  // Handle recommender check
  const handleRecommend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!incomeRange || !primarySpend) {
      alert("Please select both your income range and primary spending category.")
      return
    }

    let recommended = CREDIT_CARDS_DATA[2] // Default: SimplyClick

    if (incomeRange === "above_1l") {
      recommended = primarySpend === "travel" ? CREDIT_CARDS_DATA[5] : CREDIT_CARDS_DATA[0] // Air India or Elite
    } else if (incomeRange === "50k_1l") {
      if (primarySpend === "travel") recommended = CREDIT_CARDS_DATA[5]
      else if (primarySpend === "wellness") recommended = CREDIT_CARDS_DATA[4]
      else recommended = CREDIT_CARDS_DATA[1] // Prime
    } else if (incomeRange === "25k_50k") {
      if (primarySpend === "wellness") recommended = CREDIT_CARDS_DATA[4]
      else if (primarySpend === "dining") recommended = CREDIT_CARDS_DATA[3] // SimplySAVE
      else recommended = CREDIT_CARDS_DATA[2] // SimplyClick
    } else {
      // Under 25k
      recommended = primarySpend === "dining" ? CREDIT_CARDS_DATA[3] : CREDIT_CARDS_DATA[2]
    }

    setRecommendedCard(recommended)
    triggerToast(`Recommended: ${recommended.name} based on your preferences!`, "info")
  }

  // Open Application form
  const handleOpenApply = (card: any) => {
    setSelectedCardForApply(card)
    setApplyStep(1)
    setOtpSent(false)
    setOtpInput("")
    setOtpTimer(30)
    setOtpError("")
    setShowApplyModal(true)
  }

  // Application Step 1 Next
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!applyName || !applyPhone || !applyCity) {
      alert("Please fill in all personal details.")
      return
    }
    setApplyStep(2)
  }

  // Application Step 2 Next
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!applyEmployer || !applyIncome) {
      alert("Please fill in employer details and annual income.")
      return
    }
    // Trigger OTP sending simulation
    setOtpSent(true)
    setOtpTimer(30)
    setApplyStep(3)
  }

  // Resend OTP
  const handleResendOtp = () => {
    setOtpTimer(30)
    setOtpInput("")
    setOtpError("")
    triggerToast("OTP code re-sent to your mobile number.", "info")
  }

  // Confirm Application OTP
  const handleVerifyApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpInput !== "123456") {
      setOtpError("Invalid OTP verification code. Please enter '123456'.")
      return
    }

    // Generate simulated Application ID
    const trackingId = "APP-SBI-CC-" + Math.floor(100000 + Math.random() * 900000)
    setApplicationId(trackingId)

    // Save activity
    await addActivity("agent", `Applied for SBI Credit Card: ${selectedCardForApply.name} (App ID: ${trackingId})`)

    setApplyStep(4)
    triggerToast("Credit Card application submitted successfully!", "success")
  }

  // Card objects for comparison selection
  const card1 = CREDIT_CARDS_DATA.find(c => c.id === compareCard1) || CREDIT_CARDS_DATA[0]
  const card2 = CREDIT_CARDS_DATA.find(c => c.id === compareCard2) || CREDIT_CARDS_DATA[2]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-primary mb-2">
            <CreditCard className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            SBI Credit Cards Portal
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
            Choose from our curated range of credit cards offering premier lifestyle milestones, unlimited shopping rewards, global travel points, and wellness benefits.
          </p>
        </div>

        {/* ACTIVE CREDIT CARD DASHBOARD (Shown only if user has credit card) */}
        {profile?.has_credit_card && ownedCard && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 md:p-8 shadow-md space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <span className="text-[10px] bg-blue-100 text-primary dark:bg-blue-950 dark:text-blue-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Your Account Dashboard
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Your Active Credit Card</h2>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPayAmount(outstanding.toString())
                    setShowPayModal(true)
                  }}
                  disabled={outstanding === 0}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                >
                  Pay Outstanding Bill
                </button>
                <button
                  onClick={() => triggerToast("Displaying statement downloads. Simulated PDF statement generated successfully.", "info")}
                  className="rounded-xl border border-slate-200 dark:border-slate-850 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  View Statements
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Card visual representation */}
              <div className="lg:col-span-1 flex justify-center w-full">
                <div className={`w-full max-w-sm h-52 p-6 rounded-3xl bg-gradient-to-br ${ownedCard.colorClass} relative flex flex-col justify-between overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300`}>
                  {/* Decorative background accent */}
                  <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/5 rounded-full translate-x-12 translate-y-12"></div>
                  
                  <div className="flex justify-between items-start z-10">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[9px] uppercase font-black tracking-widest text-white/50">SBI Card</span>
                      <h3 className="text-md font-extrabold text-white tracking-wide">{ownedCard.cardType}</h3>
                    </div>
                    
                    {/* Chip */}
                    <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-400 via-yellow-250 to-amber-500 p-1 flex flex-col justify-between border border-amber-300 shadow-sm opacity-90">
                      <div className="grid grid-cols-3 gap-0.5 h-full opacity-60">
                        <div className="border border-slate-900/10"></div>
                        <div className="border border-slate-900/10"></div>
                        <div className="border border-slate-900/10"></div>
                        <div className="border border-slate-900/10"></div>
                        <div className="border border-slate-900/10"></div>
                        <div className="border border-slate-900/10"></div>
                      </div>
                    </div>
                  </div>

                  <div className="z-10 flex flex-col gap-2 text-left">
                    <div className="font-mono text-white/95 text-xs tracking-widest">
                      •••• •••• •••• 8824
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-white/50 uppercase font-bold tracking-wider">Card Holder</span>
                        <span className="text-white text-xs font-bold block">{profile?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-6 w-6 rounded-full bg-red-500/80 -mr-2"></div>
                        <div className="h-6 w-6 rounded-full bg-amber-500/80"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
                {/* Credit Limit */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Credit Limit</span>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">₹{creditLimit.toLocaleString()}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">Allocated via Income Bracket</span>
                  </div>
                </div>

                {/* Available Credit */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Available Limit</span>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-lg font-black text-primary dark:text-blue-400">
                      ₹{(creditLimit - outstanding).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                      {Math.round(((creditLimit - outstanding) / creditLimit) * 100)}% available
                    </span>
                  </div>
                </div>

                {/* Outstanding Balance */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Outstanding Balance</span>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">₹{outstanding.toLocaleString()}</span>
                    <span className={`text-[9px] block font-semibold ${outstanding > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {outstanding > 0 ? "Payment due" : "No outstandings"}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Payment Due Date</span>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{outstanding > 0 ? dueDate : "N/A"}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">Interest free period active</span>
                  </div>
                </div>

                {/* Minimum Due */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Minimum Amount Due</span>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      ₹{outstanding > 0 ? Math.round(outstanding * 0.05).toLocaleString() : "₹0"}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-semibold">5% of total outstandings</span>
                  </div>
                </div>

                {/* Reward points */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Reward Points Earned</span>
                  <div className="mt-2 space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">4,820 Points</span>
                    <span className="text-[9px] text-primary dark:text-blue-400 block font-semibold cursor-pointer hover:underline">
                      Redeem points now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── SECTION 1: CREDIT CARDS SHOWCASE ────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Explore Cards & Benefits
            </h2>
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {["All", "Premium", "Shopping", "Travel", "Wellness"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-800 dark:hover:bg-slate-850"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCards.map((card) => {
              const isOwned = profile?.has_credit_card && profile?.existing_credit_card === card.id
              return (
                <div
                  key={card.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group hover:-translate-y-1 duration-200"
                >
                  {/* Visual Credit Card Graphics */}
                  <div className={`h-48 p-6 bg-gradient-to-br ${card.colorClass} relative flex flex-col justify-between overflow-hidden shadow-inner`}>
                    {/* Decorative card background circle */}
                    <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/5 rounded-full translate-x-12 translate-y-12"></div>
                    
                    {isOwned && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full shadow-md z-20 flex items-center gap-1 border border-emerald-400 animate-pulse">
                        <Check className="h-3 w-3" /> Active Card
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 text-left font-sans">
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/50">SBI Card</span>
                        <h3 className="text-md font-extrabold text-white tracking-wide">{card.cardType}</h3>
                      </div>
                      
                      {/* Metal Chip graphic */}
                      <div className="h-8 w-11 rounded-md bg-gradient-to-br from-amber-400 via-yellow-250 to-amber-500 p-1 flex flex-col justify-between border border-amber-300 shadow-sm opacity-90">
                        <div className="grid grid-cols-3 gap-0.5 h-full opacity-60">
                          <div className="border border-slate-900/10"></div>
                          <div className="border border-slate-900/10"></div>
                          <div className="border border-slate-900/10"></div>
                          <div className="border border-slate-900/10"></div>
                          <div className="border border-slate-900/10"></div>
                          <div className="border border-slate-900/10"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="font-mono text-white/80 text-[11px] tracking-widest">
                        •••• •••• •••• 2026
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-6 w-6 rounded-full bg-red-500/80 -mr-2"></div>
                        <div className="h-6 w-6 rounded-full bg-amber-500/80"></div>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6 text-left">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">{card.name}</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded capitalize">
                          {card.category}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1 text-slate-500 dark:text-slate-400">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Annual Fee:</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-350">{card.fee}</span>
                      </div>

                      <div className="space-y-2.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Top Perks & Rewards:</span>
                        <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                          <div className="flex gap-2 items-start">
                            <TrendingUp className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                            <span>{card.rewards}</span>
                          </div>
                          <div className="flex gap-2 items-start">
                            <Gift className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{card.perks}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenApply(card)}
                      disabled={isOwned}
                      className={`w-full rounded-xl py-2.5 text-center text-xs font-extrabold shadow-xs cursor-pointer transition-colors ${
                        isOwned 
                          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700" 
                          : "bg-primary text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                      }`}
                    >
                      {isOwned ? "Already Owned" : "Apply Now"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ────────────────── SECTION 2: COMPARE CARDS SIDE-BY-SIDE ────────────────── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-4">
            <ArrowRightLeft className="h-5 w-5 text-indigo-500" />
            Compare Credit Cards
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Select Card 1</label>
              <select
                value={compareCard1}
                onChange={(e) => setCompareCard1(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {CREDIT_CARDS_DATA.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Select Card 2</label>
              <select
                value={compareCard2}
                onChange={(e) => setCompareCard2(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {CREDIT_CARDS_DATA.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-slate-800">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-150 dark:border-slate-800">
                  <th className="px-4 py-3 w-1/4">Key Parameters</th>
                  <th className="px-4 py-3 w-3/8 text-primary dark:text-blue-400 font-black">{card1.name}</th>
                  <th className="px-4 py-3 w-3/8 text-indigo-600 dark:text-indigo-400 font-black">{card2.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Category</td>
                  <td className="px-4 py-3">{card1.category}</td>
                  <td className="px-4 py-3">{card2.category}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Annual Fee</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{card1.fee}</td>
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{card2.fee}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Reward Rates</td>
                  <td className="px-4 py-3 leading-relaxed">{card1.rewards}</td>
                  <td className="px-4 py-3 leading-relaxed">{card2.rewards}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Welcome Perks</td>
                  <td className="px-4 py-3 leading-relaxed">{card1.perks}</td>
                  <td className="px-4 py-3 leading-relaxed">{card2.perks}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Detailed Features</td>
                  <td className="px-4 py-3">
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-405 font-medium">
                      {card1.features.slice(0, 3).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-405 font-medium">
                      {card2.features.slice(0, 3).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
                <tr className="bg-slate-50/20">
                  <td className="px-4 py-4"></td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleOpenApply(card1)}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                    >
                      Apply for {card1.cardType}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleOpenApply(card2)}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-750 cursor-pointer"
                    >
                      Apply for {card2.cardType}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ────────────────── SECTION 3: CARD RECOMMENDATION QUIZ ────────────────── */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-4">
            <Compass className="h-5 w-5 text-emerald-500" />
            Credit Card Recommender
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleRecommend} className="space-y-5">
              <p className="text-xs text-slate-500">
                Answer two simple questions about your financial profile and we will instantly recommend the most optimal credit card match for your wallet.
              </p>

              {/* Question 1 */}
              <div className="space-y-2 text-xs">
                <label className="text-slate-550 font-bold">1. What is your estimated Monthly Income range?</label>
                <div className="grid grid-cols-2 gap-3 font-semibold">
                  {[
                    { label: "Under ₹25,000", value: "under_25k" },
                    { label: "₹25,000 - ₹50,000", value: "25k_50k" },
                    { label: "₹50,000 - ₹1,00,000", value: "50k_1l" },
                    { label: "Above ₹1,00,000", value: "above_1l" }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIncomeRange(opt.value)}
                      className={`text-left rounded-lg p-2.5 border text-xs cursor-pointer ${
                        incomeRange === opt.value
                          ? "border-primary bg-blue-50/40 text-primary dark:border-blue-500 dark:bg-blue-950/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-2 text-xs">
                <label className="text-slate-550 font-bold">2. Where do you spend the majority of your budget?</label>
                <div className="grid grid-cols-2 gap-3 font-semibold">
                  {[
                    { label: "Online Shopping & Orders", value: "shopping" },
                    { label: "Dining, Movies & Groceries", value: "dining" },
                    { label: "Flights, Travel & Fuel", value: "travel" },
                    { label: "Health, Gyms & Chemists", value: "wellness" }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPrimarySpend(opt.value)}
                      className={`text-left rounded-lg p-2.5 border text-xs cursor-pointer ${
                        primarySpend === opt.value
                          ? "border-primary bg-blue-50/40 text-primary dark:border-blue-500 dark:bg-blue-950/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
              >
                Find My Ideal Card
              </button>
            </form>

            {/* Recommendation Result Card */}
            <div className="flex items-center justify-center h-full">
              {recommendedCard ? (
                <div className="w-full bg-slate-50 dark:bg-slate-950/45 p-6 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-5 animate-fadeIn">
                  <div className="text-center space-y-1.5">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Perfect Match For You
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{recommendedCard.name}</h3>
                  </div>

                  {/* Simulated Card Graphic */}
                  <div className={`h-36 max-w-sm mx-auto rounded-2xl p-4 bg-gradient-to-br ${recommendedCard.colorClass} relative flex flex-col justify-between text-left text-xs shadow-md`}>
                    <span className="text-white/60 font-black uppercase tracking-wider text-[9px]">SBI Card</span>
                    <span className="text-white/90 font-bold tracking-wide text-sm">{recommendedCard.cardType}</span>
                    <span className="font-mono text-white/50 text-[10px]">•••• •••• •••• 2026</span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    <div className="flex gap-2">
                      <Award className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                      <span>{recommendedCard.rewards}</span>
                    </div>
                    <div className="flex gap-2">
                      <Gift className="h-4.5 w-4.5 text-primary shrink-0" />
                      <span>{recommendedCard.perks}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenApply(recommendedCard)}
                    className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 cursor-pointer"
                  >
                    Apply Now for {recommendedCard.cardType}
                  </button>
                </div>
              ) : (
                <div className="w-full h-full min-h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <HelpCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
                  <span className="text-xs font-bold text-slate-400">Complete the questionnaire to get custom recommendations.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      <Footer />

      {/* ────────────────── CREDIT CARD APPLICATION MODAL ────────────────── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-md w-full text-left flex flex-col space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="text-md font-extrabold text-slate-900 dark:text-white">Apply for {selectedCardForApply.name}</h3>
                <span className="text-[10px] text-slate-400">Step {applyStep} of 4</span>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-450 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* STEP 1: Personal Details */}
            {applyStep === 1 && (
              <form onSubmit={handleStep1Next} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Applicant Full Name (As in Aadhaar/PAN)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={applyName}
                      onChange={(e) => setApplyName(e.target.value)}
                      className="w-full border border-slate-205 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl pl-10 pr-4 py-2.5 font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Mobile Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={applyPhone}
                      onChange={(e) => setApplyPhone(e.target.value.replace(/\D/g, ""))}
                      className="w-full border border-slate-205 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl pl-10 pr-4 py-2.5 font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Current Residence City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter city"
                      value={applyCity}
                      onChange={(e) => setApplyCity(e.target.value)}
                      className="w-full border border-slate-205 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl pl-10 pr-4 py-2.5 font-semibold text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer flex justify-center items-center gap-1.5"
                >
                  Continue Application <ChevronRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* STEP 2: Employment & Income */}
            {applyStep === 2 && (
              <form onSubmit={handleStep2Next} className="space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Employment Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setApplyJobType("salaried")}
                      className={`py-2 text-center rounded-lg border text-xs cursor-pointer ${
                        applyJobType === "salaried"
                          ? "border-primary bg-blue-50/40 text-primary font-bold dark:border-blue-500 dark:bg-blue-950/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      Salaried
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyJobType("self_employed")}
                      className={`py-2 text-center rounded-lg border text-xs cursor-pointer ${
                        applyJobType === "self_employed"
                          ? "border-primary bg-blue-50/40 text-primary font-bold dark:border-blue-500 dark:bg-blue-950/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      Self Employed
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Company / Employer Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Employer/Business name"
                      value={applyEmployer}
                      onChange={(e) => setApplyEmployer(e.target.value)}
                      className="w-full border border-slate-205 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl pl-10 pr-4 py-2.5 font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Gross Annual Income (₹)</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter annual income (e.g. 600000)"
                    value={applyIncome}
                    onChange={(e) => setApplyIncome(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-slate-205 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl px-4 py-2.5 font-semibold text-xs"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApplyStep(1)}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 cursor-pointer text-center font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-primary py-3 text-slate-50 shadow-xs hover:bg-blue-700 dark:bg-blue-600 cursor-pointer text-center font-bold"
                  >
                    Verify KYC
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: OTP Verification */}
            {applyStep === 3 && (
              <form onSubmit={handleVerifyApplication} className="space-y-4 text-xs font-semibold">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-105 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white">Verify SMS OTP Code</h4>
                  <p className="text-[11px] text-slate-550 leading-relaxed">
                    We sent a simulated 6-digit confirmation code to your phone number ending in <span className="font-extrabold text-slate-800 dark:text-slate-200">{applyPhone.slice(-4) || "8824"}</span>.
                  </p>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP code"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white p-2.5 rounded-lg text-center font-mono tracking-widest text-lg font-black"
                  />
                  {otpError && <div className="text-red-600 font-bold text-[10px] text-center">{otpError}</div>}
                  <span className="text-[9px] text-slate-400 font-mono block text-center mt-1">HINT: Enter '123456' for verification</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-100 dark:border-slate-850 pt-3">
                  <span>Resend timer: {otpTimer > 0 ? `${otpTimer}s` : "Available"}</span>
                  <button
                    type="button"
                    disabled={otpTimer > 0}
                    onClick={handleResendOtp}
                    className="text-primary hover:underline disabled:opacity-50 disabled:no-underline font-bold"
                  >
                    Resend Code
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyStep(2)}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-slate-705 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 cursor-pointer text-center font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-600 py-3 text-slate-50 shadow-xs hover:bg-emerald-700 cursor-pointer text-center font-bold"
                  >
                    Confirm Apply
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Application Success */}
            {applyStep === 4 && (
              <div className="text-center space-y-4 py-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle2 className="h-10 w-10 animate-bounce" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Application Received!</h4>
                  <p className="text-xs text-slate-505">
                    Your credit card application for **{selectedCardForApply.name}** has been registered successfully.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-150 dark:border-slate-850 p-3.5 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wide mb-0.5">Tracking Reference</span>
                  <span className="font-black text-slate-900 dark:text-white text-xs">{applicationId}</span>
                </div>

                <p className="text-[10px] text-slate-450 leading-relaxed max-w-xs mx-auto">
                  Our credit division will verify your employment credentials and reach out to you within 24-48 business hours to complete digital biometrics.
                </p>

                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 cursor-pointer"
                >
                  Close Portal
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ────────────────── BILL PAYMENT MODAL ────────────────── */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-md w-full text-left flex flex-col space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <div>
                <h3 className="text-md font-extrabold text-slate-900 dark:text-white">Pay Outstanding Bill</h3>
                <span className="text-[10px] text-slate-400">Card payment portal</span>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-450 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayBill} className="space-y-4 text-xs font-semibold">
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Outstanding Bill</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">₹{outstanding.toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPayAmount(outstanding.toString())}
                  className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                >
                  Pay Full Amount
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Payment Amount (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount to pay"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-905 dark:text-white rounded-xl px-4 py-2.5 font-semibold text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-slate-705 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 cursor-pointer text-center font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-white shadow-sm hover:bg-emerald-700 cursor-pointer text-center font-bold"
                >
                  Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────── TOAST NOTIFICATION ────────────────── */}
      {showToast && (
        <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-2 rounded-xl text-white px-4 py-3 shadow-lg text-xs font-bold animate-fadeIn ${
          toastType === "success" ? "bg-emerald-600" : toastType === "error" ? "bg-rose-600" : "bg-slate-900"
        }`}>
          <Check className="h-4.5 w-4.5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  )
}
