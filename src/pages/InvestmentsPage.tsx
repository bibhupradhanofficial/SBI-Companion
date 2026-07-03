/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  investmentsService,
  profilesService,
  type UserInvestment,
} from "@/lib/supabase-service"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useNavigate } from "react-router-dom"
import {
  TrendingUp,
  Search,
  Star,
  Calculator,
  Heart,
  ChevronRight,
  Info,
  Briefcase,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react"

// Recharts components
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts"

// UserInvestment type is imported from supabase-service

interface FundProduct {
  id: string
  name: string
  category: "Equity" | "Debt" | "Hybrid" | "ELSS" | "Index" | "Gold"
  risk: "Low" | "Moderate" | "High"
  rating: number
  return1Y: number
  return3Y: number
  return5Y: number
  aum: string
  minSip: number
  nav: number
  manager: string
  inception: string
  expenseRatio: string
  description: string
}

// 12 Hardcoded Realistic SBI Mutual Fund products
const SBI_FUNDS: FundProduct[] = [
  {
    id: "fund_1",
    name: "SBI Bluechip Fund",
    category: "Equity",
    risk: "High",
    rating: 4,
    return1Y: 16.2,
    return3Y: 14.8,
    return5Y: 15.4,
    aum: "₹45,280 Cr",
    minSip: 500,
    nav: 82.45,
    manager: "Sohini Andani",
    inception: "Jan 2006",
    expenseRatio: "0.85%",
    description: "Invests predominantly in large-cap companies. Focuses on blue-chip market leaders with stable growth prospects, robust balance sheets, and strong management structures.",
  },
  {
    id: "fund_2",
    name: "SBI Small Cap Fund",
    category: "Equity",
    risk: "High",
    rating: 5,
    return1Y: 26.4,
    return3Y: 21.2,
    return5Y: 22.1,
    aum: "₹28,450 Cr",
    minSip: 500,
    nav: 148.90,
    manager: "R. Srinivasan",
    inception: "Sep 2009",
    expenseRatio: "0.95%",
    description: "Generates long-term capital growth by investing predominantly in small-cap companies. High return potential coupled with high short-term volatility.",
  },
  {
    id: "fund_3",
    name: "SBI Equity Hybrid Fund",
    category: "Hybrid",
    risk: "Moderate",
    rating: 4,
    return1Y: 12.8,
    return3Y: 11.5,
    return5Y: 13.8,
    aum: "₹62,100 Cr",
    minSip: 1000,
    nav: 242.10,
    manager: "Dinesh Balachandran",
    inception: "Dec 1995",
    expenseRatio: "0.78%",
    description: "Maintains a balanced allocation. Typically invests 65-80% in equities for capital growth and 20-35% in fixed-income debt securities for stability.",
  },
  {
    id: "fund_4",
    name: "SBI Magnum Constant Maturity Fund",
    category: "Debt",
    risk: "Low",
    rating: 4,
    return1Y: 8.5,
    return3Y: 7.2,
    return5Y: 7.9,
    aum: "₹12,400 Cr",
    minSip: 5000,
    nav: 62.15,
    manager: "Rajeev Radhakrishnan",
    inception: "Jan 2003",
    expenseRatio: "0.45%",
    description: "Invests in government securities (G-Secs) such that the portfolio's constant maturity is around 10 years. Low credit risk, sensitive to interest rates.",
  },
  {
    id: "fund_5",
    name: "SBI Long Term Equity Fund",
    category: "ELSS",
    risk: "High",
    rating: 4,
    return1Y: 18.5,
    return3Y: 15.6,
    return5Y: 16.1,
    aum: "₹18,900 Cr",
    minSip: 500,
    nav: 360.25,
    manager: "Dinesh Balachandran",
    inception: "Mar 1993",
    expenseRatio: "0.90%",
    description: "An equity-linked savings scheme (ELSS) providing tax deduction benefits under Section 80C. Mandatory lock-in period of 3 years from date of investment.",
  },
  {
    id: "fund_6",
    name: "SBI Nifty 50 Index Fund",
    category: "Index",
    risk: "High",
    rating: 5,
    return1Y: 15.1,
    return3Y: 13.9,
    return5Y: 14.5,
    aum: "₹8,450 Cr",
    minSip: 500,
    nav: 42.18,
    manager: "Raviprakash Sharma",
    inception: "Jul 2002",
    expenseRatio: "0.20%",
    description: "Passively managed fund that replicates the Nifty 50 Index performance. Minimizes expense ratios while tracking Indian large-cap market indices directly.",
  },
  {
    id: "fund_7",
    name: "SBI Gold Fund",
    category: "Gold",
    risk: "Moderate",
    rating: 3,
    return1Y: 14.2,
    return3Y: 10.8,
    return5Y: 12.1,
    aum: "₹6,150 Cr",
    minSip: 1000,
    nav: 24.50,
    manager: "Raviprakash Sharma",
    inception: "Sep 2011",
    expenseRatio: "0.55%",
    description: "Invests in units of SBI Gold ETF. Offers a convenient way to invest in physical gold commodity paper with no security storage worries.",
  },
  {
    id: "fund_8",
    name: "SBI Contra Fund",
    category: "Equity",
    risk: "High",
    rating: 5,
    return1Y: 22.8,
    return3Y: 19.4,
    return5Y: 18.9,
    aum: "₹24,150 Cr",
    minSip: 500,
    nav: 312.45,
    manager: "Dinesh Balachandran",
    inception: "Jul 1999",
    expenseRatio: "0.82%",
    description: "Follows a contrarian investment strategy, buying fundamentally sound assets that are temporarily out of favor or underperforming in current market cycles.",
  },
  {
    id: "fund_9",
    name: "SBI Liquid Fund",
    category: "Debt",
    risk: "Low",
    rating: 4,
    return1Y: 6.9,
    return3Y: 5.8,
    return5Y: 5.5,
    aum: "₹54,200 Cr",
    minSip: 5000,
    nav: 3450.80,
    manager: "Sunila D'Souza",
    inception: "Apr 2004",
    expenseRatio: "0.25%",
    description: "Invests in high-quality money market and debt instruments with maturity up to 91 days. Ideal for parking short-term cash surpluses with high liquidity.",
  },
  {
    id: "fund_10",
    name: "SBI Multi Asset Allocation Fund",
    category: "Hybrid",
    risk: "Moderate",
    rating: 4,
    return1Y: 14.5,
    return3Y: 12.2,
    return5Y: 13.1,
    aum: "₹14,500 Cr",
    minSip: 1000,
    nav: 54.12,
    manager: "Mans Dutt",
    inception: "Dec 2005",
    expenseRatio: "0.75%",
    description: "Diversifies capital across three asset classes: Equity (35-80%), Debt (10-35%), and Gold/Commodities (10-35%). Minimizes downside correlations.",
  },
  {
    id: "fund_11",
    name: "SBI Nifty Next 50 Index Fund",
    category: "Index",
    risk: "High",
    rating: 3,
    return1Y: 18.9,
    return3Y: 14.2,
    return5Y: 14.8,
    aum: "₹2,850 Cr",
    minSip: 500,
    nav: 18.90,
    manager: "Raviprakash Sharma",
    inception: "Mar 2021",
    expenseRatio: "0.30%",
    description: "Tracks the Nifty Next 50 Index, representing potential large-cap companies. Offers exposure to mid-to-large-cap corporations in India.",
  },
  {
    id: "fund_12",
    name: "SBI Conservative Hybrid Fund",
    category: "Hybrid",
    risk: "Low",
    rating: 4,
    return1Y: 9.8,
    return3Y: 8.9,
    return5Y: 9.2,
    aum: "₹9,800 Cr",
    minSip: 1000,
    nav: 68.45,
    manager: "Rajeev Radhakrishnan",
    inception: "Apr 2001",
    expenseRatio: "0.65%",
    description: "Invests 75-90% in debt securities and money market papers, and 10-25% in equities. Offers low risk and consistent monthly returns.",
  },
]

export const InvestmentsPage: React.FC = () => {
  const { user, profile, addActivity } = useAuth()
  const navigate = useNavigate()

  // State Management
  const [activeTab, setActiveTab] = useState<"portfolio" | "explore" | "planner" | "fd">("portfolio")
  const [investments, setInvestments] = useState<UserInvestment[]>([])

  // Tab 2: Explorer State
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [riskFilter, setRiskFilter] = useState("All") // All, Low, Moderate, High
  const [sortOrder, setSortOrder] = useState("return3Y") // return1Y, return3Y, aum, rating
  const [searchQuery, setSearchQuery] = useState("")
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [selectedFund, setSelectedFund] = useState<FundProduct | null>(null)

  // Fund Purchase Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [purchaseFund, setPurchaseFund] = useState<FundProduct | null>(null)
  const [purchaseMode, setPurchaseMode] = useState<"sip" | "lump">("sip")
  const [purchaseAmount, setPurchaseAmount] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("10")
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false)

  // Tab 3: SIP Planner State
  const [sipMonthly, setSipMonthly] = useState(5000)
  const [sipRate, setSipRate] = useState(12)
  const [sipYears, setSipYears] = useState(10)

  const [goalTarget, setGoalTarget] = useState("")
  const [goalYears, setGoalYears] = useState(10)
  const [goalRate, setGoalRate] = useState(12)

  // Tab 4: FD State
  const [fdPrincipal, setFdPrincipal] = useState(100000)
  const [fdTenureMonths, setFdTenureMonths] = useState(24)
  const [fdPayout, setFdPayout] = useState<"cumulative" | "monthly" | "quarterly">("cumulative")
  const [fdSenior, setFdSenior] = useState(false)
  const [fdRate, setFdRate] = useState(7.0)
  const [isOpeningFd, setIsOpeningFd] = useState(false)

  // Watchlist stored in Supabase profiles.existing_investments as watchlist array
  useEffect(() => {
    if (user?.id && profile?.existing_investments) {
      const inv = profile.existing_investments as any
      if (Array.isArray(inv?.watchlist)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWatchlist(inv.watchlist)
      }
    }
  }, [user, profile])

  // --- Supabase Data Loading ---

  const loadInvestments = async (userId: string) => {
    try {
      const data = await investmentsService.list(userId)
      setInvestments(data)
    } catch (err) {
      console.error("Failed to load investments:", err)
      setInvestments([])
    }
  }

  // Load investments on mount
  useEffect(() => {
    if (user?.id) {
      loadInvestments(user.id)
    }
  }, [user])

  const investInFund = async (fundName: string, type: "Equity" | "Debt" | "Hybrid" | "ELSS" | "Gold", amount: number, isSip: boolean, dateVal?: number) => {
    if (!user?.id) return

    const existing = investments.find(inv => inv.fund_name === fundName)

    if (existing) {
      const updates = {
        invested_amount: existing.invested_amount + amount,
        current_value: existing.current_value + amount,
        units: parseFloat((existing.units + (amount / existing.nav)).toFixed(3)),
        sip_amount: isSip ? amount : existing.sip_amount,
        sip_date: isSip ? (dateVal || 10) : existing.sip_date,
        status: (isSip ? "active" : existing.status) as "active" | "paused" | "stopped",
      }
      try {
        const updated = await investmentsService.update(existing.id, updates)
        setInvestments(prev => prev.map(inv => inv.id === existing.id ? updated : inv))
      } catch (err) {
        console.error("Failed to update investment:", err)
      }
    } else {
      const fundObj = SBI_FUNDS.find(f => f.name === fundName)
      const navVal = fundObj ? fundObj.nav : 100
      try {
        const newItem = await investmentsService.add({
          user_id: user.id,
          fund_name: fundName,
          fund_type: type,
          invested_amount: amount,
          current_value: amount,
          units: parseFloat((amount / navVal).toFixed(3)),
          nav: navVal,
          sip_amount: isSip ? amount : null,
          sip_date: isSip ? (dateVal || 10) : null,
          status: isSip ? "active" : "stopped",
        })
        setInvestments(prev => [...prev, newItem])
      } catch (err) {
        console.error("Failed to add investment:", err)
      }
    }

    await addActivity("investment", `${isSip ? "Started SIP" : "Invested Lumpsum"} of ₹${amount.toLocaleString("en-IN")} in ${fundName}`, amount)
  }

  const pauseResumeSIP = async (id: string, currentStatus: "active" | "paused" | "stopped") => {
    if (!user?.id) return
    const nextStatus: "active" | "paused" = currentStatus === "active" ? "paused" : "active"
    try {
      const updated = await investmentsService.updateStatus(id, nextStatus)
      setInvestments(prev => prev.map(inv => inv.id === id ? updated : inv))
    } catch (err) {
      console.error("Failed to update SIP status:", err)
    }
    const item = investments.find(inv => inv.id === id)
    await addActivity("agent", `${nextStatus === "paused" ? "Paused" : "Resumed"} SIP for ${item?.fund_name}`)
  }

  const redeemFund = async (id: string) => {
    if (!user?.id) return
    const item = investments.find(inv => inv.id === id)
    if (!item) return

    const confirmRedeem = window.confirm(`Are you sure you want to redeem all holdings in ${item.fund_name} (Current value: ₹${item.current_value.toLocaleString("en-IN")})?`)
    if (!confirmRedeem) return

    try {
      await investmentsService.delete(id)
      setInvestments(prev => prev.filter(inv => inv.id !== id))
    } catch (err) {
      console.error("Failed to redeem fund:", err)
    }

    await addActivity("investment", `Redeemed full holdings in ${item.fund_name} (Payout: ₹${item.current_value.toLocaleString("en-IN")})`, item.current_value)
  }

  // Watchlist toggler — persisted to Supabase profiles
  const handleToggleWatchlist = (fundId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user?.id) return
    const updated = watchlist.includes(fundId)
      ? watchlist.filter(id => id !== fundId)
      : [...watchlist, fundId]
    setWatchlist(updated)
    // Persist watchlist as part of profile's existing_investments JSONB
    const currentInv = (profile?.existing_investments as any) || {}
    profilesService.update(user.id, {
      existing_investments: { ...currentInv, watchlist: updated },
    }).catch(err => console.error("Failed to save watchlist:", err))
  }

  // --- Dynamic Recommendation Banner Generator ---

  const getRecommendationsBannerText = () => {
    const hasElss = investments.some(inv => inv.fund_type === "ELSS")
    if (hasElss) {
      return {
        tag: "Tax-Saving Smart",
        text: "You are tax-saving smart! You have ELSS holdings utilizing the Section 80C limit. Park any further debt surplus in SBI sovereign gold funds.",
      }
    }

    const userAge = profile?.age || 25
    if (userAge < 30) {
      return {
        tag: "Aggressive Compounding Opportunity",
        text: "Start early! Given your age is under 30, compounding returns can multiply long-term wealth exponentially. We recommend starting an equity SIP in SBI Small Cap Fund.",
      }
    }

    return {
      tag: "Balanced Portfolio Guard",
      text: "Secure your future! Allocate surplus savings to tax-saving ELSS or conservative hybrid funds. Get up to ₹1,50,000 tax exemption under Sec 80C.",
    }
  }

  const recommendation = getRecommendationsBannerText()

  // --- Tab 1 Portfolio Logic ---

  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested_amount, 0)
  const currentValTotal = investments.reduce((sum, inv) => sum + inv.current_value, 0)
  const totalPL = currentValTotal - totalInvested
  const totalReturnPercent = totalInvested > 0 ? parseFloat(((totalPL / totalInvested) * 100).toFixed(2)) : 0
  const portfolioXirr = totalInvested > 0 ? (totalReturnPercent > 10 ? 14.2 : 11.8) : 0 // realistic mock XIRR based on P&L

  // Chart data 1: Allocation Pie
  const getAllocationData = () => {
    const map: { [key: string]: number } = { Equity: 0, Debt: 0, Hybrid: 0, ELSS: 0, Gold: 0 }
    investments.forEach(inv => {
      map[inv.fund_type] = (map[inv.fund_type] || 0) + inv.current_value
    })
    return Object.keys(map)
      .map(key => ({ name: key, value: map[key] }))
      .filter(item => item.value > 0)
  }

  const allocationData = getAllocationData()
  const TYPE_COLORS: { [key: string]: string } = {
    Equity: "#00549c",
    Hybrid: "#3b82f6",
    Debt: "#f4a900",
    ELSS: "#10b981",
    Gold: "#f59e0b",
  }

  // Chart data 2: 12-month returns trend line
  const returnsTrendData = [
    { month: "Jul 25", value: totalInvested * 0.92 },
    { month: "Aug 25", value: totalInvested * 0.94 },
    { month: "Sep 25", value: totalInvested * 0.96 },
    { month: "Oct 25", value: totalInvested * 0.97 },
    { month: "Nov 25", value: totalInvested * 1.01 },
    { month: "Dec 25", value: totalInvested * 1.02 },
    { month: "Jan 26", value: totalInvested * 1.04 },
    { month: "Feb 26", value: totalInvested * 1.06 },
    { month: "Mar 26", value: totalInvested * 1.08 },
    { month: "Apr 26", value: totalInvested * 1.10 },
    { month: "May 26", value: totalInvested * 1.12 },
    { month: "Jun 26", value: currentValTotal },
  ]

  // --- Tab 2 Explore Funds Filtering & Sorting ---

  const sortedFunds = [...SBI_FUNDS]
    .filter(fund => {
      const categoryMatch = categoryFilter === "All" || fund.category === categoryFilter
      const riskMatch = riskFilter === "All" || fund.risk === riskFilter
      const searchMatch = fund.name.toLowerCase().includes(searchQuery.toLowerCase()) || fund.description.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatch && riskMatch && searchMatch
    })
    .sort((a, b) => {
      if (sortOrder === "return1Y") return b.return1Y - a.return1Y
      if (sortOrder === "return3Y") return b.return3Y - a.return3Y
      if (sortOrder === "rating") return b.rating - a.rating
      if (sortOrder === "aum") {
        const getAumNum = (str: string) => parseFloat(str.replace(/[^0-9.]/g, ""))
        return getAumNum(b.aum) - getAumNum(a.aum)
      }
      return 0
    })

  // Mock NAV history sparkline data generator for Detail Sheet
  const getNavSparklineData = (fundNav: number) => {
    return [
      { day: 1, nav: fundNav * 0.94 },
      { day: 2, nav: fundNav * 0.95 },
      { day: 3, nav: fundNav * 0.97 },
      { day: 4, nav: fundNav * 0.96 },
      { day: 5, nav: fundNav * 0.98 },
      { day: 6, nav: fundNav * 0.99 },
      { day: 7, nav: fundNav * 1.01 },
      { day: 8, nav: fundNav * 1.00 },
      { day: 9, nav: fundNav * 1.02 },
      { day: 10, nav: fundNav },
    ]
  }

  // --- Purchase Modals Forms ---

  const handleOpenPurchase = (fund: FundProduct, mode: "sip" | "lump") => {
    setPurchaseFund(fund)
    setPurchaseMode(mode)
    setPurchaseAmount(fund.minSip.toString())
    setPurchaseDate("10")
    setIsSubmittingPurchase(false)
    setShowPurchaseModal(true)
  }

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!purchaseFund) return
    const amt = parseFloat(purchaseAmount)
    if (isNaN(amt) || amt < purchaseFund.minSip) {
      alert(`Minimum investment amount for this fund is ₹${purchaseFund.minSip}.`)
      return
    }

    setIsSubmittingPurchase(true)
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Add to DB / LocalStorage
    await investInFund(
      purchaseFund.name,
      purchaseFund.category === "Index" || purchaseFund.category === "ELSS" ? "Equity" as any : purchaseFund.category as any,
      amt,
      purchaseMode === "sip",
      purchaseMode === "sip" ? parseInt(purchaseDate) : undefined
    )

    setIsSubmittingPurchase(false)
    setShowPurchaseModal(false)
    setSelectedFund(null) // close detail sheet too
    alert(`Investment in ${purchaseFund.name} initiated successfully!`)
  }

  // --- Tab 3 Calculator Logic ---

  // SIP Calculator Growth
  const calculateSipGrowth = () => {
    const P = sipMonthly
    const i = (sipRate / 100) / 12
    const n = sipYears * 12

    // SIP Future Value formula: M = P * [ ( (1+i)^n - 1 ) / i ] * (1+i)
    const totalValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)
    const investedAmount = P * n
    const estReturns = totalValue - investedAmount

    // Year-wise growth data for AreaChart
    const growthData = []
    for (let yr = 1; yr <= sipYears; yr++) {
      const months = yr * 12
      const val = P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i)
      growthData.push({
        year: `Yr ${yr}`,
        Invested: P * months,
        Value: Math.round(val),
      })
    }

    return {
      investedAmount,
      estReturns: Math.round(estReturns),
      totalValue: Math.round(totalValue),
      growthData,
    }
  }

  const sipOutput = calculateSipGrowth()

  // Goal Calculator: Required Monthly SIP
  const getRequiredSip = () => {
    const target = parseFloat(goalTarget)
    if (isNaN(target) || target <= 0) return 0
    const i = (goalRate / 100) / 12
    const n = goalYears * 12
    // Required Monthly SIP formula: P = Target / [ ( ( (1+i)^n - 1 ) / i ) * (1+i) ]
    const P = target / (((Math.pow(1 + i, n) - 1) / i) * (1 + i))
    return Math.round(P)
  }

  const requiredSip = getRequiredSip()

  // --- Tab 4 FD Calculator Logic ---

  // Auto rate pre-fill based on tenure months
  useEffect(() => {
    const months = fdTenureMonths
    const rate = months <= 1.5 ? 3.5
      : months <= 6 ? 5.5
        : months <= 12 ? 6.8
          : months <= 36 ? 7.0
            : 6.5

    const finalRate = fdSenior ? rate + 0.5 : rate
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFdRate(finalRate)
  }, [fdTenureMonths, fdSenior])

  const calculateFdMaturity = () => {
    const P = fdPrincipal
    const r = fdRate / 100
    const t = fdTenureMonths / 12

    const maturity = fdPayout === "cumulative"
      ? P * Math.pow(1 + r / 4, 4 * t)
      : fdPayout === "monthly"
        ? P * Math.pow(1 + r / 12, 12 * t)
        : P * Math.pow(1 + r / 4, 4 * t)

    const interest = maturity - P
    const yieldValue = ((interest / P) / t) * 100

    return {
      maturityAmount: Math.round(maturity),
      interestEarned: Math.round(interest),
      effectiveYield: parseFloat(yieldValue.toFixed(2)),
    }
  }

  const fdOutput = calculateFdMaturity()

  const handleOpenFd = async () => {
    setIsOpeningFd(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsOpeningFd(false)
    alert(`Term Deposit Account opened successfully for ₹${fdPrincipal.toLocaleString("en-IN")} at ${fdRate}% interest. Certificate ref: FD-${Math.floor(100000 + Math.random() * 900000)}`)

    // Log Activity
    await addActivity("investment", `Opened SBI Term Deposit (FD) of ₹${fdPrincipal.toLocaleString("en-IN")} at ${fdRate}% p.a.`, fdPrincipal)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 text-left">

        {/* Recommendation Banner */}
        <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-amber-500/5 p-5 shadow-sm dark:border-blue-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-primary dark:text-blue-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-500" />
              Companion's Wealth Nudge
            </span>
            <span className="text-xs font-black text-slate-900 dark:text-white block">
              {recommendation.tag}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
              {recommendation.text}
            </p>
          </div>
          <button
            onClick={() => navigate("/agent")}
            className="rounded-xl border border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 dark:text-blue-400 dark:border-blue-800/60 flex items-center gap-1 transition-all shrink-0"
          >
            Ask Companion about my investments
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-xs uppercase font-extrabold tracking-wider mb-8 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${activeTab === "portfolio"
                ? "border-primary text-primary dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <Briefcase className="h-4 w-4" />
            Portfolio
          </button>

          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${activeTab === "explore"
                ? "border-primary text-primary dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <Search className="h-4 w-4" />
            Explore Funds
          </button>

          <button
            onClick={() => setActiveTab("planner")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${activeTab === "planner"
                ? "border-primary text-primary dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <TrendingUp className="h-4 w-4" />
            SIP Planner
          </button>

          <button
            onClick={() => setActiveTab("fd")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${activeTab === "fd"
                ? "border-primary text-primary dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <Calculator className="h-4 w-4" />
            FD Calculator
          </button>
        </div>

        {/* TAB 1: PORTFOLIO */}
        {activeTab === "portfolio" && (
          <div className="space-y-8">
            {investments.length === 0 ? (
              // Empty State
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5 flex flex-col items-center">
                {/* SVG Illustration - growing plant */}
                <svg className="w-24 h-24 text-primary dark:text-blue-500 animate-[bounce_3s_infinite]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="85" r="10" fill="#f4a900" opacity="0.3" />
                  <path d="M50 85V45" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 65C45 60 30 60 30 50C30 40 45 42 50 50" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M50 55C55 50 70 50 70 40C70 30 55 32 50 40" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="35" r="8" fill="#f4a900" />
                  <path d="M50 31V39M46 35H54" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Start Your Investment Journey</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                    You haven't started investing yet. Let Companion help you begin by discovering high-performing funds or designing your SIP goals.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("explore")}
                  className="rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-primary/15 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Start Your First SIP
                </button>
              </div>
            ) : (
              // Portfolio Display
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Invested</span>
                    <span className="text-xl font-black text-slate-950 dark:text-white mt-1 block">
                      ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Current Value</span>
                    <span className="text-xl font-black text-slate-950 dark:text-white mt-1 block">
                      ₹{currentValTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Returns</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-xl font-black ${totalPL >= 0 ? "text-green-600 dark:text-green-450" : "text-rose-600"}`}>
                        ₹{totalPL.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${totalPL >= 0 ? "bg-green-100 text-green-700 dark:bg-green-950/40" : "bg-rose-100 text-rose-700"
                        }`}>
                        {totalPL >= 0 ? "+" : ""}{totalReturnPercent}%
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Portfolio XIRR</span>
                    <span className="text-xl font-black text-green-600 dark:text-green-450 mt-1 block">
                      {portfolioXirr}% p.a.
                    </span>
                  </div>
                </div>

                {/* Portfolio Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Allocation Donut */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 self-start">Asset Allocation</h5>
                    <div className="h-56 w-full flex flex-col justify-center items-center relative">
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || "#00549c"} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`} />
                        </PieChart>
                      </ResponsiveContainer>

                      {/* Donut Legend */}
                      <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold mt-2">
                        {allocationData.map((item, idx) => (
                          <span key={idx} className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[item.name] }}></span>
                            {item.name} ({((item.value / currentValTotal) * 100).toFixed(0)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Growth Line Chart */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Returns Trajectory (12 Months)</h5>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={returnsTrendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis hide domain={["auto", "auto"]} />
                          <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`} />
                          <Line type="monotone" dataKey="value" stroke="#00549c" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Holdings Table */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                  <div className="p-4 border-b border-slate-150 dark:border-slate-850">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-450">Current Holdings Portfolio</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="px-6 py-4">Fund Name</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4 text-right">Invested</th>
                          <th className="px-6 py-4 text-right">Current Value</th>
                          <th className="px-6 py-4 text-right">Total P&L</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                        {investments.map((inv) => {
                          const plValue = inv.current_value - inv.invested_amount
                          const plPercent = parseFloat(((plValue / inv.invested_amount) * 100).toFixed(2))
                          const isProfit = plValue >= 0

                          return (
                            <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-950 dark:text-white">
                                {inv.fund_name}
                                {inv.sip_amount && (
                                  <span className="block text-[9px] text-slate-400 font-normal mt-0.5">
                                    SIP: ₹{inv.sip_amount.toLocaleString("en-IN")}/month (Day {inv.sip_date})
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 font-semibold text-slate-500">
                                {inv.fund_type}
                              </td>

                              <td className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                ₹{inv.invested_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>

                              <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                                ₹{inv.current_value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>

                              <td className="px-6 py-4 text-right">
                                <span className={`block font-bold ${isProfit ? "text-green-600 dark:text-green-450" : "text-rose-600"}`}>
                                  ₹{isProfit ? "+" : ""}{plValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                                <span className={`text-[9px] font-bold ${isProfit ? "text-green-500" : "text-rose-500"}`}>
                                  {isProfit ? "+" : ""}{plPercent}%
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${inv.status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                  }`}>
                                  {inv.status}
                                </span>
                              </td>

                              <td className="px-6 py-4 flex gap-2">
                                <button
                                  onClick={() => {
                                    const match = SBI_FUNDS.find(f => f.name === inv.fund_name)
                                    if (match) handleOpenPurchase(match, "lump")
                                  }}
                                  className="rounded bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary hover:bg-primary/20 dark:bg-blue-950/30 dark:text-blue-400"
                                >
                                  Invest More
                                </button>

                                {inv.sip_amount && (
                                  <button
                                    onClick={() => pauseResumeSIP(inv.id, inv.status)}
                                    className="rounded border border-slate-200 px-2 py-1 text-[9px] font-bold hover:bg-slate-50 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                                  >
                                    {inv.status === "active" ? "Pause" : "Resume"}
                                  </button>
                                )}

                                <button
                                  onClick={() => redeemFund(inv.id)}
                                  className="rounded bg-rose-50 px-2 py-1 text-[9px] font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400"
                                >
                                  Redeem
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPLORE FUNDS */}
        {activeTab === "explore" && (
          <div className="space-y-6">

            {/* Exploration Filter Suite */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">

              {/* Categories scroll row */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Category Filter</span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {["All", "Equity", "Debt", "Hybrid", "ELSS", "Index", "Gold"].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all shrink-0 border ${categoryFilter === cat
                          ? "bg-primary text-white border-transparent dark:bg-blue-600"
                          : "bg-slate-50 text-slate-550 border-slate-200 hover:bg-slate-100 dark:bg-slate-850 dark:text-slate-350 dark:border-slate-850"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">

                {/* Search */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Search Funds</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Small Cap"
                      className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2.5 text-xs text-slate-900 bg-slate-50 dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                    />
                    <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Risk Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Risk Tolerance</label>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs text-slate-900 bg-slate-50 dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                  >
                    <option value="All">All Risk Profiles</option>
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Sort Holdings By</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs text-slate-900 bg-slate-50 dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                  >
                    <option value="return3Y">Returns (3Y Annualized)</option>
                    <option value="return1Y">Returns (1Y)</option>
                    <option value="rating">Fund Rating</option>
                    <option value="aum">AUM Size</option>
                  </select>
                </div>

              </div>

            </div>

            {/* Fund Grid Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedFunds.map((fund) => {
                const isWatchlisted = watchlist.includes(fund.id)
                return (
                  <div
                    key={fund.id}
                    onClick={() => setSelectedFund(fund)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary dark:bg-blue-900/40 dark:text-blue-300">
                              {fund.category}
                            </span>
                            <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${fund.risk === "High"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30"
                                : fund.risk === "Moderate"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30"
                                  : "bg-green-100 text-green-700 dark:bg-green-950/30"
                              }`}>
                              {fund.risk} Risk
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-950 dark:text-white mt-1.5">{fund.name}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleToggleWatchlist(fund.id, e)}
                          className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isWatchlisted ? "text-rose-500 animate-[bounce_0.5s]" : "text-slate-300 hover:text-slate-450"
                            }`}
                        >
                          <Heart className={`h-4.5 w-4.5 ${isWatchlisted ? "fill-rose-500" : ""}`} />
                        </button>
                      </div>

                      {/* Ratings stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= fund.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>

                      {/* Yield returns */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 dark:border-slate-850 py-3 text-center">
                        <div>
                          <span className="text-[8px] text-slate-400 block uppercase font-bold">1Y Return</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">+{fund.return1Y}%</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 block uppercase font-bold">3Y Annual</span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">+{fund.return3Y}%</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-400 block uppercase font-bold">5Y Annual</span>
                          <span className="text-xs font-black text-green-600 dark:text-green-450">+{fund.return5Y}%</span>
                        </div>
                      </div>

                      {/* AUM Size */}
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                        <span>AUM: <strong className="text-slate-600 dark:text-slate-300">{fund.aum}</strong></span>
                        <span>Min SIP: <strong className="text-slate-600 dark:text-slate-300">₹{fund.minSip}</strong></span>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenPurchase(fund, "sip")
                        }}
                        className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-white hover:bg-blue-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
                      >
                        Invest Now
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SIP PLANNER */}
        {activeTab === "planner" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* SIP Returns Calculator Panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="h-4.5 w-4.5 text-primary" />
                  SIP Compound Returns Calculator
                </h4>

                {/* Sliders inputs */}
                <div className="space-y-4 text-xs font-bold">
                  {/* Amount Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-500">Monthly SIP Amount</span>
                      <span className="text-slate-950 dark:text-white font-black text-sm">₹{sipMonthly.toLocaleString("en-IN")}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="100000"
                      step="500"
                      value={sipMonthly}
                      onChange={(e) => setSipMonthly(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Return Rate Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-500">Expected Rate of Return</span>
                      <span className="text-slate-950 dark:text-white font-black text-sm">{sipRate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      step="0.5"
                      value={sipRate}
                      onChange={(e) => setSipRate(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Horizon years */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-500">Investment Horizon</span>
                      <span className="text-slate-950 dark:text-white font-black text-sm">{sipYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={sipYears}
                      onChange={(e) => setSipYears(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* Projection Output Cards */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-850 pt-4 text-center text-xs font-bold">
                  <div className="bg-slate-50/50 p-2.5 rounded-lg dark:bg-slate-950/20">
                    <span className="text-[8px] text-slate-400 block uppercase">Invested Amount</span>
                    <span className="text-slate-700 dark:text-slate-350 block mt-1">₹{sipOutput.investedAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg dark:bg-slate-950/20">
                    <span className="text-[8px] text-slate-400 block uppercase">Est. Returns</span>
                    <span className="text-green-600 dark:text-green-450 block mt-1">₹{sipOutput.estReturns.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2.5 rounded-lg dark:bg-slate-950/20">
                    <span className="text-[8px] text-slate-400 block uppercase">Maturity Value</span>
                    <span className="text-primary dark:text-blue-400 block mt-1 font-extrabold">₹{sipOutput.totalValue.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Area Growth chart */}
                <div className="h-44 w-full pt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sipOutput.growthData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`} />
                      <Area type="monotone" dataKey="Value" stroke="#00549c" fill="#00549c" fillOpacity={0.1} strokeWidth={2} />
                      <Area type="monotone" dataKey="Invested" stroke="#f4a900" fill="#f4a900" fillOpacity={0.05} strokeWidth={1} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Goal-Based calculator */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div className="space-y-5">
                  <h4 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4.5 w-4.5 text-primary" />
                    Goal-Based SIP Calculator
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Enter your final target financial goal, and let our system compute the exact monthly SIP saving required.
                  </p>

                  <div className="space-y-4 text-xs font-bold">
                    <div>
                      <label className="block text-slate-500 mb-1.5">Target Portfolio Amount (₹)</label>
                      <input
                        type="number"
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        placeholder="e.g. 1500000"
                        className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-slate-500">Tenure Horizon</span>
                          <span className="text-slate-950 dark:text-white">{goalYears} Yrs</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={goalYears}
                          onChange={(e) => setGoalYears(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-slate-500">Return Rate</span>
                          <span className="text-slate-950 dark:text-white">{goalRate}%</span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="20"
                          step="0.5"
                          value={goalRate}
                          onChange={(e) => setGoalRate(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 dark:border-slate-850 pt-5 space-y-4">
                  {requiredSip > 0 && (
                    <div className="rounded-xl bg-primary/5 p-4 border border-primary/15 dark:bg-blue-950/20 text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Required Monthly Investment</span>
                      <span className="text-2xl font-black text-slate-950 dark:text-white mt-1 block">
                        ₹{requiredSip.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setCategoryFilter("Equity")
                      setRiskFilter("High")
                      setActiveTab("explore")
                    }}
                    className="w-full rounded-xl bg-primary py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-500 shadow"
                  >
                    Find Funds for this Goal
                  </button>
                </div>
              </div>
            </div>

            {/* Top performing SIP funds mini list */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Top Performing Mutual Funds (3Y returns)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SBI_FUNDS.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFund(f)}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-850 dark:bg-slate-900 hover:shadow-md cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary dark:bg-blue-900/40 dark:text-blue-300">
                        {f.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">{f.name}</h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">3Y CAGR: +{f.return3Y}%</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-350" />
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: FD CALCULATOR */}
        {activeTab === "fd" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Calculator Panel */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
                <h4 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="h-4.5 w-4.5 text-primary" />
                  SBI Fixed Deposit Calculator
                </h4>

                <div className="space-y-5 text-xs font-bold">
                  {/* Principal */}
                  <div>
                    <label className="block text-slate-500 mb-1.5">FD Principal Amount (₹)</label>
                    <input
                      type="number"
                      value={fdPrincipal}
                      onChange={(e) => setFdPrincipal(parseInt(e.target.value) || 0)}
                      placeholder="e.g. 100000"
                      className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                    />
                  </div>

                  {/* Tenure Months */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-500">FD Tenure Horizon (Months)</span>
                      <span className="text-slate-950 dark:text-white font-black text-sm">{fdTenureMonths} Months ({parseFloat((fdTenureMonths / 12).toFixed(1))} Yrs)</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="120"
                      value={fdTenureMonths}
                      onChange={(e) => setFdTenureMonths(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Options: Interest Payout & Senior Citizen */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center border-t border-slate-100 dark:border-slate-850 pt-4">
                    <div>
                      <label className="block text-slate-500 mb-2">Interest Payout Type</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                          <input
                            type="radio"
                            name="fdPayout"
                            checked={fdPayout === "cumulative"}
                            onChange={() => setFdPayout("cumulative")}
                            className="h-4 w-4 text-primary"
                          />
                          Cumulative
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                          <input
                            type="radio"
                            name="fdPayout"
                            checked={fdPayout === "monthly"}
                            onChange={() => setFdPayout("monthly")}
                            className="h-4 w-4 text-primary"
                          />
                          Monthly
                        </label>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-3 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fdSenior}
                        onChange={(e) => setFdSenior(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-350 text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">Senior Citizen Premium</span>
                        <span className="block text-[9px] text-slate-400 font-normal mt-0.5">Adds 0.5% interest rate benefit</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Slabs breakdown rates card */}
                <div className="rounded-xl bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200/20 p-3.5 text-[10px] text-amber-800 dark:text-amber-300 leading-normal flex gap-2">
                  <Info className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">Current SBI Domestic Term Deposit Slabs</strong>
                    <span>
                      7d-45d: 3.5% | 46d-179d: 5.5% | 180d-1yr: 6.8% | 1-3yr: 7.0% | 3-10yr: 6.5%.
                      Seniors receive +0.50% across all slabs.
                    </span>
                  </div>
                </div>
              </div>

              {/* Output Result Side Panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between text-left space-y-6">

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Maturity Returns</h5>

                  <div className="space-y-1.5 text-xs font-bold border-b border-slate-100 dark:border-slate-850 pb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">FD Rate:</span>
                      <span className="text-slate-900 dark:text-white">{fdRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Interest Earned:</span>
                      <span className="text-green-600 dark:text-green-450 font-extrabold">₹{fdOutput.interestEarned.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Effective Yield:</span>
                      <span className="text-slate-900 dark:text-white">{fdOutput.effectiveYield}% p.a.</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-black block">Maturity Amount</span>
                    <span className="text-3xl font-black text-slate-950 dark:text-white mt-1 block">
                      ₹{fdOutput.maturityAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Bar Chart Breakdown */}
                <div className="h-28 w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Principal", val: fdPrincipal, fill: "#00549c" },
                        { name: "Interest", val: fdOutput.interestEarned, fill: "#f4a900" },
                      ]}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`} />
                      <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={32}>
                        <Cell fill="#00549c" />
                        <Cell fill="#f4a900" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <button
                  onClick={handleOpenFd}
                  disabled={isOpeningFd || fdPrincipal <= 0}
                  className="w-full rounded-xl bg-primary py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-500 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOpeningFd ? "Processing FD..." : "Open FD with SBI"}
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      <Footer />

      {/* --- MOCK SLIDE-OUT DETAIL SHEET (Tab 2) --- */}
      {selectedFund && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          {/* Click outside backdrop handler */}
          <div className="absolute inset-0" onClick={() => setSelectedFund(null)}></div>

          <div className="relative w-full max-w-xl h-full bg-white dark:bg-slate-900 p-6 md:p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-[slide_0.3s_ease-out]">

            {/* Sheet Content */}
            <div className="space-y-6 text-left">
              {/* Close Row */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-blue-400">
                  SBI Mutual Funds Profile
                </span>
                <button
                  onClick={() => setSelectedFund(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Title Header */}
              <div>
                <h3 className="text-xl font-black text-slate-950 dark:text-white leading-tight">
                  {selectedFund.name}
                </h3>
                <div className="flex gap-2 mt-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary dark:bg-blue-900/40 dark:text-blue-300">
                    {selectedFund.category}
                  </span>
                  <span className="rounded bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950/30">
                    {selectedFund.risk} Risk
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {selectedFund.description}
              </p>

              {/* Key Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold border-t border-b border-slate-150 dark:border-slate-850 py-4">
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Fund Manager</span>
                  <span className="text-slate-800 dark:text-slate-350">{selectedFund.manager}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Inception Date</span>
                  <span className="text-slate-800 dark:text-slate-350">{selectedFund.inception}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Expense Ratio</span>
                  <span className="text-slate-800 dark:text-slate-350">{selectedFund.expenseRatio}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 block uppercase">Latest NAV</span>
                  <span className="text-primary dark:text-blue-400 font-extrabold">₹{selectedFund.nav}</span>
                </div>
              </div>

              {/* NAV historical Area sparkline */}
              <div>
                <h5 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">NAV History (10 Days Sparkline)</h5>
                <div className="h-28 w-full bg-slate-50 p-2 rounded-xl dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getNavSparklineData(selectedFund.nav)}>
                      <ChartTooltip formatter={(value: any) => `₹${Number(value).toFixed(2)}`} />
                      <Area type="monotone" dataKey="nav" stroke="#00549c" fill="#00549c" fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Returns Slabs Table */}
              <div>
                <h5 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Historical Yield Summary</h5>
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-400 dark:bg-slate-850 dark:border-slate-800 font-extrabold">
                        <th className="px-4 py-2">Period</th>
                        <th className="px-4 py-2 text-right">Returns (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-350">
                      <tr>
                        <td className="px-4 py-2 text-slate-400">1 Month</td>
                        <td className="px-4 py-2 text-right font-medium">+1.45%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-slate-400">3 Months</td>
                        <td className="px-4 py-2 text-right font-medium">+4.12%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 text-slate-400">6 Months</td>
                        <td className="px-4 py-2 text-right font-medium">+7.80%</td>
                      </tr>
                      <tr className="bg-primary/5 dark:bg-blue-950/10 font-bold">
                        <td className="px-4 py-2 text-primary dark:text-blue-400">1 Year</td>
                        <td className="px-4 py-2 text-right text-primary dark:text-blue-400">+{selectedFund.return1Y}%</td>
                      </tr>
                      <tr className="font-bold">
                        <td className="px-4 py-2 text-slate-400">3 Years Annualized</td>
                        <td className="px-4 py-2 text-right">+{selectedFund.return3Y}%</td>
                      </tr>
                      <tr className="font-extrabold text-green-600 dark:text-green-450">
                        <td className="px-4 py-2">5 Years Annualized</td>
                        <td className="px-4 py-2 text-right">+{selectedFund.return5Y}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Purchase CTA Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-150 dark:border-slate-800 mt-6 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => handleOpenPurchase(selectedFund, "sip")}
                className="flex-1 rounded-xl border border-primary text-primary py-3.5 text-xs font-bold hover:bg-primary/5 dark:text-blue-400 dark:border-blue-800/60"
              >
                Start Monthly SIP
              </button>
              <button
                type="button"
                onClick={() => handleOpenPurchase(selectedFund, "lump")}
                className="flex-1 rounded-xl bg-primary py-3.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Invest Lumpsum
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- FUND PURCHASE MODAL --- */}
      {showPurchaseModal && purchaseFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-850 dark:bg-slate-900 text-left space-y-4">

            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-primary" />
              Complete Investment Setup
            </h3>

            <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[8px] text-slate-400 uppercase font-black">Target Fund</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{purchaseFund.name}</h4>
              <span className="text-[10px] text-slate-400">Min Investment: ₹{purchaseFund.minSip}</span>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Investment Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  placeholder={`Min ₹${purchaseFund.minSip}`}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white dark:border-slate-750 dark:bg-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {purchaseMode === "sip" && (
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Monthly SIP Date</label>
                  <select
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white dark:border-slate-750 dark:bg-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="1">1st of the Month</option>
                    <option value="5">5th of the Month</option>
                    <option value="10">10th of the Month</option>
                    <option value="15">15th of the Month</option>
                    <option value="25">25th of the Month</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 border-t border-slate-150 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold hover:bg-slate-50 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPurchase}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmittingPurchase ? "Processing..." : "Confirm & Invest"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
