/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import {
  conversationsService,
  messagesService,
  type Conversation,
  type Message as DatabaseMessage,
} from "@/lib/supabase-service"
import { supabase } from "@/lib/supabase"
import { Navbar } from "@/components/Navbar"
import {
  Bot,
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  History,
  Mic,
  TrendingUp,
  Calculator,
  User,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Landmark,
} from "lucide-react"

// Recharts components
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
} from "recharts"

// DatabaseMessage and Conversation types imported from supabase-service

// Helper functions for random ID generation to prevent react-hooks/purity errors (impure function inside render body)
const generateMsgId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
}

const generateTxnRef = () => {
  return "TXN" + Math.floor(100000000000 + Math.random() * 900000000000)
}

const generateSimToolId = () => {
  return "sim_tool_" + Math.random().toString(36).substring(2, 10)
}

const generateQuoteId = (prefix: string) => {
  return prefix + Math.floor(100000 + Math.random() * 900000)
}

export const AgentPage: React.FC = () => {
  const { user, profile, addActivity } = useAuth()
  const location = useLocation()

  // State Management
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<DatabaseMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [loadingToolName, setLoadingToolName] = useState<string | null>(null)

  // Simulated Interactive Action States
  const [investedFunds, setInvestedFunds] = useState<{ [key: string]: boolean }>({})
  const [investmentLoading, setInvestmentLoading] = useState<{ [key: string]: boolean }>({})
  const [insuranceQuotes, setInsuranceQuotes] = useState<{ [key: string]: { premium: number; cover: number; name: string; id: string } }>({})
  const [insuranceLoading, setInsuranceLoading] = useState<{ [key: string]: boolean }>({})
  const [purchasedPolicies, setPurchasedPolicies] = useState<{ [key: string]: boolean }>({})
  const [policyLoading, setPolicyLoading] = useState<{ [key: string]: boolean }>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, loadingToolName])

  // Textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputText])

  // --- Supabase Data Layer ---

  const handleNewConversation = async () => {
    if (!user?.id) return
    try {
      const data = await conversationsService.create(user.id, "New Conversation")
      setConversations(prev => [data, ...prev])
      setActiveConversationId(data.id)
    } catch (err) {
      console.error("Failed to create conversation:", err)
    }
  }

  const loadConversations = async () => {
    if (!user?.id) return
    try {
      const data = await conversationsService.list(user.id)
      setConversations(data)
      if (data.length > 0) {
        setActiveConversationId(data[0].id)
      } else {
        handleNewConversation()
      }
    } catch (err) {
      console.error("Failed to load conversations:", err)
    }
  }

  const updateConversationTitleInDB = async (convId: string, text: string) => {
    const cleanTitle = text.slice(0, 50) + (text.length > 50 ? "..." : "")
    try {
      const updated = await conversationsService.updateTitle(convId, cleanTitle)
      setConversations(prev => prev.map(c => c.id === convId ? updated : c))
    } catch (err) {
      console.error("DB title update failed:", err)
    }
  }

  const saveMessage = async (convId: string, role: "user" | "assistant", content: string, toolUses: any[] = []): Promise<DatabaseMessage> => {
    try {
      const data = await messagesService.add({
        conversation_id: convId,
        role,
        content,
        tool_uses: toolUses,
      })
      return data
    } catch (err) {
      console.error("Failed to save message:", err)
      // Return a temporary local message on failure
      return {
        id: generateMsgId(),
        conversation_id: convId,
        role,
        content,
        tool_uses: toolUses,
        created_at: new Date().toISOString()
      }
    }
  }

  const loadMessages = async (convId: string) => {
    try {
      const data = await messagesService.list(convId)
      if (data.length === 0) {
        const welcomeContent = "Namaste! I am Companion, your SBI Banking Companion. How can I help you manage your finances today?"
        const welcomeMsg = await saveMessage(convId, "assistant", welcomeContent, [])
        setMessages([welcomeMsg])
      } else {
        setMessages(data)
      }
    } catch (err) {
      console.error("Failed to load messages:", err)
      setMessages([])
    }
  }

  // Load conversations on mount
  useEffect(() => {
    if (user?.id) {
      loadConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId)
    } else {
      setMessages([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId])

  // Prefill message if passed from other page routes
  useEffect(() => {
    if (activeConversationId && (location.state as { prefilledMessage?: string } | null)?.prefilledMessage) {
      setInputText((location.state as { prefilledMessage: string }).prefilledMessage)
      window.history.replaceState({}, document.title)
    }
  }, [activeConversationId, location])

  // Delete Conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user?.id) return
    try {
      await conversationsService.delete(convId)
      const updated = conversations.filter(c => c.id !== convId)
      setConversations(updated)
      if (activeConversationId === convId) {
        setActiveConversationId(updated.length > 0 ? updated[0].id : null)
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err)
    }
  }

  // --- API Execution & Client Tool Handling ---

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault()
    const textToSend = customText || inputText
    if (!textToSend.trim() || !activeConversationId) return

    // Clear input
    setInputText("")
    setIsTyping(true)

    // 1. Save user text message to state and database
    const userMsg = await saveMessage(activeConversationId, "user", textToSend, [])
    setMessages(prev => [...prev, userMsg])

    // If first user message, update title
    const userMessagesCount = messages.filter(m => m.role === "user").length
    if (userMessagesCount === 0) {
      updateConversationTitleInDB(activeConversationId, textToSend)
    }

    // Connect user query to agent activity tracker
    addActivity("agent", `Interacted with Companion: "${textToSend.slice(0, 40)}${textToSend.length > 40 ? '...' : ''}"`)

    // 2. Begin Edge Function Invocation Loop
    await invokeAgent(activeConversationId, [...messages, userMsg])
  }

  const invokeAgent = async (convId: string, currentHistory: DatabaseMessage[]) => {
    try {
      // Format history array specifically for Gemini compatibility
      const apiMessages = currentHistory.map(m => {
        const toolUsesArray = Array.isArray(m.tool_uses) ? (m.tool_uses as any[]) : []
        if (toolUsesArray.length > 0) {
          if (m.role === "assistant") {
            const content = []
            if (m.content) content.push({ type: "text", text: m.content })
            toolUsesArray.forEach(tu => {
              if (tu.type === "tool_use") content.push(tu)
            })
            return { role: "assistant", content }
          } else if (m.role === "user") {
            return { role: "user", content: toolUsesArray }
          }
        }
        return { role: m.role, content: m.content }
      })

      // Call Supabase Edge Function
      let data: any
      try {
        const { data: responseData, error } = await supabase.functions.invoke("saathi-agent", {
          body: {
            messages: apiMessages,
            user_profile: profile,
            conversation_id: convId,
          }
        })

        if (error) throw error
        data = responseData
      } catch (err) {
        console.warn("Supabase Edge Function unavailable, running fallback simulation locally:", err)
        data = simulateLocalGemini(apiMessages)
      }

      if (data && data.content) {
        // Parse Gemini's response blocks
        const textBlock = data.content.find((b: any) => b.type === "text")
        const toolUseBlock = data.content.find((b: any) => b.type === "tool_use")
        const assistantText = textBlock ? textBlock.text : ""
        const toolUses = toolUseBlock ? [toolUseBlock] : []

        // Save assistant response
        const assistantMsg = await saveMessage(convId, "assistant", assistantText, toolUses)
        setMessages(prev => [...prev, assistantMsg])

        if (toolUseBlock) {
          // Trigger tool use visualization and execution
          await executeToolFlow(convId, assistantMsg, toolUseBlock)
        } else {
          setIsTyping(false)
        }
      } else {
        setIsTyping(false)
      }
    } catch (error) {
      console.error("Agent error:", error)
      setIsTyping(false)
    }
  }

  const executeToolFlow = async (convId: string, assistantMsg: DatabaseMessage, toolUseBlock: any) => {
    const { name, input, id } = toolUseBlock
    setLoadingToolName(name)
    setIsTyping(false)

    // Simulate database lookup/computation delay (1.5s)
    await new Promise(resolve => setTimeout(resolve, 1500))

    let resultData: any = {}

    // Mock Tool Generators
    switch (name) {
      case "get_account_balance": {
        const balance = input.account_type === "current" ? 412500.00 : input.account_type === "fd" ? 250000.00 : 184320.00
        resultData = {
          account_type: input.account_type,
          balance: balance,
          currency: "INR",
          mini_statement: [
            { date: "2026-06-15", desc: "UPI/Salary/SBI", amount: 85000.00, type: "credit" },
            { date: "2026-06-14", desc: "UPI/Amazon Pay/Shopping", amount: 1249.00, type: "debit" },
            { date: "2026-06-12", desc: "Cash Deposit/Branch", amount: 10000.00, type: "credit" },
            { date: "2026-06-10", desc: "UPI/JioFiber Bill", amount: 943.00, type: "debit" }
          ]
        }
        await addActivity("agent", `Checked ${input.account_type} account balance`)
        break
      }

      case "initiate_payment":
        resultData = {
          recipient_name: input.recipient_name,
          upi_id_or_account: input.upi_id_or_account,
          amount: input.amount,
          payment_mode: input.payment_mode,
          reference_number: generateTxnRef(),
          status: "Success",
          timestamp: new Date().toISOString()
        }
        await addActivity("payment", `Paid ₹${input.amount} to ${input.recipient_name} via ${input.payment_mode}`, input.amount)
        break

      case "get_investment_recommendations":
        resultData = {
          investment_goal: input.investment_goal,
          monthly_amount: input.monthly_amount,
          risk_appetite: input.risk_appetite,
          funds: [
            { name: "SBI Bluechip Fund", category: "Large Cap Equity", returns: { "1y": "16.2%", "3y": "14.8%", "5y": "15.4%" }, risk: "Medium-High", expense_ratio: "0.85%" },
            { name: "SBI Equity Hybrid Fund", category: "Hybrid/Balanced", returns: { "1y": "12.8%", "3y": "11.5%", "5y": "13.8%" }, risk: "Medium", expense_ratio: "0.78%" },
            { name: "SBI Small Cap Fund", category: "Small Cap Equity", returns: { "1y": "26.4%", "3y": "21.2%", "5y": "22.1%" }, risk: "High", expense_ratio: "0.95%" }
          ]
        }
        await addActivity("agent", `Requested mutual fund recommendations for ${input.investment_goal}`)
        break

      case "check_insurance_coverage":
        resultData = {
          insurance_type: input.insurance_type,
          gaps: [
            { type: "Health Insurance", current: 300000, recommended: 10000000, gap: 9700000, status: "Underinsured", badge: "Critical Gap" },
            { type: "Life Insurance", current: 1500000, recommended: 15000000, gap: 13500000, status: "Underinsured", badge: "High Gap" },
            { type: "Vehicle Insurance", current: 400000, recommended: 400000, gap: 0, status: "Adequate", badge: "Protected" }
          ]
        }
        await addActivity("agent", `Checked ${input.insurance_type} insurance coverage gaps`)
        break

      case "calculate_emi": {
        const p = input.principal
        const r = (input.interest_rate / 12) / 100
        const n = input.tenure_months
        const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
        const totalPayment = emi * n
        const totalInterest = totalPayment - p

        resultData = {
          loan_type: input.loan_type,
          principal: p,
          interest_rate: input.interest_rate,
          tenure_months: n,
          emi: Math.round(emi),
          total_interest: Math.round(totalInterest),
          total_payment: Math.round(totalPayment),
          chart_data: [
            { name: "Principal", value: p },
            { name: "Interest", value: Math.round(totalInterest) }
          ]
        }
        await addActivity("agent", `Calculated EMI for ₹${p.toLocaleString()} ${input.loan_type} loan`)
        break
      }

      case "get_spending_insights":
        resultData = {
          period: input.period,
          chart_data: [
            { category: "Food & Dining", amount: 12450 },
            { category: "Shopping", amount: 18200 },
            { category: "Utilities", amount: 6800 },
            { category: "Travel", amount: 9150 },
            { category: "Others", amount: 4500 }
          ],
          total_spending: 51100,
          savings_recommendation: "You spent 25% more on Shopping this month. Setting a budget of ₹15,000 could save you ₹3,200."
        }
        await addActivity("agent", `Fetched spending insights for ${input.period}`)
        break
    }

    setLoadingToolName(null)
    setIsTyping(true)

    // Save the tool_result as a system message to history
    const toolResultMsg = await saveMessage(convId, "user", "", [
      {
        type: "tool_result",
        tool_use_id: id,
        content: JSON.stringify(resultData)
      }
    ])

    const updatedHistory = [...messages, assistantMsg, toolResultMsg]
    setMessages(updatedHistory)

    // Re-invoke agent with the tool results so Gemini can comment
    await invokeAgent(convId, updatedHistory)
  }

  // Client local Simulation fallback
  const simulateLocalGemini = (messagesList: any[]): any => {
    const name = profile?.name || "Customer"

    // Call the exact same logic we wrote for the edge function
    // We import/copy it locally for Deno and Node/Browser compatibility
    if (messagesList.length === 0) {
      return {
        content: [{ type: "text", text: `Namaste ${name}! I am Companion, your SBI Banking Companion. How can I help you manage your finances today?` }]
      }
    }

    const lastMessage = messagesList[messagesList.length - 1]
    const content = lastMessage.content

    // Check for tool results
    if (Array.isArray(content)) {
      const toolResultBlock = content.find((c) => c.type === "tool_result")
      if (toolResultBlock) {
        const toolName = toolResultBlock.tool_use_id
        const resultData = JSON.parse(toolResultBlock.content)

        let followUpText = ""
        if (toolName.includes("get_account_balance")) {
          followUpText = `I have successfully retrieved your SBI account balance. Your Savings account currently holds ₹1,84,320.00. I have rendered your full mini-statement above. Would you like me to analyze your monthly spending next?`
        } else if (toolName.includes("initiate_payment")) {
          followUpText = `The payment of ₹${resultData.amount} to **${resultData.recipient_name}** has been successfully initiated via ${resultData.payment_mode}. The Transaction Reference is **${resultData.reference_number}**. I've added this payment to your recent activities. What else can I do for you?`
        } else if (toolName.includes("get_investment_recommendations")) {
          followUpText = `Here are the top-rated SBI mutual fund recommendations based on your goal of **${resultData.investment_goal}**. You can see the details and historical returns in the cards above. Feel free to click "Invest Now" to start a SIP!`
        } else if (toolName.includes("check_insurance_coverage")) {
          followUpText = `I have completed the gap analysis of your insurance policies. You are currently under-insured in key areas like Health and Life insurance. You can review the details and recommended coverage amounts above, and click "Get Quote" to proceed.`
        } else if (toolName.includes("calculate_emi")) {
          followUpText = `For a principal of ₹${resultData.principal.toLocaleString("en-IN")} at an interest rate of ${resultData.interest_rate}%, the monthly EMI comes to **₹${Math.round(resultData.emi).toLocaleString("en-IN")}**. The total payment over the tenure is ₹${Math.round(resultData.total_payment).toLocaleString("en-IN")}. I have plotted the principal vs interest breakdown chart above.`
        } else if (toolName.includes("get_spending_insights")) {
          followUpText = `Here is your spending analysis for the requested period. Your highest outflow was in **Shopping** (35.6%), followed by **Food & Dining** (24.3%). I recommend setting a Shopping budget to save up to ₹3,200/month. You can review the categorized breakdown in the bar chart above.`
        }

        return {
          content: [{ type: "text", text: followUpText }]
        }
      }
    }

    const textPrompt = (typeof content === "string" ? content : content?.[0]?.text || "").toLowerCase()
    const msgId = generateSimToolId()

    if (textPrompt.includes("balance") || textPrompt.includes("statement") || textPrompt.includes("savings") || textPrompt.includes("passbook")) {
      return {
        content: [
          { type: "text", text: `Sure ${name}, let me fetch your SBI account details and recent transaction history.` },
          {
            type: "tool_use",
            id: "get_account_balance_" + msgId,
            name: "get_account_balance",
            input: { account_type: textPrompt.includes("current") ? "current" : "savings" }
          }
        ]
      }
    }

    if (textPrompt.includes("send") || textPrompt.includes("pay") || textPrompt.includes("transfer") || textPrompt.includes("upi") || textPrompt.includes("send money")) {
      let recipient = "Ramesh Kumar"
      if (textPrompt.includes("to ")) {
        const match = textPrompt.match(/to\s+([a-zA-Z\s]+)/)
        if (match && match[1]) {
          recipient = match[1].trim().split(" ")[0]
          recipient = recipient.charAt(0).toUpperCase() + recipient.slice(1)
        }
      }
      let amount = 500
      const amountMatch = textPrompt.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:,\d+)*)/)
      if (amountMatch && amountMatch[1]) {
        amount = parseFloat(amountMatch[1].replace(/,/g, ""))
      }

      return {
        content: [
          { type: "text", text: `Sure, I can help you initiate a transfer of ₹${amount} to ${recipient}. I'll use the initiate_payment tool to verify the beneficiary and proceed.` },
          {
            type: "tool_use",
            id: "initiate_payment_" + msgId,
            name: "initiate_payment",
            input: {
              recipient_name: recipient,
              upi_id_or_account: recipient.toLowerCase() + "@oksbi",
              amount: amount,
              purpose: "P2P Transfer",
              payment_mode: "UPI"
            }
          }
        ]
      }
    }

    if (textPrompt.includes("invest") || textPrompt.includes("mutual fund") || textPrompt.includes("sip") || textPrompt.includes("investment") || textPrompt.includes("fund")) {
      return {
        content: [
          { type: "text", text: `I'd be glad to help you with mutual fund recommendations. Let me fetch some highly-recommended SBI funds based on your profile.` },
          {
            type: "tool_use",
            id: "get_investment_recommendations_" + msgId,
            name: "get_investment_recommendations",
            input: {
              investment_goal: "Wealth Creation",
              monthly_amount: 5000,
              risk_appetite: "medium",
              tenure_years: 5
            }
          }
        ]
      }
    }

    if (textPrompt.includes("insurance") || textPrompt.includes("coverage") || textPrompt.includes("policy") || textPrompt.includes("health")) {
      return {
        content: [
          { type: "text", text: `Let me check your existing insurance coverage and run a gap analysis for you.` },
          {
            type: "tool_use",
            id: "check_insurance_coverage_" + msgId,
            name: "check_insurance_coverage",
            input: { insurance_type: "all" }
          }
        ]
      }
    }

    if (textPrompt.includes("emi") || textPrompt.includes("calculate") || textPrompt.includes("loan") || textPrompt.includes("mortgage")) {
      let principal = 1000000
      const principalMatch = textPrompt.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:,\d+)*(?:\s*lakhs?|\s*l)?)/)
      if (principalMatch && principalMatch[1]) {
        const rawText = principalMatch[1].toLowerCase()
        if (rawText.includes("lakh")) {
          const val = parseFloat(rawText.replace(/[^0-9.]/g, ""))
          principal = val * 100000
        } else {
          principal = parseFloat(rawText.replace(/,/g, ""))
        }
      }

      return {
        content: [
          { type: "text", text: `Sure, let me calculate the EMI breakdown for a loan of ₹${principal.toLocaleString("en-IN")}.` },
          {
            type: "tool_use",
            id: "calculate_emi_" + msgId,
            name: "calculate_emi",
            input: {
              loan_type: textPrompt.includes("home") ? "home" : "personal",
              principal: principal,
              interest_rate: textPrompt.includes("home") ? 8.5 : 11.5,
              tenure_months: textPrompt.includes("home") ? 180 : 60
            }
          }
        ]
      }
    }

    if (textPrompt.includes("spending") || textPrompt.includes("insights") || textPrompt.includes("expense") || textPrompt.includes("chart") || textPrompt.includes("salary")) {
      return {
        content: [
          { type: "text", text: `Let me pull up your recent transactions and analyze your categorized monthly spending.` },
          {
            type: "tool_use",
            id: "get_spending_insights_" + msgId,
            name: "get_spending_insights",
            input: { period: "this_month" }
          }
        ]
      }
    }

    return {
      content: [{ type: "text", text: `I understand! How can I assist you with SBI account services today? You can check your account balance, schedule UPI payments, request mutual fund SIP recommendations, run loan EMI calculations, or analyze your monthly spending insights.` }]
    }
  }

  // --- Suggestion Chips Handler ---

  const getSuggestionChips = () => {
    if (messages.length <= 1) {
      return ["Check my balance", "How can I start investing?", "Do I have enough insurance?", "Help me send money"]
    }
    const lastMsg = messages[messages.length - 1]
    const text = (lastMsg.content || "").toLowerCase()

    if (text.includes("balance") || text.includes("statement")) {
      return ["Show spending insights", "Send ₹500 to Ramesh", "Calculate home loan EMI"]
    }
    if (text.includes("invest") || text.includes("fund") || text.includes("sip")) {
      return ["How to start SIP", "Check tax savings", "Check my balance"]
    }
    if (text.includes("insurance") || text.includes("under-insured") || text.includes("coverage")) {
      return ["Get health quote", "What is life cover gap?", "Check my balance"]
    }
    if (text.includes("emi") || text.includes("loan") || text.includes("principal")) {
      return ["Calculate Car Loan EMI", "Compare Home Loans", "View mini-statement"]
    }
    if (text.includes("spending") || text.includes("insights") || text.includes("shopping")) {
      return ["Get budgeting tips", "Invest surplus money", "Check my balance"]
    }

    return ["Check my balance", "How can I start investing?", "Do I have enough insurance?", "Help me send money"]
  }

  // --- Simulated Interactive Tool Actions ---

  const handleSimulateSIP = async (fundName: string, monthlyAmount: number) => {
    setInvestmentLoading(prev => ({ ...prev, [fundName]: true }))
    await new Promise(resolve => setTimeout(resolve, 1500))
    setInvestmentLoading(prev => ({ ...prev, [fundName]: false }))
    setInvestedFunds(prev => ({ ...prev, [fundName]: true }))

    // Save to activities database
    await addActivity("investment", `Started SIP of ₹${monthlyAmount.toLocaleString("en-IN")}/month in ${fundName}`, monthlyAmount)
  }

  const handleGetInsuranceQuote = async (type: string) => {
    setInsuranceLoading(prev => ({ ...prev, [type]: true }))
    await new Promise(resolve => setTimeout(resolve, 1200))
    setInsuranceLoading(prev => ({ ...prev, [type]: false }))

    let quoteDetails: { premium: number; cover: number; name: string; id: string }
    if (type.includes("Health")) {
      quoteDetails = { premium: 1240, cover: 10000000, name: "SBI Arogya Plus health policy", id: generateQuoteId("HLTH-") }
    } else {
      quoteDetails = { premium: 950, cover: 15000000, name: "SBI eShield Next life policy", id: generateQuoteId("LIFE-") }
    }

    setInsuranceQuotes(prev => ({ ...prev, [type]: quoteDetails }))
    await addActivity("agent", `Generated quote for ${type} plan`)
  }

  const handleBuyPolicy = async (type: string, policyName: string, premium: number) => {
    setPolicyLoading(prev => ({ ...prev, [type]: true }))
    await new Promise(resolve => setTimeout(resolve, 1500))
    setPolicyLoading(prev => ({ ...prev, [type]: false }))
    setPurchasedPolicies(prev => ({ ...prev, [type]: true }))

    // Add activity of type insurance
    await addActivity("insurance", `Purchased insurance policy: ${policyName} (Premium: ₹${premium}/month)`, premium)
  }

  // --- Rendering Functions for Tool Result Cards ---

  const renderToolCard = (toolUseId: string, result: any) => {
    const isBalance = toolUseId.includes("get_account_balance")
    const isPayment = toolUseId.includes("initiate_payment")
    const isInvestment = toolUseId.includes("get_investment_recommendations")
    const isInsurance = toolUseId.includes("check_insurance_coverage")
    const isEMI = toolUseId.includes("calculate_emi")
    const isSpending = toolUseId.includes("get_spending_insights")

    // 1. Balance Card
    if (isBalance) {
      return (
        <div className="w-full max-w-2xl rounded-2xl border border-slate-150 bg-gradient-to-br from-white to-slate-50 p-5 shadow-md dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-blue-400 flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5" />
              SBI Account Balance
            </span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              Account: {result.account_type.toUpperCase()} (...8824)
            </span>
          </div>

          <div className="mb-5">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              ₹{result.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400 font-semibold block mt-1">
              Active & Verified • No pending holds
            </span>
          </div>

          <div>
            <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Recent Mini-Statement
            </h5>
            <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.mini_statement.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <td className="px-3 py-2 text-slate-400">{item.date}</td>
                      <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-350">{item.desc}</td>
                      <td className={`px-3 py-2 text-right font-bold ${item.type === "credit" ? "text-green-600 dark:text-green-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {item.type === "credit" ? "+" : "-"}₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }

    // 2. Payment Card
    if (isPayment) {
      return (
        <div className="w-full max-w-md rounded-2xl border border-green-200 bg-gradient-to-br from-white to-green-50/10 p-5 shadow-md dark:border-green-900/30 dark:from-slate-900 dark:to-green-950/10 text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Transfer Confirmation
            </span>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[9px] font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
              {result.status}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Recipient Name</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">{result.recipient_name}</span>
              <span className="text-xs text-slate-500 block">{result.upi_id_or_account}</span>
            </div>

            <div className="flex justify-between border-t border-b border-slate-100 dark:border-slate-800 py-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Amount</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">₹{result.amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Mode</span>
                <span className="text-xs font-extrabold rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-850 dark:text-slate-350">{result.payment_mode}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <div>
                <span>Txn ID: </span>
                <span className="font-mono text-slate-600 dark:text-slate-350">{result.reference_number}</span>
              </div>
              <span>{new Date(result.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>
      )
    }

    // 3. Investment Card
    if (isInvestment) {
      return (
        <div className="w-full max-w-3xl rounded-2xl border border-slate-150 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 text-left">
          <div className="flex items-center gap-1.5 mb-4">
            <TrendingUp className="h-4 w-4 text-primary dark:text-blue-400" />
            <h4 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
              SBI Mutual Fund Recommendations
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Recommendations tailored for monthly savings of **₹{result.monthly_amount.toLocaleString("en-IN")}** with a **{result.risk_appetite}** risk tolerance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.funds.map((fund: any, idx: number) => {
              const isInvested = investedFunds[fund.name]
              const isLoading = investmentLoading[fund.name]
              return (
                <div key={idx} className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850 hover:shadow-md transition-all">
                  <div className="space-y-2.5">
                    <div>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary dark:bg-blue-900/40 dark:text-blue-300">
                        {fund.category}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 leading-tight">{fund.name}</h5>
                    </div>

                    <div className="grid grid-cols-3 gap-1 border-t border-b border-slate-100 dark:border-slate-800 py-2 text-center">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase">1Y</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{fund.returns["1y"]}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase">3Y</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350">{fund.returns["3y"]}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase">5Y</span>
                        <span className="text-[10px] font-extrabold text-green-600 dark:text-green-400">{fund.returns["5y"]}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[9px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Risk Profile:</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{fund.risk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expense Ratio:</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{fund.expense_ratio}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSimulateSIP(fund.name, result.monthly_amount)}
                    disabled={isInvested || isLoading}
                    className={`mt-4 w-full rounded-lg py-2 text-[10px] font-bold tracking-wide transition-all flex items-center justify-center gap-1 ${isInvested
                      ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 cursor-default"
                      : "bg-primary text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50"
                      }`}
                  >
                    {isLoading ? (
                      <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></div>
                    ) : isInvested ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        SIP Active
                      </>
                    ) : (
                      "Invest Now"
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // 4. Insurance Card
    if (isInsurance) {
      return (
        <div className="w-full max-w-2xl rounded-2xl border border-slate-150 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 text-left">
          <div className="flex items-center gap-1.5 mb-4">
            <ShieldCheck className="h-4.5 w-4.5 text-primary dark:text-blue-400" />
            <h4 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
              Insurance Coverage & Gaps Analysis
            </h4>
          </div>

          <div className="space-y-3.5">
            {result.gaps.map((item: any, idx: number) => {
              const hasGap = item.gap > 0
              const quote = insuranceQuotes[item.type]
              const isQuoteLoading = insuranceLoading[item.type]
              const isPurchased = purchasedPolicies[item.type]
              const isPurchaseLoading = policyLoading[item.type]

              return (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.type}</h5>
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${hasGap
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                          }`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 space-x-3">
                        <span>Current Cover: ₹{item.current.toLocaleString("en-IN")}</span>
                        <span>•</span>
                        <span>Recommended: ₹{item.recommended.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {hasGap && !quote && !isPurchased && (
                      <button
                        onClick={() => handleGetInsuranceQuote(item.type)}
                        disabled={isQuoteLoading}
                        className="self-start sm:self-center shrink-0 rounded bg-rose-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-rose-500 transition-all disabled:opacity-50"
                      >
                        {isQuoteLoading ? "Checking..." : "Get Quote"}
                      </button>
                    )}
                  </div>

                  {/* Render simulated quote if available */}
                  {quote && !isPurchased && (
                    <div className="mt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-primary/20">
                      <div>
                        <span className="text-[8px] text-primary dark:text-blue-400 font-bold block uppercase">Recommended Product</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{quote.name}</span>
                        <span className="text-[10px] text-slate-400">Sum Insured: ₹{quote.cover.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[8px] text-slate-400 uppercase block">Estimated Premium</span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">₹{quote.premium}/month</span>
                        </div>
                        <button
                          onClick={() => handleBuyPolicy(item.type, quote.name, quote.premium)}
                          disabled={isPurchaseLoading}
                          className="rounded bg-primary px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 transition-all disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                          {isPurchaseLoading ? "Purchasing..." : "Purchase Now"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render purchased success state */}
                  {isPurchased && (
                    <div className="mt-3.5 border-t border-slate-200/60 dark:border-slate-800/80 pt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-bold">Policy purchased successfully! Check your dashboard for document details.</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // 5. EMI Card
    if (isEMI) {
      const pieData = result.chart_data

      return (
        <div className="w-full max-w-xl rounded-2xl border border-slate-150 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 text-left">
          <div className="flex items-center gap-1.5 mb-4">
            <Calculator className="h-4 w-4 text-primary dark:text-blue-400" />
            <h4 className="text-sm font-extrabold text-slate-950 dark:text-white uppercase tracking-wider">
              Loan EMI Breakdown
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left Metrics */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Monthly EMI</span>
                <span className="text-3xl font-extrabold text-slate-950 dark:text-white">
                  ₹{result.emi.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] border-t border-slate-100 dark:border-slate-850 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Amount:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">₹{result.principal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rate of Interest:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{result.interest_rate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loan Tenure:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{result.tenure_months} months ({result.tenure_months / 12} Yrs)</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-1.5">
                  <span className="text-slate-400">Total Interest Payable:</span>
                  <span className="font-bold text-amber-500">₹{result.total_interest.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 font-bold">
                  <span className="text-slate-800 dark:text-slate-300">Total Amount:</span>
                  <span className="text-slate-900 dark:text-white">₹{result.total_payment.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Right Chart */}
            <div className="h-48 w-full flex flex-col justify-center items-center">
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#00549c" />
                    <Cell fill="#f4a900" />
                  </Pie>
                  <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-[10px] font-bold mt-1">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  Principal
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Interest
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // 6. Spending insights Card
    if (isSpending) {
      const chartData = result.chart_data

      return (
        <div className="w-full max-w-xl rounded-2xl border border-slate-150 bg-white p-5 shadow-md dark:border-slate-800 dark:bg-slate-900 text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-blue-400 flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Monthly Spending Insights
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              {result.period.replace("_", " ")}
            </span>
          </div>

          <div className="mb-4">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ₹{result.total_spending.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-400 block uppercase mt-0.5">Total Outflow</span>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="h-52 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" width={90} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`} />
                <Bar dataKey="amount" fill="#00549c" radius={[0, 4, 4, 0]} barSize={12}>
                  {chartData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? "#f4a900" : "#00549c"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tip Box */}
          <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 p-3.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <h6 className="font-extrabold mb-0.5">Budgeting Recommendation</h6>
              <p className="opacity-90">{result.savings_recommendation}</p>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Side Panel - Conversation History (Hidden on mobile) */}
        <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full z-10 hidden md:flex">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-4 w-4" />
              Chat History
            </h3>
            <button
              onClick={handleNewConversation}
              className="rounded-lg p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-primary dark:bg-slate-850 dark:text-slate-350 dark:hover:bg-slate-800 dark:hover:text-blue-400 border border-slate-100 dark:border-slate-800 transition-all"
              title="New Conversation"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No chats found
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConversationId === conv.id
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`group w-full text-left rounded-xl px-3.5 py-3 text-xs cursor-pointer transition-all flex items-center justify-between gap-2 border ${isActive
                      ? "bg-primary/5 border-primary/20 text-primary dark:bg-blue-950/20 dark:border-blue-800/40 dark:text-blue-400 font-semibold"
                      : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-450 dark:hover:bg-slate-850"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? "text-primary dark:text-blue-400" : "text-slate-400"}`} />
                      <div className="truncate text-[11px]">
                        <span className="block font-bold truncate">{conv.title}</span>
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                          {new Date(conv.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded p-1 transition-opacity text-slate-400 hover:text-rose-600"
                      title="Delete chat"
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* Right Chat Interface */}
        <main className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">

          {/* Chat Header */}
          <div className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-sm shadow-primary/20">
                <Bot className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  Companion Companion
                  <span className="flex h-2 w-2 rounded-full bg-green-500" title="Online"></span>
                </h4>
                <span className="text-[10px] text-slate-400">SBI's secure conversational assistant</span>
              </div>
            </div>

            {/* Mobile New Conversation Button */}
            <button
              onClick={handleNewConversation}
              className="md:hidden flex items-center gap-1 rounded-lg px-2.5 py-1.5 bg-primary text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              New Chat
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user"
              const toolUses = msg.tool_uses as any[] | null

              // Handle tool result rendering
              if (isUser && toolUses && toolUses.length > 0) {
                return (
                  <div key={msg.id} className="flex justify-center w-full my-4">
                    {toolUses.map((tu: any, idx: number) => {
                      if (tu.type === "tool_result") {
                        try {
                          const result = JSON.parse(tu.content)
                          return <div key={idx} className="w-full flex justify-center">{renderToolCard(tu.tool_use_id, result)}</div>
                        } catch {
                          return null
                        }
                      }
                      return null
                    })}
                  </div>
                )
              }

              // Handle regular text message bubble
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-black shadow-sm shadow-primary/20">
                      S
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed max-w-[80%] shadow-sm border ${isUser
                      ? "bg-primary text-white border-transparent rounded-tr-none text-left"
                      : "bg-white border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 rounded-tl-none text-left"
                      }`}
                  >
                    {msg.content}

                    {/* Render tool_use tag if agent is starting a tool */}
                    {msg.tool_uses && (Array.isArray(msg.tool_uses) ? (msg.tool_uses as any[]) : []).length > 0 && (
                      <div className="mt-2 text-[9px] text-slate-400 italic">
                        ⚙️ Initiating: {(msg.tool_uses as any[]).map(tu => tu.name).join(", ")}
                      </div>
                    )}

                    <span
                      className={`block text-[9px] mt-1.5 text-right ${isUser ? "text-blue-100" : "text-slate-400"
                        }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Simulated Tool loading state */}
            {loadingToolName && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                  S
                </div>
                <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-850 dark:bg-slate-900 flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border border-primary border-t-transparent dark:border-blue-400"></div>
                  <span className="text-xs text-slate-500 font-bold dark:text-slate-400">
                    Companion is accessing {loadingToolName.replace("_", " ")}...
                  </span>
                </div>
              </div>
            )}

            {/* Standard Typing Indicator */}
            {isTyping && !loadingToolName && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-black">
                  S
                </div>
                <div className="rounded-2xl rounded-tl-none bg-white border border-slate-200 p-3 shadow-sm dark:bg-slate-900 dark:border-slate-850">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-2">

            {/* Quick Contextual Suggestions Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full justify-start text-left">
              {getSuggestionChips().map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(undefined, chip)}
                  disabled={isTyping || loadingToolName !== null}
                  className="shrink-0 rounded-full border border-slate-200 px-3.5 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-primary dark:border-slate-800 dark:bg-slate-850 dark:text-slate-350 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar Form */}
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <div className="flex-1 relative flex items-center">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask Companion to check balance, transfer funds or recommend SIPs..."
                  rows={1}
                  className="w-full rounded-xl border border-slate-300 pl-4 pr-10 py-3 text-xs bg-white dark:bg-slate-850 dark:border-slate-750 outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white resize-none max-h-32 min-h-[42px]"
                />

                {/* Simulated Microphone button */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800"
                    title="Voice search coming soon"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-850 text-white text-[9px] font-bold py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow dark:bg-slate-800">
                    Voice coming soon
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping || loadingToolName !== null}
                className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-primary/15"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
