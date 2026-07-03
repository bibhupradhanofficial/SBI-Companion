import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/AuthContext"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { jsPDF } from "jspdf"
import {
  transactionsService,
  userSettingsService,
  type Transaction
} from "@/lib/supabase-service"
import {
  Eye,
  EyeOff,
  Share2,
  FileText,
  Check,
  Shield,
  FileDown,
  Info,
  AlertTriangle,
  Lock,
  Sliders,
  RefreshCw,
  Smartphone
} from "lucide-react"

export const MobileBankingPage: React.FC = () => {
  const { user, profile, addActivity } = useAuth()
  const statementRef = useRef<HTMLDivElement>(null)

  // Account balance state
  const [showBalance, setShowBalance] = useState(false)
  const currentBalance = 45230.50

  // Statement states
  const [selectedMonth, setSelectedMonth] = useState("2026-06")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txnsLoading, setTxnsLoading] = useState(false)

  // Service grid states
  // 1. Cheque Request
  const [showChequeModal, setShowChequeModal] = useState(false)
  const [chequeLeaves, setChequeLeaves] = useState("25")
  const [chequeAddress, setChequeAddress] = useState(profile?.city ? `${profile.city}, India` : "")
  const [chequeSubmitting, setChequeSubmitting] = useState(false)

  // 2. Stop Cheque
  const [showStopChequeModal, setShowStopChequeModal] = useState(false)
  const [chequeStartNo, setChequeStartNo] = useState("")
  const [chequeEndNo, setChequeEndNo] = useState("")
  const [stopChequeSubmitting, setStopChequeSubmitting] = useState(false)

  // 4. Update Mobile/Email (OTP Flow)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [updateType, setUpdateType] = useState<"phone" | "email">("phone")
  const [updateValue, setUpdateValue] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpInput, setOtpInput] = useState("")
  const [otpTimer, setOtpTimer] = useState(30)
  const [otpError, setOtpError] = useState("")
  const timerRef = useRef<any>(null)

  // 5. Block/Unblock Debit Card
  const [cardBlocked, setCardBlocked] = useState(false)
  const [showCardToggleModal, setShowCardToggleModal] = useState(false)
  const [cardToggleLoading, setCardToggleLoading] = useState(false)

  // 6. Set Transaction Limits
  const [upiLimit, setUpiLimit] = useState(100000)
  const [atmLimit, setAtmLimit] = useState(50000)
  const [limitsLoading, setLimitsLoading] = useState(false)
  const [limitsSaved, setLimitsSaved] = useState(false)

  // Load Transactions & Limits on Mount
  useEffect(() => {
    if (user?.id) {
      loadStatementTransactions()
      loadUserLimits()
    }
    if (profile?.city) {
      setChequeAddress(`${profile.city}, ${profile.state || "India"}`)
    }
  }, [user, profile])

  // OTP Timer countdown
  useEffect(() => {
    if (otpSent && otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(prev => prev - 1), 1000)
    } else if (otpTimer === 0 && timerRef.current) {
      clearTimeout(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [otpSent, otpTimer])

  const loadStatementTransactions = async () => {
    if (!user?.id) return
    setTxnsLoading(true)
    try {
      // Fetch transactions up to 100
      const data = await transactionsService.list(user.id, 100)
      setTransactions(data)
    } catch (err) {
      console.error("Failed to load transactions for statement:", err)
    } finally {
      setTxnsLoading(false)
    }
  }

  const loadUserLimits = async () => {
    if (!user?.id) return
    setLimitsLoading(true)
    try {
      const settings = await userSettingsService.get(user.id)
      if (settings) {
        setUpiLimit(Number(settings.daily_upi_limit))
        setAtmLimit(Number(settings.daily_atm_limit))
      } else {
        // Create default if not found
        await userSettingsService.upsert(user.id, 100000, 50000)
      }
    } catch (err) {
      console.error("Failed to load settings limits:", err)
    } finally {
      setLimitsLoading(false)
    }
  }

  // Filter transactions by selected month/year
  const filteredTxns = transactions.filter(t => {
    const date = new Date(t.created_at)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    return `${yyyy}-${mm}` === selectedMonth && t.status === "success"
  })

  // Calculations
  const totalDebits = filteredTxns
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalCredits = filteredTxns
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const openingBalance = currentBalance - totalCredits + totalDebits
  const closingBalance = currentBalance

  // Copy Account details
  const handleShareDetails = () => {
    const details = `State Bank of India (SBI) Account Details\nAccount Holder: ${profile?.name || "Customer"}\nAccount Number: ************1234\nIFSC: SBIN0004012\nBranch: SBI Main Branch, ${profile?.city || "Mumbai"}`
    navigator.clipboard.writeText(details)
    alert("Account details copied to clipboard!")
  }

  // Generate jsPDF statement
  const handleDownloadPDF = () => {
    const doc = new jsPDF()

    // Title / Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(21, 101, 192) // SBI Blue
    doc.text("STATE BANK OF INDIA", 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")
    doc.text("YONO Lite Simulated Statement", 14, 25)
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 30)

    // Divider
    doc.setDrawColor(21, 101, 192)
    doc.setLineWidth(0.5)
    doc.line(14, 33, 196, 33)

    // Account Details
    doc.setFontSize(11)
    doc.setTextColor(50, 50, 50)
    doc.setFont("helvetica", "bold")
    doc.text("Account Details:", 14, 42)
    doc.setFont("helvetica", "normal")
    doc.text(`Account Holder: ${profile?.name || "Customer"}`, 14, 48)
    doc.text("Account Number: ************1234 (Savings A/C)", 14, 54)
    doc.text(`IFSC Code: SBIN0004012`, 14, 60)
    doc.text(`Branch: SBI Main Branch, ${profile?.city || "Mumbai"}`, 14, 66)

    // Statement Summary
    doc.setFont("helvetica", "bold")
    doc.text("Statement Summary:", 120, 42)
    doc.setFont("helvetica", "normal")
    doc.text(`Period: ${selectedMonth}`, 120, 48)
    doc.text(`Opening Balance: INR ${openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 120, 54)
    doc.text(`Total Credits: INR ${totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 120, 60)
    doc.text(`Total Debits: INR ${totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 120, 66)
    doc.text(`Closing Balance: INR ${closingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 120, 72)

    // Divider
    doc.line(14, 76, 196, 76)

    // Transaction Table Header
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setFillColor(240, 244, 248)
    doc.rect(14, 82, 182, 8, "F")
    doc.text("Date", 16, 87)
    doc.text("Description", 45, 87)
    doc.text("Reference ID", 110, 87)
    doc.text("Type", 150, 87)
    doc.text("Amount (INR)", 175, 87, { align: "right" })

    // Transactions loop
    let y = 96
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)

    if (filteredTxns.length === 0) {
      doc.text("No transactions found for the selected period.", 14, y)
    } else {
      filteredTxns.forEach(t => {
        if (y > 270) {
          doc.addPage()
          y = 20
          // Draw header on new page
          doc.setFont("helvetica", "bold")
          doc.setFillColor(240, 244, 248)
          doc.rect(14, y, 182, 8, "F")
          doc.text("Date", 16, y + 5)
          doc.text("Description", 45, y + 5)
          doc.text("Reference ID", 110, y + 5)
          doc.text("Type", 150, y + 5)
          doc.text("Amount (INR)", 175, y + 5, { align: "right" })
          y += 14
          doc.setFont("helvetica", "normal")
        }

        const dateStr = new Date(t.created_at).toLocaleDateString("en-IN")
        const desc = t.recipient_name
        const refId = t.reference_id
        const typeStr = t.type.toUpperCase()
        const amtStr = t.amount > 0 
          ? `+${t.amount.toFixed(2)}` 
          : `${t.amount.toFixed(2)}`

        // Draw Row
        doc.text(dateStr, 16, y)
        doc.text(desc.substring(0, 25), 45, y)
        doc.text(refId, 110, y)
        doc.text(typeStr, 150, y)
        doc.text(amtStr, 192, y, { align: "right" })

        // Divider line between rows
        doc.setDrawColor(230, 230, 230)
        doc.line(14, y + 3, 196, y + 3)
        y += 8
      })
    }

    // Save Statement PDF
    doc.save(`sbi_statement_${selectedMonth}.pdf`)
  }

  // Cheque Request Submission
  const handleChequeRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setChequeSubmitting(true)
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    try {
      await addActivity("agent", `Requested ${chequeLeaves} leaves cheque book for delivery to ${chequeAddress}`)
      alert(`Successfully requested cheque book with ${chequeLeaves} leaves! It will be delivered to: ${chequeAddress}`)
      setShowChequeModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setChequeSubmitting(false)
    }
  }

  // Stop Cheque Submission
  const handleStopCheque = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chequeStartNo) {
      alert("Please enter the starting cheque number.")
      return
    }
    setStopChequeSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    try {
      const desc = chequeEndNo 
        ? `Stopped cheque range: ${chequeStartNo} - ${chequeEndNo}`
        : `Stopped cheque number: ${chequeStartNo}`
      await addActivity("agent", desc)
      alert(`Successfully processed stop payment request. Details: ${desc}`)
      setShowStopChequeModal(false)
      setChequeStartNo("")
      setChequeEndNo("")
    } catch (err) {
      console.error(err)
    } finally {
      setStopChequeSubmitting(false)
    }
  }

  // OTP Simulated Flow
  const startOtpFlow = (type: "phone" | "email") => {
    setUpdateType(type)
    setUpdateValue("")
    setOtpSent(false)
    setOtpInput("")
    setOtpError("")
    setShowOtpModal(true)
  }

  const sendOtp = () => {
    if (!updateValue) {
      setOtpError(updateType === "phone" ? "Enter a valid mobile number" : "Enter a valid email address")
      return
    }
    setOtpError("")
    setOtpSent(true)
    setOtpTimer(30)
    alert(`Mock OTP sent! Enter "123456" to verify.`)
  }

  const verifyOtp = async () => {
    if (otpInput === "123456") {
      setShowOtpModal(false)
      alert(`Successfully updated your contact ${updateType} details!`)
      await addActivity("agent", `Updated registered ${updateType} to: ${updateValue}`)
    } else {
      setOtpError("Invalid verification code. Please enter '123456'.")
    }
  }

  // Card Block Flow
  const handleCardToggleConfirm = async () => {
    setCardToggleLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setCardBlocked(!cardBlocked)
    setCardToggleLoading(false)
    setShowCardToggleModal(false)
    await addActivity("agent", cardBlocked ? "Unblocked Debit Card ending *1234" : "Temporary blocked Debit Card ending *1234")
    alert(cardBlocked ? "Debit Card has been successfully unblocked." : "Debit Card has been successfully blocked.")
  }

  // Save Transaction Limits
  const handleSaveLimits = async () => {
    if (!user?.id) return
    setLimitsLoading(true)
    setLimitsSaved(false)
    try {
      await userSettingsService.upsert(user.id, upiLimit, atmLimit)
      await addActivity("agent", `Updated transaction limits: UPI Daily = ₹${upiLimit.toLocaleString()}, ATM Daily = ₹${atmLimit.toLocaleString()}`)
      setLimitsSaved(true)
      setTimeout(() => setLimitsSaved(false), 3000)
    } catch (err) {
      console.error(err)
      alert("Failed to save transaction limits.")
    } finally {
      setLimitsLoading(false)
    }
  }

  // Scroll to statement helper
  const scrollToStatement = () => {
    statementRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 text-left">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs text-primary dark:text-blue-400 font-extrabold uppercase tracking-widest">
              <Smartphone className="h-4 w-4" /> YONO-Lite Experience
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Mobile Banking
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your accounts, request physical services, configure security options, and download statements.
            </p>
          </div>

          <div className="flex h-3 border border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 rounded-full px-3 py-4 items-center gap-1.5 text-[10px] text-blue-600 dark:text-blue-400 font-bold self-start">
            <Shield className="h-4 w-4 text-primary dark:text-blue-400 shrink-0" />
            256-Bit SSL Secured Core
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left / Main Section: Card & Statement */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Account Overview Card Container */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Account Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Stylized SBI Bank Card */}
                <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-900 p-6 text-white shadow-md overflow-hidden flex flex-col justify-between select-none">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 100 100" className="h-7 w-7 fill-white stroke-none">
                        <circle cx="50" cy="50" r="40" />
                        <rect x="42" y="10" width="16" height="80" fill="#00a5ec" />
                      </svg>
                      <span className="text-sm font-extrabold tracking-wider">SBI</span>
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider text-slate-300">YONO DEBIT</span>
                  </div>

                  {/* Card Chip */}
                  <div className="w-10 h-7 bg-amber-400/90 rounded-md flex flex-col gap-0.5 justify-around p-1 border border-amber-600/30">
                    <div className="w-full h-0.5 bg-amber-700/20" />
                    <div className="w-full h-0.5 bg-amber-700/20" />
                    <div className="w-full h-0.5 bg-amber-700/20" />
                  </div>

                  {/* Account Numbers / Holder */}
                  <div className="space-y-1">
                    <div className="text-xs text-slate-350 tracking-widest font-mono">
                      {cardBlocked ? (
                        <span className="text-red-400 font-bold tracking-normal flex items-center gap-1 text-[10px]">
                          <Lock className="h-3.5 w-3.5" /> CARD TEMPORARILY BLOCKED
                        </span>
                      ) : (
                        "**** **** **** 1234"
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-xs uppercase font-semibold tracking-wider truncate max-w-[170px]">{profile?.name || "SBI CUSTOMER"}</span>
                      <span className="text-[8px] font-bold text-slate-400">SBI SANDBOX</span>
                    </div>
                  </div>
                </div>

                {/* Card Details / Info */}
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Available Balance:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                          {showBalance ? `₹${currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "••••••"}
                        </span>
                        <button
                          onClick={() => setShowBalance(!showBalance)}
                          className="text-slate-450 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                          {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Number:</span>
                        <span className="font-semibold font-mono">00000030291920392</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IFSC Code:</span>
                        <span className="font-semibold font-mono">SBIN0004012</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Branch Name:</span>
                        <span className="font-semibold">SBI Main Branch, {profile?.city || "Mumbai"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card CTAs */}
                  <div className="flex gap-3">
                    <button
                      onClick={scrollToStatement}
                      className="flex-1 flex justify-center items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" /> View Statement
                    </button>
                    <button
                      onClick={handleShareDetails}
                      className="flex-1 flex justify-center items-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share Details
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Account Statement Section */}
            <div
              ref={statementRef}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 scroll-mt-20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Account Statement</h2>
                  <p className="text-xs text-slate-500">View transactions and download official PDF record.</p>
                </div>

                <div className="flex gap-3 items-center self-start">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    max="2026-12"
                    min="2025-01"
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs px-3 py-2 font-semibold text-slate-750 dark:text-slate-300"
                  />
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer"
                  >
                    <FileDown className="h-4 w-4" /> Download PDF
                  </button>
                </div>
              </div>

              {/* Statement Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Opening Balance</span>
                  <div className="text-sm font-black font-mono text-slate-950 dark:text-white mt-1">
                    ₹{openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-emerald-50/25 dark:bg-emerald-950/10 p-3.5 rounded-xl border border-emerald-100/20">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">Total Credits</span>
                  <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    +₹{totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-red-50/25 dark:bg-red-950/10 p-3.5 rounded-xl border border-red-100/20">
                  <span className="text-[10px] text-red-600 dark:text-red-400 uppercase font-bold tracking-wider">Total Debits</span>
                  <div className="text-sm font-black font-mono text-red-600 dark:text-red-400 mt-1">
                    -₹{totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Closing Balance</span>
                  <div className="text-sm font-black font-mono text-slate-950 dark:text-white mt-1">
                    ₹{closingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              {txnsLoading ? (
                <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-slate-350" />
                  Loading transactions...
                </div>
              ) : filteredTxns.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-center text-xs text-slate-400">
                  No successful transactions found for the month {selectedMonth}.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Recipient / Details</th>
                        <th className="py-3 px-2">Reference ID</th>
                        <th className="py-3 px-2">Type</th>
                        <th className="py-3 px-2 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium">
                      {filteredTxns.map((txn) => {
                        const isCredit = txn.amount > 0
                        return (
                          <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                            <td className="py-3.5 px-2 text-slate-500 font-mono">
                              {new Date(txn.created_at).toLocaleDateString("en-IN")}
                            </td>
                            <td className="py-3.5 px-2">
                              <div className="font-bold text-slate-800 dark:text-white">{txn.recipient_name}</div>
                              <div className="text-[10px] text-slate-400 font-normal">{txn.recipient_id}</div>
                            </td>
                            <td className="py-3.5 px-2 font-mono text-slate-400 truncate max-w-[100px]">
                              {txn.reference_id}
                            </td>
                            <td className="py-3.5 px-2 uppercase text-[10px] text-slate-500 font-extrabold">
                              {txn.type}
                            </td>
                            <td className={`py-3.5 px-2 text-right font-black font-mono ${isCredit ? "text-emerald-600" : "text-slate-800 dark:text-slate-100"}`}>
                              {isCredit ? `+₹${txn.amount.toLocaleString("en-IN")}` : `-₹${Math.abs(txn.amount).toLocaleString("en-IN")}`}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Section: Service Limits & Linked Accounts */}
          <div className="space-y-8">
            
            {/* Set Limits Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="h-5 w-5 text-primary dark:text-blue-400" />
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Transaction Limits</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6">Set your daily transfer thresholds to secure your savings.</p>

              {limitsLoading ? (
                <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Fetching limits...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* UPI LIMIT SLIDER */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-350">Daily UPI Limit:</span>
                      <span className="font-black font-mono text-primary dark:text-blue-400">₹{upiLimit.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="5000"
                      value={upiLimit}
                      onChange={(e) => setUpiLimit(Number(e.target.value))}
                      className="w-full accent-primary dark:accent-blue-500 cursor-pointer h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>₹0</span>
                      <span>₹1,00,000</span>
                    </div>
                  </div>

                  {/* ATM LIMIT SLIDER */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-350">Daily ATM Limit:</span>
                      <span className="font-black font-mono text-primary dark:text-blue-400">₹{atmLimit.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="2000"
                      value={atmLimit}
                      onChange={(e) => setAtmLimit(Number(e.target.value))}
                      className="w-full accent-primary dark:accent-blue-500 cursor-pointer h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                      <span>₹0</span>
                      <span>₹50,000</span>
                    </div>
                  </div>

                  {/* Save limits CTA */}
                  <button
                    onClick={handleSaveLimits}
                    className="w-full flex justify-center items-center gap-1.5 rounded-lg bg-primary py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer"
                  >
                    Save Limits
                  </button>

                  {limitsSaved && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold justify-center">
                      <Check className="h-4 w-4" /> Limits saved successfully!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Linked Accounts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Linked Accounts</h2>
              <div className="space-y-3">
                
                {/* Active SBI Savings */}
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl border border-blue-100/10 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-white">SBI Savings Account</div>
                    <div className="text-[10px] text-slate-400 font-mono">A/C: ************1234</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                {/* Active SBI FD */}
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl border border-blue-100/10 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-black text-slate-800 dark:text-white">SBI Fixed Deposit (FD)</div>
                    <div className="text-[10px] text-slate-400 font-mono">A/C: ************8842</div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>

                {/* Grayed Link Button */}
                <button
                  disabled
                  className="w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-center text-xs font-bold text-slate-400 flex justify-center items-center gap-1.5 opacity-65 cursor-not-allowed hover:bg-slate-50/20"
                >
                  <Lock className="h-3.5 w-3.5" /> Link NPS / PPF Account
                </button>

              </div>
            </div>

          </div>
        </div>

        {/* Services Grid (2x3 grid) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-8">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6">YONO Quick Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Service 1: Cheque Book Request */}
            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/25 hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1">Cheque Book Request</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">Order a new physical cheque book delivered to your address.</p>
              </div>
              <button
                onClick={() => setShowChequeModal(true)}
                className="mt-4 w-full rounded-lg bg-white border border-slate-250 py-1.5 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 cursor-pointer"
              >
                Request Cheque Book
              </button>
            </div>

            {/* Service 2: Stop Cheque */}
            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/25 hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1">Stop Cheque Payment</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">Cancel leaves or issue range instantly to block unauthorized clearances.</p>
              </div>
              <button
                onClick={() => setShowStopChequeModal(true)}
                className="mt-4 w-full rounded-lg bg-white border border-slate-250 py-1.5 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 cursor-pointer"
              >
                Stop Payment
              </button>
            </div>

            {/* Service 3: Account Statement Link */}
            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/25 hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1">Account Statement</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">Select date ranges, search transaction records, and export statements.</p>
              </div>
              <button
                onClick={scrollToStatement}
                className="mt-4 w-full rounded-lg bg-white border border-slate-250 py-1.5 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 cursor-pointer"
              >
                View Statement Table
              </button>
            </div>

            {/* Service 4: Update Mobile/Email */}
            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/25 hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1">Update Contact Details</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">Simulate updating your phone or email using a secure OTP validation loop.</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => startOtpFlow("phone")}
                  className="flex-1 rounded-lg bg-white border border-slate-250 py-1.5 px-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 cursor-pointer"
                >
                  Update Phone
                </button>
                <button
                  onClick={() => startOtpFlow("email")}
                  className="flex-1 rounded-lg bg-white border border-slate-250 py-1.5 px-2 text-[10px] font-bold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 cursor-pointer"
                >
                  Update Email
                </button>
              </div>
            </div>

            {/* Service 5: Block Debit Card */}
            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/25 hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1">Block / Unblock Card</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">Instantly lock or unlock your debit card to prevent misuse.</p>
              </div>
              <button
                onClick={() => setShowCardToggleModal(true)}
                className={`mt-4 w-full rounded-lg py-1.5 px-3 text-[11px] font-bold text-white cursor-pointer ${cardBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {cardBlocked ? "Unblock Debit Card" : "Temporary Block Card"}
              </button>
            </div>

            {/* Service 6: Set Transaction Limits Shortcut */}
            <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/25 hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white mb-1">Config Limits</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">Adjust limits for ATM withdrawals and UPI transactions dynamically.</p>
              </div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-4 w-full rounded-lg bg-white border border-slate-250 py-1.5 px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 cursor-pointer"
              >
                Edit Sliders above
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* ─────────────────── MODALS & DIALOGS ─────────────────── */}

      {/* 1. Cheque Request Modal */}
      {showChequeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-md w-full">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-3">Cheque Book Request</h3>
            
            <form onSubmit={handleChequeRequest} className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block font-semibold">Select Account:</span>
                <input
                  type="text"
                  disabled
                  value="Savings Account (****1234) - SBI Main Branch"
                  className="w-full border border-slate-200 bg-slate-55/60 dark:border-slate-800 dark:bg-slate-950 p-2.5 rounded-lg opacity-70 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 block font-semibold">Number of Leaves:</span>
                <select
                  value={chequeLeaves}
                  onChange={(e) => setChequeLeaves(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold"
                >
                  <option value="25">25 Leaves (Normal)</option>
                  <option value="50">50 Leaves (Medium Business)</option>
                  <option value="100">100 Leaves (Premium Corporate)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 block font-semibold">Delivery Address:</span>
                <textarea
                  required
                  value={chequeAddress}
                  onChange={(e) => setChequeAddress(e.target.value)}
                  placeholder="Enter full postal address..."
                  rows={3}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChequeModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={chequeSubmitting}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer font-bold flex justify-center items-center gap-1.5"
                >
                  {chequeSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Stop Cheque Modal */}
      {showStopChequeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-md w-full">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-2">Stop Cheque Payment</h3>
            <p className="text-[11px] text-slate-500 mb-4">Prevent clearance of a misplaced cheque leaf or range of leaves.</p>

            <form onSubmit={handleStopCheque} className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block font-semibold">Select Account:</span>
                <input
                  type="text"
                  disabled
                  value="Savings Account (****1234) - SBI Main Branch"
                  className="w-full border border-slate-200 bg-slate-55/60 dark:border-slate-800 dark:bg-slate-950 p-2.5 rounded-lg opacity-70 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-slate-500 block font-semibold">Start Cheque No:</span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 104291"
                    value={chequeStartNo}
                    onChange={(e) => setChequeStartNo(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 block font-semibold">End Cheque No (Optional):</span>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 104295"
                    value={chequeEndNo}
                    onChange={(e) => setChequeEndNo(e.target.value.replace(/\D/g, ""))}
                    className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="bg-amber-50/20 dark:bg-amber-950/10 p-3 rounded-lg border border-amber-500/20 flex gap-2">
                <Info className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                  Stopping a cheque clearance may incur a nominal fee of ₹50 per request in real accounts. This sandbox allows you to stop payment free of cost.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStopChequeModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stopChequeSubmitting}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer font-bold flex justify-center items-center gap-1.5"
                >
                  {stopChequeSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Confirm Stop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. OTP update modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-sm w-full">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-2">
              Update Contact {updateType === "phone" ? "Mobile Number" : "Email Address"}
            </h3>
            
            <div className="space-y-4 text-xs">
              {!otpSent ? (
                <>
                  <p className="text-[11px] text-slate-500">
                    Enter your new {updateType === "phone" ? "10-digit mobile number" : "email address"}. A validation code will be sent.
                  </p>
                  <div className="space-y-1">
                    <span className="text-slate-500 block font-semibold">New {updateType === "phone" ? "Mobile" : "Email"}:</span>
                    <input
                      type={updateType === "phone" ? "tel" : "email"}
                      required
                      placeholder={updateType === "phone" ? "e.g. 9876543210" : "e.g. name@example.com"}
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold"
                    />
                  </div>
                  {otpError && <div className="text-red-600 font-bold">{otpError}</div>}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowOtpModal(false)}
                      className="flex-1 rounded-lg border border-slate-200 py-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendOtp}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 cursor-pointer font-bold"
                    >
                      Send Verification Code
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] text-slate-500">
                    Enter the 6-digit OTP code sent to your new {updateType}.
                  </p>
                  <div className="space-y-1">
                    <span className="text-slate-500 block font-semibold">Verification Code:</span>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg text-center font-mono tracking-widest text-lg font-black"
                    />
                  </div>
                  {otpError && <div className="text-red-600 font-bold">{otpError}</div>}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>Code Valid for: <span className="font-mono text-slate-700 dark:text-slate-200">{otpTimer}s</span></span>
                    {otpTimer === 0 ? (
                      <button onClick={sendOtp} className="text-primary dark:text-blue-400 hover:underline cursor-pointer">
                        Resend Code
                      </button>
                    ) : (
                      <span className="opacity-50">Resend Code</span>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setOtpSent(false)}
                      className="flex-1 rounded-lg border border-slate-200 py-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer font-bold"
                    >
                      Back
                    </button>
                    <button
                      onClick={verifyOtp}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 cursor-pointer font-bold"
                    >
                      Verify & Update
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Card block confirm modal */}
      {showCardToggleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-sm w-full text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/35 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-2">
              {cardBlocked ? "Unblock Debit Card?" : "Block Debit Card?"}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {cardBlocked 
                ? "This will restore payment and withdrawal functionalities on your card ending *1234." 
                : "This will temporarily prevent all online/offline payments and ATM cash withdrawals on your debit card ending *1234."}
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCardToggleModal(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCardToggleConfirm}
                disabled={cardToggleLoading}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold text-white cursor-pointer ${cardBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {cardToggleLoading ? <RefreshCw className="h-4 w-4 animate-spin mx-auto" /> : (cardBlocked ? "Unblock Card" : "Block Card")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
