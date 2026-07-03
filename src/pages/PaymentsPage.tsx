import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import {
  transactionsService,
  beneficiariesService,
  type Transaction,
  type Beneficiary,
} from "@/lib/supabase-service"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useNavigate } from "react-router-dom"
import {
  Send,
  History,
  Users,
  Smartphone,
  CreditCard,
  Lightbulb,
  MessageSquare,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Star,
  Trash2,
  Plus,
  Search,
  Check,
  Camera,
  Play,
  Zap,
  ShieldCheck,
} from "lucide-react"

// Bank name auto-fill based on IFSC prefix
const IFSC_BANK_MAP: { [key: string]: string } = {
  SBIN: "State Bank of India (SBI)",
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  BARB: "Bank of Baroda",
  PUNB: "Punjab National Bank",
  CNRB: "Canara Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  IBKL: "IDBI Bank",
  IDFB: "IDFC First Bank",
}

// Transaction and Beneficiary types are imported from supabase-service

export const PaymentsPage: React.FC = () => {
  const { user, addActivity } = useAuth()
  const navigate = useNavigate()

  // Tab State
  const [activeTab, setActiveTab] = useState<"send" | "history" | "beneficiaries">("send")

  // Database lists
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])

  // --- Tab 1 State: Send Money ---
  const [transferMode, setTransferMode] = useState<"upi" | "bank">("upi")

  // UPI Form State
  const [upiId, setUpiId] = useState("")
  const [upiAmount, setUpiAmount] = useState("")
  const [upiNote, setUpiNote] = useState("")
  const [upiPurpose, setUpiPurpose] = useState("Friend")
  const [upiErrors, setUpiErrors] = useState<{ [key: string]: string }>({})

  // Bank Form State
  const [accountNo, setAccountNo] = useState("")
  const [confirmAccountNo, setConfirmAccountNo] = useState("")
  const [ifscCode, setIfscCode] = useState("")
  const [holderName, setHolderName] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAmount, setBankAmount] = useState("")
  const [bankTransferType, setBankTransferType] = useState<"imps" | "neft" | "rtgs">("imps")
  const [bankErrors, setBankErrors] = useState<{ [key: string]: string }>({})
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState("")

  // Autopay Setup State
  const [showAutopayModal, setShowAutopayModal] = useState(false)
  const [autopayCategory, setAutopayCategory] = useState("")
  const [autopayBiller, setAutopayBiller] = useState("")
  const [autopayMobileOrAcc, setAutopayMobileOrAcc] = useState("")
  const [autopayLimit, setAutopayLimit] = useState("")
  const [autopayFrequency, setAutopayFrequency] = useState("monthly")
  const [autopayErrors, setAutopayErrors] = useState<{ [key: string]: string }>({})

  // QR Scan Modal
  const [showQrModal, setShowQrModal] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  // Payment Confirmation Dialog Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmDetails, setConfirmDetails] = useState<{
    recipient_name: string
    recipient_id: string
    amount: number
    type: "upi" | "neft" | "imps" | "rtgs"
    purpose: string
    note: string
    ifsc?: string
    bank_name?: string
  } | null>(null)

  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    reference_id: string
    timestamp: string
    recipient_name: string
    amount: number
  } | null>(null)

  // --- Tab 2 State: History Filters ---
  const [searchFilter, setSearchFilter] = useState("")
  const [dateRange, setDateRange] = useState("30") // 7, 30, 90, custom
  const [typeFilter, setTypeFilter] = useState("all") // all, credit, debit
  const [maxAmountRange, setMaxAmountRange] = useState(100000)
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // --- Tab 3 State: Manage Beneficiaries ---
  const [beneSearch, setBeneSearch] = useState("")
  const [beneName, setBeneName] = useState("")
  const [beneAccountOrUpi, setBeneAccountOrUpi] = useState("")
  const [beneType, setBeneType] = useState<"upi" | "bank">("upi")
  const [beneIfsc, setBeneIfsc] = useState("")
  const [beneBankName, setBeneBankName] = useState("")
  const [beneErrors, setBeneErrors] = useState<{ [key: string]: string }>({})
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null)

  // --- Supabase Data Loading ---

  const loadTransactions = async (userId: string) => {
    try {
      const data = await transactionsService.list(userId, 100)
      setTransactions(data)
    } catch (err) {
      console.error("Failed to load transactions:", err)
      setTransactions([])
    }
  }

  const loadBeneficiaries = async (userId: string) => {
    try {
      const data = await beneficiariesService.list(userId)
      setBeneficiaries(data)
    } catch (err) {
      console.error("Failed to load beneficiaries:", err)
      setBeneficiaries([])
    }
  }

  // Fetch initial data
  useEffect(() => {
    if (user?.id) {
      loadTransactions(user.id)
      loadBeneficiaries(user.id)
    }
  }, [user])

  const addTransactionToDB = async (txn: Omit<Transaction, "id" | "user_id" | "created_at">) => {
    if (!user?.id) return
    try {
      const data = await transactionsService.add({ user_id: user.id, ...txn })
      setTransactions(prev => [data, ...prev])
    } catch (err) {
      console.error("Failed to add transaction:", err)
    }
  }

  const addBeneficiaryToDB = async (bene: Omit<Beneficiary, "id" | "user_id" | "is_favourite" | "created_at">) => {
    if (!user?.id) return
    try {
      const data = await beneficiariesService.add({ user_id: user.id, ...bene, is_favourite: false })
      setBeneficiaries(prev => [data, ...prev])
    } catch (err) {
      console.error("Failed to add beneficiary:", err)
    }
  }

  const deleteBeneficiaryFromDB = async (id: string) => {
    if (!user?.id) return
    try {
      await beneficiariesService.delete(id)
      setBeneficiaries(prev => prev.filter(b => b.id !== id))
    } catch (err) {
      console.error("Failed to delete beneficiary:", err)
    }
  }

  const toggleBeneficiaryFavoriteInDB = async (id: string, currentFav: boolean) => {
    if (!user?.id) return
    try {
      const updated = await beneficiariesService.toggleFavourite(id, !currentFav)
      setBeneficiaries(prev => prev.map(b => b.id === id ? updated : b))
    } catch (err) {
      console.error("Failed to toggle beneficiary favourite:", err)
    }
  }

  // --- Real-time validations ---

  const handleUpiChange = (val: string) => {
    setUpiId(val)
    if (val && !val.includes("@")) {
      setUpiErrors(prev => ({ ...prev, upiId: "UPI ID must contain '@' (e.g. name@oksbi)" }))
    } else {
      setUpiErrors(prev => {
        const copy = { ...prev }
        delete copy.upiId
        return copy
      })
    }
  }

  const handleUpiAmountChange = (val: string) => {
    setUpiAmount(val)
    const amt = parseFloat(val)
    if (val && (isNaN(amt) || amt <= 0)) {
      setUpiErrors(prev => ({ ...prev, amount: "Amount must be greater than 0" }))
    } else if (amt > 100000) {
      setUpiErrors(prev => ({ ...prev, amount: "Maximum UPI transfer limit is ₹1,00,000" }))
    } else {
      setUpiErrors(prev => {
        const copy = { ...prev }
        delete copy.amount
        return copy
      })
    }
  }

  const handleAccountNoChange = (val: string) => {
    const numeric = val.replace(/\D/g, "")
    setAccountNo(numeric)
    if (numeric && (numeric.length < 9 || numeric.length > 18)) {
      setBankErrors(prev => ({ ...prev, accountNo: "Account number must be between 9 and 18 digits" }))
    } else {
      setBankErrors(prev => {
        const copy = { ...prev }
        delete copy.accountNo
        return copy
      })
    }

    if (confirmAccountNo && numeric !== confirmAccountNo) {
      setBankErrors(prev => ({ ...prev, confirmAccountNo: "Account numbers do not match" }))
    } else {
      setBankErrors(prev => {
        const copy = { ...prev }
        delete copy.confirmAccountNo
        return copy
      })
    }
  }

  const handleConfirmAccountNoChange = (val: string) => {
    const numeric = val.replace(/\D/g, "")
    setConfirmAccountNo(numeric)
    if (numeric && accountNo !== numeric) {
      setBankErrors(prev => ({ ...prev, confirmAccountNo: "Account numbers do not match" }))
    } else {
      setBankErrors(prev => {
        const copy = { ...prev }
        delete copy.confirmAccountNo
        return copy
      })
    }
  }

  const handleIfscChange = (val: string) => {
    const upper = val.toUpperCase().slice(0, 11)
    setIfscCode(upper)

    // Auto-fill bank name
    if (upper.length >= 4) {
      const prefix = upper.slice(0, 4)
      if (IFSC_BANK_MAP[prefix]) {
        setBankName(IFSC_BANK_MAP[prefix])
      } else {
        setBankName("")
      }
    } else {
      setBankName("")
    }

    // Validate IFSC code format
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (upper && !ifscRegex.test(upper)) {
      setBankErrors(prev => ({ ...prev, ifscCode: "IFSC must be 11 uppercase characters (e.g. SBIN0004012)" }))
    } else {
      setBankErrors(prev => {
        const copy = { ...prev }
        delete copy.ifscCode
        return copy
      })
    }
  }

  const handleBankAmountChange = (val: string) => {
    setBankAmount(val)
    const amt = parseFloat(val)
    if (val && (isNaN(amt) || amt <= 0)) {
      setBankErrors(prev => ({ ...prev, amount: "Amount must be greater than 0" }))
    } else {
      setBankErrors(prev => {
        const copy = { ...prev }
        delete copy.amount
        return copy
      })
    }

    // Auto-switch Bank Transfer Mode
    if (amt >= 200000) {
      setBankTransferType("rtgs")
    } else if (bankTransferType === "rtgs") {
      setBankTransferType("imps")
    }
  }

  // Choose beneficiary autofill
  const handleSelectBeneficiary = (beneId: string) => {
    setSelectedBeneficiaryId(beneId)
    if (!beneId) return

    const bene = beneficiaries.find(b => b.id === beneId)
    if (bene) {
      if (bene.type === "upi") {
        setTransferMode("upi")
        setUpiId(bene.account_or_upi)
        setUpiErrors({})
      } else {
        setTransferMode("bank")
        setAccountNo(bene.account_or_upi)
        setConfirmAccountNo(bene.account_or_upi)
        setIfscCode(bene.ifsc || "")
        setHolderName(bene.name)
        setBankName(bene.bank_name || "")
        setBankErrors({})
      }
    }
  }

  // --- Scan QR Mock Modal Helper ---

  const handleScanQrMock = () => {
    setShowQrModal(true)
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setUpiId("sbi.merchant@oksbi")
      setShowQrModal(false)
      // trigger input validation update
      handleUpiChange("sbi.merchant@oksbi")
    }, 2200)
  }

  // --- Transfer Submits ---

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Check validation errors
    const errors: { [key: string]: string } = {}
    if (!upiId || !upiId.includes("@")) {
      errors.upiId = "Please enter a valid UPI ID"
    }
    const amt = parseFloat(upiAmount)
    if (isNaN(amt) || amt <= 0) {
      errors.amount = "Amount must be greater than 0"
    } else if (amt > 100000) {
      errors.amount = "Maximum UPI limit is ₹1,00,000"
    }

    if (Object.keys(errors).length > 0) {
      setUpiErrors(errors)
      return
    }

    setConfirmDetails({
      recipient_name: upiId.split("@")[0].toUpperCase(),
      recipient_id: upiId,
      amount: amt,
      type: "upi",
      purpose: upiPurpose,
      note: upiNote,
    })
    setShowConfirmModal(true)
  }

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: { [key: string]: string } = {}
    if (accountNo.length < 9 || accountNo.length > 18) {
      errors.accountNo = "Account number must be between 9 and 18 digits"
    }
    if (accountNo !== confirmAccountNo) {
      errors.confirmAccountNo = "Account numbers do not match"
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (!ifscRegex.test(ifscCode)) {
      errors.ifscCode = "Invalid IFSC Code format"
    }
    if (!holderName.trim()) {
      errors.holderName = "Account holder name is required"
    }
    const amt = parseFloat(bankAmount)
    if (isNaN(amt) || amt <= 0) {
      errors.amount = "Amount must be greater than 0"
    }
    if (bankTransferType === "rtgs" && amt < 200000) {
      errors.bankTransferType = "RTGS mode is only available for transfers above ₹2,00,000"
    }

    if (Object.keys(errors).length > 0) {
      setBankErrors(errors)
      return
    }

    setConfirmDetails({
      recipient_name: holderName,
      recipient_id: accountNo,
      amount: amt,
      type: bankTransferType,
      purpose: "Bank Transfer",
      note: "IMPS/NEFT Payment",
      ifsc: ifscCode,
      bank_name: bankName || "Other Bank",
    })
    setShowConfirmModal(true)
  }

  // Confirm and Execute Transfer
  const handleConfirmPayment = async () => {
    if (!confirmDetails) return
    setPaymentLoading(true)

    // Simulate bank authorization processing (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const refId = "REF" + Math.random().toString(36).substring(2, 14).toUpperCase()
    const timestampStr = new Date().toISOString()

    // Save transaction to DB / LocalStorage (always save as a negative amount for debits)
    await addTransactionToDB({
      type: confirmDetails.type,
      recipient_name: confirmDetails.recipient_name,
      recipient_id: confirmDetails.recipient_id,
      amount: -confirmDetails.amount,
      purpose: confirmDetails.purpose,
      note: confirmDetails.note,
      status: "success",
      reference_id: refId,
    })

    setPaymentSuccessData({
      reference_id: refId,
      timestamp: timestampStr,
      recipient_name: confirmDetails.recipient_name,
      amount: confirmDetails.amount,
    })

    setPaymentLoading(false)

    // Clear Form inputs
    setUpiId("")
    setUpiAmount("")
    setUpiNote("")
    setAccountNo("")
    setConfirmAccountNo("")
    setIfscCode("")
    setHolderName("")
    setBankName("")
    setBankAmount("")
    setSelectedBeneficiaryId("")
  }

  const handleDownloadReceipt = () => {
    if (!paymentSuccessData) return
    const text = `
------------------------------------------
         STATE BANK OF INDIA (SBI)
             PAYMENT RECEIPT
------------------------------------------
Receipt Generated: ${new Date(paymentSuccessData.timestamp).toLocaleString("en-IN")}
Status: SUCCESSFUL
Transaction Ref: ${paymentSuccessData.reference_id}
Recipient Name: ${paymentSuccessData.recipient_name}
Paid Amount: INR ${paymentSuccessData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Purpose: Funds Transfer
Thank you for banking with State Bank of India.
------------------------------------------
`
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sbi_receipt_${paymentSuccessData.reference_id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Autopay Form Setup ---

  const handleOpenAutopay = (category: string) => {
    setAutopayCategory(category)
    setAutopayBiller("")
    setAutopayMobileOrAcc("")
    setAutopayLimit("")
    setAutopayErrors({})
    setShowAutopayModal(true)
  }

  const handleAutopaySetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: { [key: string]: string } = {}
    if (!autopayBiller) errors.biller = "Please select a provider"
    if (!autopayMobileOrAcc.trim()) errors.mobileOrAcc = "Biller account/mobile is required"
    const limit = parseFloat(autopayLimit)
    if (isNaN(limit) || limit <= 0) errors.limit = "Please enter a valid maximum limit"

    if (Object.keys(errors).length > 0) {
      setAutopayErrors(errors)
      return
    }

    setShowAutopayModal(false)
    alert(`Autopay successfully configured for ${autopayCategory} (${autopayBiller}) with a maximum limit of ₹${limit.toLocaleString("en-IN")}.`)

    // Save activity
    await addActivity("insurance", `Set up Autopay for ${autopayCategory} biller: ${autopayBiller} (Limit: ₹${limit})`, limit)
  }

  // --- Tab 2: Transaction History Processing ---

  // Date range calculator
  const filterByDate = (dateStr: string) => {
    const txnDate = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.ceil((now.getTime() - txnDate.getTime()) / (1000 * 3600 * 24))

    if (dateRange === "7" && diffDays <= 7) return true
    if (dateRange === "30" && diffDays <= 30) return true
    if (dateRange === "90" && diffDays <= 90) return true
    if (dateRange === "custom") return true // show all in simple custom
    return false
  }

  const filteredTransactions = transactions.filter(txn => {
    // 1. Search text
    const searchMatch =
      txn.recipient_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      txn.recipient_id.includes(searchFilter) ||
      txn.reference_id.toLowerCase().includes(searchFilter.toLowerCase())

    // 2. Date
    const dateMatch = filterByDate(txn.created_at)

    // 3. Credit/Debit Type
    let typeMatch = true
    if (typeFilter === "credit") {
      typeMatch = txn.amount > 0
    } else if (typeFilter === "debit") {
      typeMatch = txn.amount < 0
    }

    // 4. Amount Range
    const amountMatch = Math.abs(txn.amount) <= maxAmountRange

    return searchMatch && dateMatch && typeMatch && amountMatch
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Calculations for Summary Cards
  const totalSent = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const totalReceived = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  // CSV Export
  const handleExportCSV = () => {
    const headers = "Transaction ID,Date,Recipient,Identifier,Amount (INR),Type,Purpose,Status\n"
    const rows = filteredTransactions
      .map(t => {
        const type = t.amount < 0 ? "Debit" : "Credit"
        return `"${t.reference_id}","${new Date(t.created_at).toLocaleDateString("en-IN")}","${t.recipient_name}","${t.recipient_id}",${Math.abs(t.amount)},"${type}","${t.purpose}","${t.status}"`
      })
      .join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sbi_transactions_report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Tab 3: Beneficiary Processing ---

  const handleBeneSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors: { [key: string]: string } = {}
    if (!beneName.trim()) {
      errors.beneName = "Name is required"
    }

    if (beneType === "upi") {
      if (!beneAccountOrUpi.includes("@")) {
        errors.beneAccountOrUpi = "Please enter a valid UPI ID"
      }
    } else {
      if (beneAccountOrUpi.length < 9 || beneAccountOrUpi.length > 18) {
        errors.beneAccountOrUpi = "Account number must be 9-18 digits"
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
      if (!ifscRegex.test(beneIfsc)) {
        errors.beneIfsc = "IFSC code format is invalid"
      }
    }

    if (Object.keys(errors).length > 0) {
      setBeneErrors(errors)
      return
    }

    addBeneficiaryToDB({
      name: beneName,
      account_or_upi: beneAccountOrUpi,
      bank_name: beneType === "bank" ? beneBankName || "Other Bank" : null,
      ifsc: beneType === "bank" ? beneIfsc : null,
      type: beneType,
    })

    // Reset Form
    setBeneName("")
    setBeneAccountOrUpi("")
    setBeneIfsc("")
    setBeneBankName("")
    setBeneErrors({})
    alert("Beneficiary added successfully.")
  }

  const handleBeneIfscChange = (val: string) => {
    const upper = val.toUpperCase().slice(0, 11)
    setBeneIfsc(upper)

    if (upper.length >= 4) {
      const prefix = upper.slice(0, 4)
      if (IFSC_BANK_MAP[prefix]) {
        setBeneBankName(IFSC_BANK_MAP[prefix])
      } else {
        setBeneBankName("")
      }
    } else {
      setBeneBankName("")
    }
  }

  const filteredBeneficiaries = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(beneSearch.toLowerCase())
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">

        {/* Title Header */}
        <div className="mb-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Payments & Transfers
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Transfer funds securely via UPI, IMPS, or NEFT, configure Autopay rules, and manage your payee registry.
            </p>
          </div>

          <div className="flex h-3 border border-yellow-500/20 bg-amber-50/20 dark:bg-amber-950/10 rounded-full px-3 py-4 items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold self-start">
            <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
            SBI Secure Autopilot Shield Enabled
          </div>
        </div>

        {/* Quick Shortcuts Panel */}
        <div className="mb-6 overflow-x-auto pb-2 flex gap-3 scrollbar-thin scrollbar-none justify-start">
          <button
            onClick={() => {
              setTransferMode("bank")
              setAccountNo("30291920392")
              setConfirmAccountNo("30291920392")
              setIfscCode("SBIN0004012")
              setBankName("State Bank of India (SBI)")
              setHolderName("SBI Credit Card Services")
              setBankAmount("4500")
              setActiveTab("send")
            }}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 shrink-0 text-slate-700 dark:text-slate-300"
          >
            <CreditCard className="h-4 w-4 text-primary" />
            SBI Credit Card Bill
          </button>

          <button
            onClick={() => handleOpenAutopay("Mobile")}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 shrink-0 text-slate-700 dark:text-slate-300"
          >
            <Smartphone className="h-4 w-4 text-primary" />
            Mobile Recharge
          </button>

          <button
            onClick={() => handleOpenAutopay("Electricity")}
            className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 shrink-0 text-slate-700 dark:text-slate-300"
          >
            <Lightbulb className="h-4 w-4 text-primary" />
            Electricity Bill
          </button>

          <button
            onClick={() => navigate("/agent")}
            className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs font-bold hover:bg-primary/15 dark:bg-blue-950/20 dark:border-blue-900/40 shrink-0 text-primary dark:text-blue-400"
          >
            <MessageSquare className="h-4 w-4" />
            Talk to Companion about payments
          </button>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-xs uppercase font-extrabold tracking-wider mb-8">
          <button
            onClick={() => {
              setActiveTab("send")
              setPaymentSuccessData(null)
            }}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "send"
                ? "border-primary text-primary dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <Send className="h-4 w-4" />
            Send Money
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "history"
                ? "border-primary text-primary dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <History className="h-4 w-4" />
            Transaction History
          </button>

          <button
            onClick={() => setActiveTab("beneficiaries")}
            className={`pb-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === "beneficiaries"
                ? "border-primary text-primary dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <Users className="h-4 w-4" />
            Manage Beneficiaries
          </button>
        </div>

        {/* TAB 1: SEND MONEY */}
        {activeTab === "send" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Form Area */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left">

                {/* Mode Selector Segmented Control */}
                <div className="flex rounded-xl bg-slate-100 p-1 mb-6 dark:bg-slate-800 max-w-sm">
                  <button
                    type="button"
                    onClick={() => setTransferMode("upi")}
                    className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${transferMode === "upi"
                        ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                      }`}
                  >
                    UPI Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferMode("bank")}
                    className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${transferMode === "bank"
                        ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                      }`}
                  >
                    Bank Account Transfer
                  </button>
                </div>

                {/* Favorite Beneficiary Shortcut Selection */}
                <div className="mb-6">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Quick Pay Saved Beneficiary
                  </label>
                  <select
                    value={selectedBeneficiaryId}
                    onChange={(e) => handleSelectBeneficiary(e.target.value)}
                    className="block w-full sm:max-w-xs rounded-lg border border-slate-300 px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 dark:border-slate-750 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Select Beneficiary --</option>
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.type.toUpperCase()}: {b.account_or_upi.slice(0, 15)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* UPI Mode Form */}
                {transferMode === "upi" && (
                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Recipient UPI ID
                      </label>
                      <div className="flex gap-2 mt-1.5">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => handleUpiChange(e.target.value)}
                            placeholder="username@oksbi"
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleScanQrMock}
                          className="px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-750 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-xs font-bold"
                          title="Scan Merchant QR"
                        >
                          <QrCode className="h-4 w-4" />
                          Scan QR
                        </button>
                      </div>
                      {upiErrors.upiId && (
                        <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                          {upiErrors.upiId}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Transfer Amount
                      </label>
                      <div className="relative mt-1.5 rounded-lg shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-xs text-slate-400">₹</span>
                        </div>
                        <input
                          type="number"
                          value={upiAmount}
                          onChange={(e) => handleUpiAmountChange(e.target.value)}
                          placeholder="0.00"
                          className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-7 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                      </div>
                      {upiErrors.amount && (
                        <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                          {upiErrors.amount}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Transfer Purpose
                        </label>
                        <select
                          value={upiPurpose}
                          onChange={(e) => setUpiPurpose(e.target.value)}
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        >
                          <option value="Self Transfer">Self Transfer</option>
                          <option value="Family">Family</option>
                          <option value="Friend">Friend</option>
                          <option value="Bill Payment">Bill Payment</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={upiNote}
                          onChange={(e) => setUpiNote(e.target.value)}
                          placeholder="e.g. rent, groceries"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-6 rounded-xl bg-primary py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-primary/20"
                    >
                      Proceed to Pay
                    </button>
                  </form>
                )}

                {/* Bank Account Mode Form */}
                {transferMode === "bank" && (
                  <form onSubmit={handleBankSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Beneficiary Account Number
                        </label>
                        <input
                          type="text"
                          value={accountNo}
                          onChange={(e) => handleAccountNoChange(e.target.value)}
                          placeholder="e.g. 30847289192"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                        {bankErrors.accountNo && (
                          <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                            {bankErrors.accountNo}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Confirm Account Number
                        </label>
                        <input
                          type="text"
                          value={confirmAccountNo}
                          onChange={(e) => handleConfirmAccountNoChange(e.target.value)}
                          placeholder="Re-enter Account Number"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                        {bankErrors.confirmAccountNo && (
                          <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                            {bankErrors.confirmAccountNo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={ifscCode}
                          onChange={(e) => handleIfscChange(e.target.value)}
                          placeholder="e.g. SBIN0004012"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                        {bankErrors.ifscCode && (
                          <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                            {bankErrors.ifscCode}
                          </span>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Bank Name (Auto-filled)
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          disabled
                          placeholder="Autofills from IFSC"
                          className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={holderName}
                          onChange={(e) => {
                            setHolderName(e.target.value)
                            setBankErrors(prev => {
                              const copy = { ...prev }
                              delete copy.holderName
                              return copy
                            })
                          }}
                          placeholder="e.g. Ramesh Kumar"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                        {bankErrors.holderName && (
                          <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                            {bankErrors.holderName}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Amount (INR)
                        </label>
                        <div className="relative mt-1.5 rounded-lg shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-xs text-slate-400">₹</span>
                          </div>
                          <input
                            type="number"
                            value={bankAmount}
                            onChange={(e) => handleBankAmountChange(e.target.value)}
                            placeholder="0.00"
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50 pl-7 pr-3 py-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                          />
                        </div>
                        {bankErrors.amount && (
                          <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                            {bankErrors.amount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Transfer Mode
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="bankTransferType"
                            checked={bankTransferType === "imps"}
                            onChange={() => setBankTransferType("imps")}
                            disabled={parseFloat(bankAmount) >= 200000}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          IMPS (Instant)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="bankTransferType"
                            checked={bankTransferType === "neft"}
                            onChange={() => setBankTransferType("neft")}
                            disabled={parseFloat(bankAmount) >= 200000}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          NEFT (Batch)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name="bankTransferType"
                            checked={bankTransferType === "rtgs"}
                            onChange={() => setBankTransferType("rtgs")}
                            disabled={parseFloat(bankAmount) < 200000}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          RTGS (₹2 Lakhs+)
                        </label>
                      </div>
                      {bankErrors.bankTransferType && (
                        <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                          {bankErrors.bankTransferType}
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-6 rounded-xl bg-primary py-3.5 text-xs font-bold text-white hover:bg-blue-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-primary/20"
                    >
                      {selectedBeneficiaryId ? "Pay Saved Beneficiary" : "Add & Pay"}
                    </button>
                  </form>
                )}
              </div>

              {/* Secure banner & Autopilot Quick Info sidebar */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs text-slate-500 text-left leading-relaxed space-y-3">
                  <div className="flex items-center gap-1 text-slate-800 dark:text-slate-350 font-bold">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    Transaction Limits & Rules
                  </div>
                  <p>
                    - **UPI Limit**: Maximum ₹1,00,000 per transaction, 24-hour cooling limits apply for new beneficiary setups.
                  </p>
                  <p>
                    - **IMPS**: Instant funds settlement. Charge: ₹0.
                  </p>
                  <p>
                    - **NEFT**: Settles in half-hourly batches from 8 AM to 7 PM.
                  </p>
                  <p>
                    - **RTGS**: High value transfers starting at ₹2,00,000. Immediate real-time clearing.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/20 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 text-left space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-primary" />
                    Secure AutoPay setups
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                    Delegate your recurring utility bills, subscriptions, or credit card bills to the autopilot engine.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                    <button
                      onClick={() => handleOpenAutopay("Electricity")}
                      className="rounded-xl border border-slate-100 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850"
                    >
                      <Lightbulb className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                      Electricity
                    </button>
                    <button
                      onClick={() => handleOpenAutopay("Mobile Recharge")}
                      className="rounded-xl border border-slate-100 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850"
                    >
                      <Smartphone className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                      Mobile
                    </button>
                    <button
                      onClick={() => handleOpenAutopay("Internet Wifi")}
                      className="rounded-xl border border-slate-100 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850"
                    >
                      <Send className="h-4 w-4 mx-auto text-teal-500 mb-1" />
                      Internet
                    </button>
                    <button
                      onClick={() => handleOpenAutopay("OTT Subscriptions")}
                      className="rounded-xl border border-slate-100 p-2.5 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850"
                    >
                      <Play className="h-4 w-4 mx-auto text-rose-500 mb-1" />
                      OTT Video
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* UPI AutoPay Banner */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-amber-500/5 p-6 shadow-sm dark:border-blue-900/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  UPI AutoPay Smart Manager
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                  Configure limits, frequencies, and auto-settlements for your recurring bills. Companion monitors invoices and handles transaction authorizations automatically.
                </p>
              </div>
              <button
                onClick={() => handleOpenAutopay("All Utilities")}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-all shrink-0 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-primary/10"
              >
                Set Up AutoPay
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTION HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-6 text-left">

            {/* Filter Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Filter className="h-4 w-4" />
                  Filter Transactions
                </span>
                <button
                  onClick={handleExportCSV}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-850 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export as CSV
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                {/* Search */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Search Name / ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => {
                        setSearchFilter(e.target.value)
                        setCurrentPage(1)
                      }}
                      placeholder="e.g. Ramesh"
                      className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-xs text-slate-900 bg-slate-50 dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                    />
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Period Filter */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Select Period</label>
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-slate-50 dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                  >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="custom">All History</option>
                  </select>
                </div>

                {/* Credit/Debit Filter */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Transaction Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 bg-slate-50 dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                  >
                    <option value="all">All Transactions</option>
                    <option value="debit">Debits (Sent)</option>
                    <option value="credit">Credits (Received)</option>
                  </select>
                </div>

                {/* Amount Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Max Amount</label>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">₹{maxAmountRange.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="100000"
                    step="100"
                    value={maxAmountRange}
                    onChange={(e) => {
                      setMaxAmountRange(parseInt(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

              </div>
            </div>

            {/* Summary Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Sent</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                    ₹{totalSent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 dark:bg-rose-950/20">
                  <ChevronUp className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Received</span>
                  <span className="text-xl font-black text-green-600 dark:text-green-400 mt-1 block">
                    ₹{totalReceived.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-500 dark:bg-green-950/20">
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Transaction Count</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {filteredTransactions.length} Settlements
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 dark:bg-slate-850">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Transactions Table List */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="px-6 py-4">Transaction</th>
                      <th className="px-6 py-4">Purpose</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                    {paginatedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                          No matching transactions found.
                        </td>
                      </tr>
                    ) : (
                      paginatedTransactions.map((t) => {
                        const isDebit = t.amount < 0
                        const isExpanded = expandedTxnId === t.id

                        return (
                          <React.Fragment key={t.id}>
                            <tr
                              onClick={() => setExpandedTxnId(isExpanded ? null : t.id)}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 cursor-pointer transition-colors"
                            >
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDebit
                                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                                    : "bg-green-50 text-green-600 dark:bg-green-950/20"
                                  }`}>
                                  {t.recipient_name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <span className="block font-bold text-slate-950 dark:text-white">{t.recipient_name}</span>
                                  <span className="block text-[9px] text-slate-400 mt-0.5">{new Date(t.created_at).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                              </td>

                              <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">
                                {t.purpose}
                              </td>

                              <td className="px-6 py-4">
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${t.status === "success"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                  }`}>
                                  {t.status}
                                </span>
                              </td>

                              <td className={`px-6 py-4 text-right font-black text-sm ${isDebit ? "text-rose-600 dark:text-rose-400" : "text-green-600 dark:text-green-400"
                                }`}>
                                {isDebit ? "-" : "+"}₹{Math.abs(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>

                              <td className="px-6 py-4 text-center">
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                              </td>
                            </tr>

                            {/* Expanded Details Row */}
                            {isExpanded && (
                              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                                <td colSpan={5} className="px-6 py-4 border-t border-slate-100 dark:border-slate-850">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                    <div>
                                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Recipient Account/UPI</span>
                                      <span className="font-semibold text-slate-700 dark:text-slate-350">{t.recipient_id}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Transaction Reference ID</span>
                                      <span className="font-mono text-slate-700 dark:text-slate-350">{t.reference_id}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Transaction Note</span>
                                      <span className="font-medium text-slate-600 dark:text-slate-400 italic">"{t.note || 'None'}"</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="bg-slate-50 border-t border-slate-150 p-4 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">
                    Showing Page {currentPage} of {totalPages} ({filteredTransactions.length} items)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="rounded border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="rounded border border-slate-200 px-3 py-1.5 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-800"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 3: MANAGE BENEFICIARIES */}
        {activeTab === "beneficiaries" && (
          <div className="space-y-6 text-left">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Beneficiary List Side */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
                    Saved Beneficiaries Registry
                  </h3>

                  {/* Search bar */}
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      value={beneSearch}
                      onChange={(e) => setBeneSearch(e.target.value)}
                      placeholder="Search Payee Name..."
                      className="block w-full rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-xs text-slate-900 bg-white dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                    />
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Type</th>
                          <th className="px-6 py-4">Identifier / Bank Details</th>
                          <th className="px-6 py-4 text-center">Favourite</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                        {filteredBeneficiaries.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                              No saved beneficiaries found.
                            </td>
                          </tr>
                        ) : (
                          filteredBeneficiaries.map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                                  {b.name.slice(0, 2).toUpperCase()}
                                </div>
                                {b.name}
                              </td>

                              <td className="px-6 py-4">
                                <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${b.type === "upi"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                  }`}>
                                  {b.type}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span className="block font-medium text-slate-800 dark:text-slate-350">{b.account_or_upi}</span>
                                {b.type === "bank" && (
                                  <span className="block text-[10px] text-slate-400 mt-0.5">
                                    {b.bank_name} • IFSC: {b.ifsc}
                                  </span>
                                )}
                              </td>

                              <td className="px-6 py-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleBeneficiaryFavoriteInDB(b.id, b.is_favourite)}
                                  className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors ${b.is_favourite ? "text-amber-500" : "text-slate-300 hover:text-slate-400"
                                    }`}
                                >
                                  <Star className={`h-4.5 w-4.5 ${b.is_favourite ? "fill-amber-500" : ""}`} />
                                </button>
                              </td>

                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  onClick={() => setShowDeleteConfirmId(b.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Add Beneficiary Form Side */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 h-fit">
                <h3 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Plus className="h-4.5 w-4.5 text-primary" />
                  Add Beneficiary
                </h3>

                <form onSubmit={handleBeneSubmit} className="space-y-4">
                  {/* Type Selector */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBeneType("upi")
                        setBeneAccountOrUpi("")
                        setBeneErrors({})
                      }}
                      className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 ${beneType === "upi" ? "border-primary text-primary" : "border-transparent text-slate-400"
                        }`}
                    >
                      UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBeneType("bank")
                        setBeneAccountOrUpi("")
                        setBeneErrors({})
                      }}
                      className={`flex-1 text-center py-2 text-xs font-bold transition-all border-b-2 ${beneType === "bank" ? "border-primary text-primary" : "border-transparent text-slate-400"
                        }`}
                    >
                      Bank Account
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Beneficiary Name</label>
                    <input
                      type="text"
                      value={beneName}
                      onChange={(e) => {
                        setBeneName(e.target.value)
                        setBeneErrors(prev => {
                          const copy = { ...prev }
                          delete copy.beneName
                          return copy
                        })
                      }}
                      placeholder="e.g. Sunil Verma"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                    />
                    {beneErrors.beneName && (
                      <span className="text-[10px] text-rose-500 font-semibold block mt-1">{beneErrors.beneName}</span>
                    )}
                  </div>

                  {beneType === "upi" ? (
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">UPI ID</label>
                      <input
                        type="text"
                        value={beneAccountOrUpi}
                        onChange={(e) => {
                          setBeneAccountOrUpi(e.target.value)
                          if (e.target.value && !e.target.value.includes("@")) {
                            setBeneErrors(prev => ({ ...prev, beneAccountOrUpi: "UPI ID must contain '@'" }))
                          } else {
                            setBeneErrors(prev => {
                              const copy = { ...prev }
                              delete copy.beneAccountOrUpi
                              return copy
                            })
                          }
                        }}
                        placeholder="e.g. sunil@oksbi"
                        className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                      />
                      {beneErrors.beneAccountOrUpi && (
                        <span className="text-[10px] text-rose-500 font-semibold block mt-1">{beneErrors.beneAccountOrUpi}</span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Number</label>
                        <input
                          type="text"
                          value={beneAccountOrUpi}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "")
                            setBeneAccountOrUpi(val)
                            if (val && (val.length < 9 || val.length > 18)) {
                              setBeneErrors(prev => ({ ...prev, beneAccountOrUpi: "Account number must be 9-18 digits" }))
                            } else {
                              setBeneErrors(prev => {
                                const copy = { ...prev }
                                delete copy.beneAccountOrUpi
                                return copy
                              })
                            }
                          }}
                          placeholder="e.g. 30847289192"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                        {beneErrors.beneAccountOrUpi && (
                          <span className="text-[10px] text-rose-500 font-semibold block mt-1">{beneErrors.beneAccountOrUpi}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">IFSC Code</label>
                        <input
                          type="text"
                          value={beneIfsc}
                          onChange={(e) => handleBeneIfscChange(e.target.value)}
                          placeholder="e.g. SBIN0004012"
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-750 dark:bg-slate-850 dark:text-white"
                        />
                        {beneErrors.beneIfsc && (
                          <span className="text-[10px] text-rose-500 font-semibold block mt-1">{beneErrors.beneIfsc}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Bank Name (Auto-filled)</label>
                        <input
                          type="text"
                          value={beneBankName}
                          disabled
                          placeholder="Autofills from IFSC"
                          className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-550 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-450 cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-4 rounded-xl bg-primary py-3 text-xs font-bold text-white hover:bg-blue-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-500 shadow"
                  >
                    Save Beneficiary
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />

      {/* --- MOCK MODALS DIALOGS --- */}

      {/* 1. Camera QR Scanner Simulator Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-850 dark:bg-slate-900 text-center space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
              <QrCode className="h-5 w-5 text-primary" />
              Scan Merchant QR Code
            </h3>

            {/* Viewfinder simulation */}
            <div className="relative aspect-square w-full rounded-xl bg-slate-950 border-2 border-primary overflow-hidden flex flex-col items-center justify-center">
              {isScanning ? (
                <>
                  <div className="absolute inset-0 bg-slate-950 opacity-20"></div>
                  <Camera className="h-10 w-10 text-white/50 animate-pulse" />
                  <div className="absolute left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_10px_#22c55e] animate-[scan_2s_ease-in-out_infinite]"></div>
                  <span className="text-[10px] text-white/70 font-semibold absolute bottom-4">Checking QR alignment...</span>
                </>
              ) : (
                <div className="text-center text-green-500 text-xs font-bold space-y-2">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 animate-bounce" />
                  <span>QR Code Decoded!</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Align the QR code within the frame to authorize. Do not refresh or exit.
            </p>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full rounded-lg border border-slate-200 py-2.5 text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. Setup AutoPay Modal */}
      {showAutopayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-850 dark:bg-slate-900 text-left space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-5 w-5 text-primary animate-pulse" />
              Setup Autopay Rules - {autopayCategory}
            </h3>

            <form onSubmit={handleAutopaySetupSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Biller Provider</label>
                <select
                  value={autopayBiller}
                  onChange={(e) => {
                    setAutopayBiller(e.target.value)
                    setAutopayErrors(prev => {
                      const copy = { ...prev }
                      delete copy.biller
                      return copy
                    })
                  }}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white dark:border-slate-750 dark:bg-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Select Provider --</option>
                  {autopayCategory.includes("Electricity") && (
                    <>
                      <option value="MSEDCL Maharashtra">MSEDCL Maharashtra</option>
                      <option value="Adani Electricity">Adani Electricity</option>
                      <option value="Tata Power">Tata Power</option>
                    </>
                  )}
                  {autopayCategory.includes("Mobile") && (
                    <>
                      <option value="Reliance Jio Prepaid">Reliance Jio</option>
                      <option value="Bharti Airtel">Bharti Airtel</option>
                      <option value="Vodafone Idea (Vi)">Vodafone Idea (Vi)</option>
                    </>
                  )}
                  {autopayCategory.includes("Internet") && (
                    <>
                      <option value="JioFiber Broadband">JioFiber Broadband</option>
                      <option value="Airtel Xstream">Airtel Xstream Fiber</option>
                      <option value="Hathway Cable">Hathway Cable</option>
                    </>
                  )}
                  {autopayCategory.includes("OTT") && (
                    <>
                      <option value="Netflix India">Netflix India</option>
                      <option value="Amazon Prime Video">Amazon Prime Video</option>
                      <option value="Disney+ Hotstar">Disney+ Hotstar</option>
                    </>
                  )}
                  {!["Electricity", "Mobile", "Internet", "OTT"].some(c => autopayCategory.includes(c)) && (
                    <>
                      <option value="SBI Credit Cards Biller">SBI Credit Cards</option>
                      <option value="HDFC Bank Loan Services">HDFC Housing Loan EMI</option>
                      <option value="Other Utility merchant">Other Biller Merchant</option>
                    </>
                  )}
                </select>
                {autopayErrors.biller && (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{autopayErrors.biller}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {autopayCategory.includes("Mobile") ? "Registered Mobile Number" : "Biller Account / Consumer Number"}
                </label>
                <input
                  type="text"
                  value={autopayMobileOrAcc}
                  onChange={(e) => {
                    setAutopayMobileOrAcc(e.target.value)
                    setAutopayErrors(prev => {
                      const copy = { ...prev }
                      delete copy.mobileOrAcc
                      return copy
                    })
                  }}
                  placeholder={autopayCategory.includes("Mobile") ? "10-digit mobile" : "Consumer ID or account"}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white dark:border-slate-750 dark:bg-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                />
                {autopayErrors.mobileOrAcc && (
                  <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{autopayErrors.mobileOrAcc}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Maximum Limit (INR)</label>
                  <input
                    type="number"
                    value={autopayLimit}
                    onChange={(e) => {
                      setAutopayLimit(e.target.value)
                      setAutopayErrors(prev => {
                        const copy = { ...prev }
                        delete copy.limit
                        return copy
                      })
                    }}
                    placeholder="e.g. 5000"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white dark:border-slate-750 dark:bg-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  />
                  {autopayErrors.limit && (
                    <span className="text-[10px] text-rose-500 font-semibold mt-1 block">{autopayErrors.limit}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Billing Period</label>
                  <select
                    value={autopayFrequency}
                    onChange={(e) => setAutopayFrequency(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white dark:border-slate-750 dark:bg-slate-850 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-150 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAutopayModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Authorize AutoPay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Beneficiary Confirmation Dialog */}
      {showDeleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-850 dark:bg-slate-900 text-center space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-1">
              Confirm Deletion
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this beneficiary from your SBI registry? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirmId(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold hover:bg-slate-50 dark:border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteBeneficiaryFromDB(showDeleteConfirmId)
                  setShowDeleteConfirmId(null)
                }}
                className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Payment Confirmation / Success Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-850 dark:bg-slate-900 text-left space-y-4 overflow-hidden relative">

            {/* Loading Cover */}
            {paymentLoading && (
              <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 flex flex-col justify-center items-center z-20 space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <div className="text-center">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Authorizing Payment</h4>
                  <span className="text-[10px] text-slate-400">Communicating with payment gateway...</span>
                </div>
              </div>
            )}

            {/* Success Cover */}
            {paymentSuccessData && (
              <div className="absolute inset-0 bg-white dark:bg-slate-900 flex flex-col justify-between p-6 z-20">
                <div className="flex-1 flex flex-col justify-center items-center space-y-4 text-center">

                  {/* Green checkmark drawing animation */}
                  <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 dark:bg-green-950/20">
                    <Check className="h-8 w-8 stroke-[3]" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-950 dark:text-white">Transaction Successful</h4>
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider block mt-1">Verified Receipt Generated</span>
                  </div>

                  <div className="w-full border-t border-b border-slate-100 dark:border-slate-800 py-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-350">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recipient Name:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{paymentSuccessData.recipient_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paid Amount:</span>
                      <span className="font-extrabold text-slate-800 dark:text-white">₹{paymentSuccessData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reference Ref:</span>
                      <span className="font-mono">{paymentSuccessData.reference_id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false)
                      setPaymentSuccessData(null)
                      setConfirmDetails(null)
                    }}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Standard Confirmation Recaps */}
            {confirmDetails && (
              <>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1">
                  Confirm Transaction Details
                </h3>

                <div className="space-y-3 border-t border-b border-slate-150 py-3 dark:border-slate-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transfer Type:</span>
                    <span className="font-bold text-slate-800 dark:text-white uppercase">{confirmDetails.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient Name:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{confirmDetails.recipient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account / UPI:</span>
                    <span className="font-mono text-slate-800 dark:text-white">{confirmDetails.recipient_id}</span>
                  </div>
                  {confirmDetails.ifsc && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bank Details:</span>
                      <span className="text-slate-800 dark:text-white font-medium text-right">
                        {confirmDetails.bank_name} <br />
                        <span className="text-[10px] text-slate-400">IFSC: {confirmDetails.ifsc}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Purpose:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-350">{confirmDetails.purpose}</span>
                  </div>
                  {confirmDetails.note && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Note:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-450 italic">"{confirmDetails.note}"</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-2 text-sm">
                    <span className="text-slate-800 dark:text-slate-300 font-bold">Total Payable:</span>
                    <span className="text-primary dark:text-blue-400 font-black">₹{confirmDetails.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false)
                      setConfirmDetails(null)
                    }}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-bold hover:bg-slate-50 dark:border-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    Confirm & Pay
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
