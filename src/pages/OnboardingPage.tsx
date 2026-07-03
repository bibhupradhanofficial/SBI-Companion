import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/context/AuthContext"
import { Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"


export const OnboardingPage: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [showConfetti, setShowConfetti] = useState(false)

  // Step 1: Tell us about yourself
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [incomeRange, setIncomeRange] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [city, setCity] = useState("")
  const [stateName, setStateName] = useState("")

  // Pre-fill Name from user meta
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.user_metadata.full_name)
    }
  }, [user])

  // Step 2: Your banking goals (Multi-select)
  const goalOptions = [
    { id: "save", label: "Save money regularly" },
    { id: "invest", label: "Invest for wealth creation" },
    { id: "insurance", label: "Get insurance coverage" },
    { id: "payments", label: "Simplify daily payments" },
    { id: "retirement", label: "Plan for retirement" },
    { id: "home_vehicle", label: "Buy a home or vehicle" },
    { id: "education", label: "Children's education planning" },
  ]
  const [goals, setGoals] = useState<string[]>([])

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    )
  }

  // Step 3: Current financial snapshot
  const [monthlySavings, setMonthlySavings] = useState("")
  const [investments, setInvestments] = useState<string[]>([])
  const [insurance, setInsurance] = useState<string[]>([])
  const [loans, setLoans] = useState<string[]>([])
  const [creditScore, setCreditScore] = useState("")
  const [hasCreditCard, setHasCreditCard] = useState<string>("")
  const [existingCreditCard, setExistingCreditCard] = useState<string>("")

  const toggleInvestment = (item: string) => {
    if (item === "None") {
      setInvestments(["None"])
      return
    }
    setInvestments((prev) => {
      const filtered = prev.filter((i) => i !== "None")
      return filtered.includes(item) ? filtered.filter((i) => i !== item) : [...filtered, item]
    })
  }

  const toggleInsurance = (item: string) => {
    if (item === "None") {
      setInsurance(["None"])
      return
    }
    setInsurance((prev) => {
      const filtered = prev.filter((i) => i !== "None")
      return filtered.includes(item) ? filtered.filter((i) => i !== item) : [...filtered, item]
    })
  }

  const toggleLoan = (item: string) => {
    if (item === "None") {
      setLoans(["None"])
      return
    }
    setLoans((prev) => {
      const filtered = prev.filter((i) => i !== "None")
      return filtered.includes(item) ? filtered.filter((i) => i !== item) : [...filtered, item]
    })
  }

  // Step 4: Digital banking comfort
  const [bankingApps, setBankingApps] = useState<string[]>([])
  const [paymentFrequency, setPaymentFrequency] = useState("")
  const [bankingWorry, setBankingWorry] = useState("")

  const toggleBankingApp = (app: string) => {
    setBankingApps((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    )
  }

  // Step 5: Set up your Companion
  const [communicationStyle, setCommunicationStyle] = useState("")
  const [preferredLanguage, setPreferredLanguage] = useState("")
  const [nudgesEnabled, setNudgesEnabled] = useState(true)

  // Confetti trigger
  useEffect(() => {
    if (showConfetti) {
      const canvas = document.getElementById("confetti-canvas") as HTMLCanvasElement
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const resizeCanvas = () => {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
      }
      resizeCanvas()

      const colors = ["#1565C0", "#F9A825", "#10B981", "#EF4444", "#8B5CF6"]
      const particles = Array.from({ length: 120 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 3 + 4,
        tilt: Math.random() * 10 - 5,
        tiltAngle: 0,
        tiltAngleInc: Math.random() * 0.05 + 0.02,
      }))

      let animationFrameId: number

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        let hasActiveParticles = false

        particles.forEach((p) => {
          p.y += p.vy
          p.x += p.vx
          p.tiltAngle += p.tiltAngleInc
          p.tilt = Math.sin(p.tiltAngle) * 8

          if (p.y < canvas.height + 20) {
            hasActiveParticles = true
          }

          ctx.beginPath()
          ctx.lineWidth = p.r * 2
          ctx.strokeStyle = p.color
          ctx.moveTo(p.x + p.tilt + p.r, p.y)
          ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r)
          ctx.stroke()
        })

        if (hasActiveParticles) {
          animationFrameId = requestAnimationFrame(draw)
        }
      }

      draw()
      return () => cancelAnimationFrame(animationFrameId)
    }
  }, [showConfetti])

  // Validation checks for Next button
  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!(name.trim() && age && Number(age) > 0 && incomeRange && employmentType && city.trim() && stateName.trim())
      case 2:
        return goals.length >= 1
      case 3:
        const isCardValid = hasCreditCard === "no" || (hasCreditCard === "yes" && existingCreditCard !== "");
        return !!(monthlySavings && Number(monthlySavings) >= 0 && investments.length >= 1 && insurance.length >= 1 && loans.length >= 1 && creditScore && isCardValid)
      case 4:
        return !!(bankingApps.length >= 1 && paymentFrequency && bankingWorry)
      case 5:
        return !!(communicationStyle && preferredLanguage)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!isStepValid()) return
    if (step < 5) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  const handleCompleteSetup = async () => {
    if (!isStepValid()) return

    const profilePayload = {
      name,
      age: parseInt(age),
      income_range: incomeRange,
      employment_type: employmentType,
      city,
      state: stateName,
      goals,
      monthly_savings: parseFloat(monthlySavings),
      existing_investments: investments,
      existing_insurance: insurance,
      loans,
      credit_score_range: creditScore,
      has_credit_card: hasCreditCard === "yes",
      existing_credit_card: hasCreditCard === "yes" ? existingCreditCard : null,
      banking_apps: bankingApps,
      payment_frequency: paymentFrequency,
      banking_worry: bankingWorry,
      communication_style: communicationStyle,
      preferred_language: preferredLanguage,
      nudges_enabled: nudgesEnabled,
      onboarding_complete: true,
    }

    const { error } = await updateProfile(profilePayload)
    if (error) {
      alert("Failed to save profile. " + error.message)
      return
    }

    // Trigger confetti animation before navigating
    setShowConfetti(true)
    setTimeout(() => {
      navigate("/dashboard")
    }, 2500)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <Navbar />

      {/* Confetti overlay */}
      {showConfetti && (
        <canvas id="confetti-canvas" className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" />
      )}

      {/* Add inline styles for slide-in transitions */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(15px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .step-transition {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-xl rounded-2xl dark:bg-slate-900 dark:border-slate-800 p-8">
          {/* Progress Header */}
          <div className="mb-8 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-450 uppercase tracking-wider">
              <span>Setup Progress</span>
              <span className="text-primary dark:text-blue-400">Step {step} of 5</span>
            </div>
            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary dark:bg-blue-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content Steps */}
          <div className="step-transition text-left min-h-[360px] flex flex-col justify-between">
            {/* STEP 1: About Yourself */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tell us about yourself</h2>
                  <p className="text-sm text-slate-500 mt-1">Provide your basic profile details for personalized banking.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    />
                  </div>

                  {/* Age Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 28"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    />
                  </div>

                  {/* Monthly Income Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Income Range</label>
                    <select
                      value={incomeRange}
                      onChange={(e) => setIncomeRange(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="">Select Range</option>
                      <option value="<25k">&lt; ₹25,000</option>
                      <option value="25k–50k">₹25,000 – ₹50,000</option>
                      <option value="50k–1L">₹50,000 – ₹1,00,000</option>
                      <option value="1L–5L">₹1,00,000 – ₹5,00,000</option>
                      <option value="5L+">₹5,00,000+</option>
                    </select>
                  </div>

                  {/* Employment Type Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="">Select Employment</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Self-employed">Self-employed</option>
                      <option value="Business Owner">Business Owner</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>

                  {/* City Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    />
                  </div>

                  {/* State Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">State</label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Banking Goals */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your banking goals</h2>
                  <p className="text-sm text-slate-500 mt-1">Select the primary milestones you'd like Companion to assist with (select at least one).</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goalOptions.map((goal) => {
                    const isChecked = goals.includes(goal.id)
                    return (
                      <div
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all hover:bg-slate-50/50 dark:hover:bg-slate-850/50 ${isChecked ? "border-primary bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/15" : "border-slate-200 dark:border-slate-850"}`}
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{goal.label}</span>
                        <div className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 ${isChecked ? "bg-primary border-primary text-white dark:bg-blue-600 dark:border-blue-600" : "border-slate-300 dark:border-slate-700"}`}>
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Current Snapshot */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Current financial snapshot</h2>
                  <p className="text-sm text-slate-500 mt-1">Help Companion understand your assets, insurance policies, and liabilities.</p>
                </div>

                <div className="space-y-4">
                  {/* Savings Input */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Average Monthly Savings (INR)</label>
                    <input
                      type="number"
                      value={monthlySavings}
                      onChange={(e) => setMonthlySavings(e.target.value)}
                      placeholder="e.g. 15000"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    />
                  </div>

                  {/* Credit Score Range Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Credit Score Range</label>
                    <select
                      value={creditScore}
                      onChange={(e) => setCreditScore(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-55 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="">Select Credit Score</option>
                      <option value="Poor">Poor (&lt; 600)</option>
                      <option value="Fair">Fair (600 – 700)</option>
                      <option value="Good">Good (700 – 750)</option>
                      <option value="Excellent">Excellent (750+)</option>
                    </select>
                  </div>

                  {/* Credit Card Ownership Question */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Do you own a Credit Card?</label>
                      <div className="grid grid-cols-2 gap-3 mt-1.5 font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setHasCreditCard("yes")
                            setExistingCreditCard("")
                          }}
                          className={`py-2 text-center rounded-lg border text-xs cursor-pointer transition-colors ${hasCreditCard === "yes"
                              ? "border-primary bg-blue-50/40 text-primary font-bold dark:border-blue-500 dark:bg-blue-950/20"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-slate-300"
                            }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHasCreditCard("no")
                            setExistingCreditCard("")
                          }}
                          className={`py-2 text-center rounded-lg border text-xs cursor-pointer transition-colors ${hasCreditCard === "no"
                              ? "border-primary bg-blue-50/40 text-primary font-bold dark:border-blue-500 dark:bg-blue-950/20"
                              : "border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850 dark:text-slate-300"
                            }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {hasCreditCard === "yes" && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Select Your Credit Card</label>
                        <select
                          value={existingCreditCard}
                          onChange={(e) => setExistingCreditCard(e.target.value)}
                          className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white font-semibold"
                        >
                          <option value="">Choose Card</option>
                          <option value="simplyclick">SimplyClick SBI Card</option>
                          <option value="simplysave">SimplySAVE SBI Card</option>
                          <option value="prime">SBI Card Prime</option>
                          <option value="elite">SBI Card ELITE</option>
                          <option value="pulse">SBI Card Pulse</option>
                          <option value="airindia">Air India SBI Signature</option>
                          <option value="other">Other Bank Credit Card</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Multi Select grids */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Investments */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-2">Existing Investments</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["FD", "Mutual Funds", "Stocks", "Gold", "PPF", "None"].map((item) => {
                          const isSelected = investments.includes(item)
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleInvestment(item)}
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all border ${isSelected ? "bg-primary text-white border-primary dark:bg-blue-600 dark:border-blue-600" : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100"}`}
                            >
                              {item}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Insurance */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-2">Existing Insurance</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Life", "Health", "Vehicle", "None"].map((item) => {
                          const isSelected = insurance.includes(item)
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleInsurance(item)}
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all border ${isSelected ? "bg-primary text-white border-primary dark:bg-blue-600 dark:border-blue-600" : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100"}`}
                            >
                              {item}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Loans */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-2">Outstanding Loans</label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Home Loan", "Personal Loan", "Car Loan", "Education Loan", "None"].map((item) => {
                          const isSelected = loans.includes(item)
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleLoan(item)}
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all border ${isSelected ? "bg-primary text-white border-primary dark:bg-blue-600 dark:border-blue-600" : "bg-slate-50 dark:bg-slate-850 border-slate-205 dark:border-slate-800 text-slate-600 hover:bg-slate-100"}`}
                            >
                              {item}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Digital Banking Comfort */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Digital banking comfort</h2>
                  <p className="text-sm text-slate-500 mt-1">Customize Companion's features to fit your favorite digital tools.</p>
                </div>

                <div className="space-y-4">
                  {/* Banking Apps */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Current Banking Apps Used</label>
                    <div className="flex flex-wrap gap-2">
                      {["SBI YONO", "BHIM UPI", "GPay", "PhonePe", "Other"].map((app) => {
                        const isSelected = bankingApps.includes(app)
                        return (
                          <button
                            type="button"
                            key={app}
                            onClick={() => toggleBankingApp(app)}
                            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all border ${isSelected ? "bg-primary text-white border-primary dark:bg-blue-600 dark:border-blue-600 shadow-sm" : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 hover:bg-slate-100"}`}
                          >
                            {app}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Payment Frequency */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Frequency of Digital Payments</label>
                    <select
                      value={paymentFrequency}
                      onChange={(e) => setPaymentFrequency(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="">Select Frequency</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Rarely">Rarely</option>
                    </select>
                  </div>

                  {/* Biggest Worry */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Biggest Worry About Digital Banking</label>
                    <select
                      value={bankingWorry}
                      onChange={(e) => setBankingWorry(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="">Select Biggest Worry</option>
                      <option value="Security">Security (Fears of scams/hacks)</option>
                      <option value="Complexity">Complexity (Hard to use UI)</option>
                      <option value="Trust">Trust (Fear of transactions failing)</option>
                      <option value="Technical issues">Technical issues (Server errors)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Set up your Companion */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Set up your Companion</h2>
                  <p className="text-sm text-slate-500 mt-1">Configure communication style and review profile summary.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Comm Style Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Companion Voice Style</label>
                    <select
                      value={communicationStyle}
                      onChange={(e) => setCommunicationStyle(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="">Select Style</option>
                      <option value="Formal & Professional">Formal & Professional</option>
                      <option value="Friendly & Conversational">Friendly & Conversational</option>
                      <option value="Brief & Direct">Brief & Direct</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Language</label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs text-slate-900 focus:bg-white outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white"
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Hinglish">Hinglish</option>
                    </select>
                  </div>

                  {/* Proactive Nudges Toggle */}
                  <div className="flex flex-col justify-end">
                    <div className="flex items-center gap-3 mt-4 md:mt-0 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                      <input
                        type="checkbox"
                        id="nudges"
                        checked={nudgesEnabled}
                        onChange={(e) => setNudgesEnabled(e.target.checked)}
                        className="h-5 w-5 accent-primary cursor-pointer"
                      />
                      <label htmlFor="nudges" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Enable Proactive Nudges
                      </label>
                    </div>
                  </div>
                </div>

                {/* Review summary card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-3">Review Profile Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                    <div>
                      <span className="text-slate-555 block font-medium">Name & Age</span>
                      <span className="font-bold mt-0.5 block">{name}, {age}</span>
                    </div>
                    <div>
                      <span className="text-slate-555 block font-medium">Location</span>
                      <span className="font-bold mt-0.5 block">{city}, {stateName}</span>
                    </div>
                    <div>
                      <span className="text-slate-555 block font-medium">Monthly Savings</span>
                      <span className="font-bold mt-0.5 block">₹{Number(monthlySavings).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-555 block font-medium">Credit Score</span>
                      <span className="font-bold mt-0.5 block text-primary dark:text-blue-400">{creditScore}</span>
                    </div>
                    <div>
                      <span className="text-slate-555 block font-medium">Credit Card</span>
                      <span className="font-bold mt-0.5 block text-primary dark:text-blue-400 capitalize">
                        {hasCreditCard === "yes" ? (existingCreditCard === "other" ? "Other Bank" : existingCreditCard) : "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleCompleteSetup}
                  disabled={!isStepValid()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
