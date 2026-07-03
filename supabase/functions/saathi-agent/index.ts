/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Gemini function declarations (tools)
const FUNCTION_DECLARATIONS = [
  {
    name: "get_account_balance",
    description: "Fetch the user's SBI account balance and recent mini-statement",
    parameters: {
      type: "object",
      properties: {
        account_type: {
          type: "string",
          enum: ["savings", "current", "fd", "all"],
          description: "The type of account to check"
        }
      },
      required: ["account_type"]
    }
  },
  {
    name: "initiate_payment",
    description: "Initiate a UPI or NEFT payment to a beneficiary",
    parameters: {
      type: "object",
      properties: {
        recipient_name: {
          type: "string",
          description: "The name of the payment recipient"
        },
        upi_id_or_account: {
          type: "string",
          description: "UPI ID or Bank Account Number of the recipient"
        },
        amount: {
          type: "number",
          description: "Amount to transfer in INR"
        },
        purpose: {
          type: "string",
          description: "Purpose of the transaction"
        },
        payment_mode: {
          type: "string",
          enum: ["UPI", "NEFT", "IMPS"],
          description: "Mode of payment transfer"
        }
      },
      required: ["recipient_name", "upi_id_or_account", "amount", "payment_mode"]
    }
  },
  {
    name: "get_investment_recommendations",
    description: "Get personalized SIP and mutual fund recommendations based on user profile",
    parameters: {
      type: "object",
      properties: {
        investment_goal: {
          type: "string",
          description: "Goal for the investment (e.g., Retirement, Wealth Creation, Tax Saving)"
        },
        monthly_amount: {
          type: "number",
          description: "Monthly SIP or lump sum amount user wants to invest in INR"
        },
        risk_appetite: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Risk appetite of the user"
        },
        tenure_years: {
          type: "number",
          description: "Investment horizon in years"
        }
      },
      required: ["investment_goal", "monthly_amount", "risk_appetite", "tenure_years"]
    }
  },
  {
    name: "check_insurance_coverage",
    description: "Analyze the user's insurance coverage and identify gaps",
    parameters: {
      type: "object",
      properties: {
        insurance_type: {
          type: "string",
          enum: ["life", "health", "vehicle", "all"],
          description: "Type of insurance to check"
        }
      },
      required: ["insurance_type"]
    }
  },
  {
    name: "calculate_emi",
    description: "Calculate EMI for a loan",
    parameters: {
      type: "object",
      properties: {
        loan_type: {
          type: "string",
          enum: ["home", "personal", "car", "education"],
          description: "Type of loan"
        },
        principal: {
          type: "number",
          description: "Loan principal amount"
        },
        interest_rate: {
          type: "number",
          description: "Annual interest rate in percentage (e.g. 8.5)"
        },
        tenure_months: {
          type: "number",
          description: "Loan tenure in months"
        }
      },
      required: ["loan_type", "principal", "interest_rate", "tenure_months"]
    }
  },
  {
    name: "get_spending_insights",
    description: "Analyze spending patterns and provide savings recommendations",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["this_month", "last_month", "last_3_months"],
          description: "Period of spending analysis"
        }
      },
      required: ["period"]
    }
  }
]

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { messages, user_profile } = await req.json()

    const name = user_profile?.name || "Valued Customer"
    const age = user_profile?.age || "N/A"
    const income_range = user_profile?.income_range || "N/A"
    const goals = user_profile?.goals ? JSON.stringify(user_profile.goals) : "Not specified"
    const existing_investments = user_profile?.existing_investments ? JSON.stringify(user_profile.existing_investments) : "None"
    const existing_insurance = user_profile?.existing_insurance ? JSON.stringify(user_profile.existing_insurance) : "None"
    const loans = user_profile?.loans ? JSON.stringify(user_profile.loans) : "None"
    const communication_style = user_profile?.communication_style || "Friendly and helpful"
    const preferred_language = user_profile?.preferred_language || "English"

    const systemInstruction = `You are Companion, an intelligent AI banking assistant for SBI (State Bank of India). 
You are warm, helpful, and deeply knowledgeable about Indian banking, UPI payments, 
mutual funds, SBI products, insurance, and personal finance.

User Profile:
- Name: ${name}, Age: ${age}, Income: ${income_range}
- Goals: ${goals}
- Existing investments: ${existing_investments}
- Existing insurance: ${existing_insurance}
- Loans: ${loans}
- Communication style preference: ${communication_style}
- Language preference: ${preferred_language}

Always personalize responses using this profile. If the user asks to DO something 
(pay, invest, check insurance, view balance), use the appropriate tool. 
Always explain what you're doing before using a tool. 
Keep responses concise. Use ₹ symbol for Indian rupees. 
Be proactive — after answering, suggest one related action they might want to take.`

    const apiKey = Deno.env.get("GEMINI_API_KEY") || ""
    const isPlaceholder = !apiKey || apiKey.startsWith("gemini-placeholder")

    if (isPlaceholder) {
      // Return a smart simulated response
      const simulatedResponse = simulateGeminiResponse(messages, name)
      return new Response(JSON.stringify(simulatedResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      })
    }

    // Call Gemini API
    const geminiModel = "gemini-2.5-flash"
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: formatMessagesForGemini(messages),
        tools: [{
          function_declarations: FUNCTION_DECLARATIONS
        }],
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.7,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Gemini API error:", errorText)
      throw new Error(`Gemini API error: ${response.statusText} (${errorText})`)
    }

    const geminiData = await response.json()

    // Transform Gemini response to our internal format (compatible with the client)
    const transformedData = transformGeminiResponse(geminiData)

    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    console.error("Edge function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    })
  }
})

// Format client messages array to Gemini's `contents` format
function formatMessagesForGemini(messages: any[]): any[] {
  return messages.map((msg) => {
    const role = msg.role === "assistant" ? "model" : "user"

    // If it's a simple text message
    if (typeof msg.content === "string") {
      return {
        role,
        parts: [{ text: msg.content }],
      }
    }

    // If the content is an array of blocks (tool_use / tool_result / text)
    if (Array.isArray(msg.content)) {
      const parts: any[] = []

      for (const block of msg.content) {
        if (block.type === "text" && block.text) {
          parts.push({ text: block.text })
        } else if (block.type === "tool_use") {
          // Assistant requesting a function call → Gemini functionCall part
          parts.push({
            functionCall: {
              name: block.name,
              args: block.input || {},
            }
          })
        } else if (block.type === "tool_result") {
          // User sending function result back → Gemini functionResponse part
          parts.push({
            functionResponse: {
              name: block.tool_use_id || "unknown_tool",
              response: {
                content: typeof block.content === "string" ? JSON.parse(block.content) : block.content
              }
            }
          })
        }
      }

      return { role, parts }
    }

    return { role, parts: [{ text: String(msg.content || "") }] }
  })
}

// Transform Gemini API response to our internal format (matching the structure the client expects)
function transformGeminiResponse(geminiData: any): any {
  const candidate = geminiData.candidates?.[0]
  if (!candidate) {
    return {
      id: "gemini_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "I'm sorry, I couldn't process that request. Please try again." }],
      model: "gemini-2.5-flash",
      stop_reason: "end_turn",
    }
  }

  const parts = candidate.content?.parts || []
  const contentBlocks: any[] = []
  let hasToolUse = false

  for (const part of parts) {
    if (part.text) {
      contentBlocks.push({ type: "text", text: part.text })
    } else if (part.functionCall) {
      hasToolUse = true
      contentBlocks.push({
        type: "tool_use",
        id: part.functionCall.name + "_" + Math.random().toString(36).substring(2),
        name: part.functionCall.name,
        input: part.functionCall.args || {},
      })
    }
  }

  return {
    id: "gemini_msg_" + Math.random().toString(36).substring(2),
    type: "message",
    role: "assistant",
    content: contentBlocks.length > 0 ? contentBlocks : [{ type: "text", text: "" }],
    model: "gemini-2.5-flash",
    stop_reason: hasToolUse ? "tool_use" : "end_turn",
  }
}

// Simulates Gemini responses (including tool_use blocks) based on keywords or tool results
function simulateGeminiResponse(messages: any[], userName: string): any {
  if (messages.length === 0) {
    return {
      id: "sim_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Namaste ${userName}! I am Companion, your SBI Banking Companion. How can I help you manage your finances today?`,
        },
      ],
      model: "gemini-2.5-flash",
      stop_reason: "end_turn",
    }
  }

  const lastMessage = messages[messages.length - 1]
  const content = lastMessage.content

  // Check if the last message was a tool result
  if (Array.isArray(content)) {
    const toolResultBlock = content.find((c) => c.type === "tool_result")
    if (toolResultBlock) {
      const toolName = toolResultBlock.tool_use_id // We map tool name to id in client side mock
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
        followUpText = `Here is your spending analysis for the requested period. Your highest outflow was in **Shopping** (41.2%), followed by **Food & Dining** (28.2%). I recommend setting a Shopping budget to save up to ₹3,200/month. You can review the categorized breakdown in the bar chart above.`
      }

      return {
        id: "sim_msg_" + Math.random().toString(36).substring(2),
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: followUpText }],
        model: "gemini-2.5-flash",
        stop_reason: "end_turn",
      }
    }
  }

  // Handle standard user text prompt
  const textPrompt = (typeof content === "string" ? content : content?.[0]?.text || "").toLowerCase()
  const msgId = "sim_tool_" + Math.random().toString(36).substring(2)

  // 1. Balance
  if (textPrompt.includes("balance") || textPrompt.includes("statement") || textPrompt.includes("savings") || textPrompt.includes("passbook")) {
    return {
      id: "sim_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Sure ${userName}, let me fetch your SBI account details and recent transaction history.`,
        },
        {
          type: "tool_use",
          id: "get_account_balance_" + msgId,
          name: "get_account_balance",
          input: { account_type: textPrompt.includes("current") ? "current" : "savings" },
        },
      ],
      model: "gemini-2.5-flash",
      stop_reason: "tool_use",
    }
  }

  // 2. Payments
  if (textPrompt.includes("send") || textPrompt.includes("pay") || textPrompt.includes("transfer") || textPrompt.includes("upi") || textPrompt.includes("send money")) {
    // Extract recipient name
    let recipient = "Ramesh Kumar"
    if (textPrompt.includes("to ")) {
      const match = textPrompt.match(/to\s+([a-zA-Z\s]+)/)
      if (match && match[1]) {
        recipient = match[1].trim().split(" ")[0]
        recipient = recipient.charAt(0).toUpperCase() + recipient.slice(1)
      }
    }
    // Extract amount
    let amount = 500
    const amountMatch = textPrompt.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:,\d+)*)/)
    if (amountMatch && amountMatch[1]) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ""))
    }

    return {
      id: "sim_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Sure, I can help you initiate a transfer of ₹${amount} to ${recipient}. I'll use the initiate_payment tool to verify the beneficiary and proceed.`,
        },
        {
          type: "tool_use",
          id: "initiate_payment_" + msgId,
          name: "initiate_payment",
          input: {
            recipient_name: recipient,
            upi_id_or_account: recipient.toLowerCase() + "@oksbi",
            amount: amount,
            purpose: "P2P Transfer",
            payment_mode: "UPI",
          },
        },
      ],
      model: "gemini-2.5-flash",
      stop_reason: "tool_use",
    }
  }

  // 3. Investments / SIP
  if (textPrompt.includes("invest") || textPrompt.includes("mutual fund") || textPrompt.includes("sip") || textPrompt.includes("investment") || textPrompt.includes("fund")) {
    return {
      id: "sim_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: `I'd be glad to help you with mutual fund recommendations. Let me fetch some highly-recommended SBI funds based on your profile.`,
        },
        {
          type: "tool_use",
          id: "get_investment_recommendations_" + msgId,
          name: "get_investment_recommendations",
          input: {
            investment_goal: "Wealth Creation",
            monthly_amount: 5000,
            risk_appetite: "medium",
            tenure_years: 5,
          },
        },
      ],
      model: "gemini-2.5-flash",
      stop_reason: "tool_use",
    }
  }

  // 4. Insurance
  if (textPrompt.includes("insurance") || textPrompt.includes("coverage") || textPrompt.includes("policy") || textPrompt.includes("health")) {
    return {
      id: "sim_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Let me check your existing insurance coverage and run a gap analysis for you.`,
        },
        {
          type: "tool_use",
          id: "check_insurance_coverage_" + msgId,
          name: "check_insurance_coverage",
          input: { insurance_type: "all" },
        },
      ],
      model: "gemini-2.5-flash",
      stop_reason: "tool_use",
    }
  }

  // 5. EMI Loan Calculator
  if (textPrompt.includes("emi") || textPrompt.includes("calculate") || textPrompt.includes("loan") || textPrompt.includes("mortgage")) {
    // Extract principal amount if any
    let principal = 1000000 // default 10 Lakhs
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
      id: "sim_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Sure, let me calculate the EMI breakdown for a loan of ₹${principal.toLocaleString("en-IN")}.`,
        },
        {
          type: "tool_use",
          id: "calculate_emi_" + msgId,
          name: "calculate_emi",
          input: {
            loan_type: textPrompt.includes("home") ? "home" : "personal",
            principal: principal,
            interest_rate: textPrompt.includes("home") ? 8.5 : 11.5,
            tenure_months: textPrompt.includes("home") ? 180 : 60,
          },
        },
      ],
      model: "gemini-2.5-flash",
      stop_reason: "tool_use",
    }
  }

  // 6. Spending insights
  if (textPrompt.includes("spending") || textPrompt.includes("insights") || textPrompt.includes("expense") || textPrompt.includes("chart") || textPrompt.includes("salary")) {
    return {
      id: "sim_msg_" + Math.random().toString(36).substring(2),
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Let me pull up your recent transactions and analyze your categorized monthly spending.`,
        },
        {
          type: "tool_use",
          id: "get_spending_insights_" + msgId,
          name: "get_spending_insights",
          input: { period: "this_month" },
        },
      ],
      model: "gemini-2.5-flash",
      stop_reason: "tool_use",
    }
  }

  // Default text response
  return {
    id: "sim_msg_" + Math.random().toString(36).substring(2),
    type: "message",
    role: "assistant",
    content: [
      {
        type: "text",
        text: `I understand! How can I assist you with SBI account services today? You can check your account balance, schedule UPI payments, request mutual fund SIP recommendations, run loan EMI calculations, or analyze your monthly spending insights.`,
      },
    ],
    model: "gemini-2.5-flash",
    stop_reason: "end_turn",
  }
}
