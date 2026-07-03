import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ArrowRight, Bot, Shield, Zap, TrendingUp, CheckCircle } from "lucide-react"


export const LandingPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          {/* Subtle Background Gradients */}
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#1565C0] to-[#F9A825] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
              {/* Text Area */}
              <div className="lg:col-span-7 space-y-8 text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">
                  <Bot className="h-3.5 w-3.5" />
                  India's First Agentic AI Banking Companion
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white leading-[1.15]">
                  Your AI-Powered <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-primary via-blue-700 to-accent bg-clip-text text-transparent">
                    SBI Banking Companion
                  </span>
                </h1>
                <p className="text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-2xl">
                  Companion understands your finances, guides your decisions, and takes action for you. Save time, grow wealth, and protect your family with our 24/7 AI-driven assistance.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to={user ? "/dashboard" : "/signup"}
                    className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-blue-700 transition-all dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    {user ? "Go to Dashboard" : "Start Banking Smarter"}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Watch Demo
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    State Bank of India Sandbox Security
                  </div>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    256-bit AES Encryption
                  </div>
                </div>
              </div>

              {/* Chat Interface Mockup Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white/70 shadow-2xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/70 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-primary to-blue-800 p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1.5 shadow-sm">
                        <img
                          src="/logo.png"
                          alt="SBI Companion Logo"
                          className="h-7 w-7 object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-sm">SBI AI</h4>
                        <span className="text-[10px] text-blue-200 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Online & Ready to assist
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-accent/25 px-2 py-0.5 text-[9px] font-semibold text-accent uppercase tracking-wider">
                      Agentic AI
                    </span>
                  </div>

                  {/* Chat Body */}
                  <div className="p-4 space-y-4 text-left h-[340px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30">
                    {/* Bot Message */}
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                        S
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm text-xs text-slate-800 border border-slate-100 dark:bg-slate-850 dark:text-slate-200 dark:border-slate-800 leading-relaxed">
                        Namaste! I've analyzed your account. You have a surplus of <strong className="text-slate-950 dark:text-white font-semibold">₹15,000</strong> this month. Shall we allocate ₹5,000 to your recurring deposit and use the rest to pay your credit card bill?
                      </div>
                    </div>

                    {/* User Message */}
                    <div className="flex items-start justify-end gap-2.5">
                      <div className="rounded-2xl rounded-tr-none bg-primary p-3 shadow-sm text-xs text-white max-w-[80%] leading-relaxed">
                        Yes, go ahead and do that.
                      </div>
                    </div>

                    {/* Bot Message */}
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                        S
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-sm text-xs text-slate-800 border border-slate-100 dark:bg-slate-850 dark:text-slate-200 dark:border-slate-800 leading-relaxed">
                        Done! Initiated transfer of <strong className="text-slate-950 dark:text-white font-semibold">₹5,000</strong> to your SBI RD (A/C ...4921) and scheduled the card payment of <strong className="text-slate-950 dark:text-white font-semibold">₹10,000</strong> for June 20th. I've sent an OTP to your phone to confirm.
                      </div>
                    </div>
                  </div>

                  {/* Input Mock */}
                  <div className="p-3 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      placeholder="Ask Companion to analyze, transfer or invest..."
                      className="flex-1 rounded-full border border-slate-200 px-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 dark:border-slate-700 outline-none text-slate-450 cursor-not-allowed"
                    />
                    <button disabled className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white shrink-0 opacity-50 cursor-not-allowed">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Autopilot Banking, Tailored for You
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Companion goes beyond basic banking interfaces. It connects directly with advanced AI models to read, plan, and execute actions with your absolute consent.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Feature 1 */}
              <div className="flex flex-col items-start p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary dark:text-blue-400 mb-5">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Payments on Autopilot</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 text-left">
                  Never miss a bill. Companion schedules, pays, and optimizes utility and credit card bills, ensuring your balance is safely managed.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-start p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-600 dark:text-accent mb-5">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Smart Investment Nudges</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 text-left">
                  Put money to work. Get personalized triggers for SBI Mutual Funds, fixed deposits, and recurring deposits matched to your financial goals.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-start p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Insurance Coverage Gaps</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 text-left">
                  Protect what matters. Companion audits active life and health policies, spots gaps, and maps out optimal coverage plans using SBI General Insurance.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-start p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-5">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">24/7 Mobile Banking Agent</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 text-left">
                  Talk like a friend. Direct transactions, request history statements, and sort out support issues instantly using simple text or voice commands.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-slate-50/50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Three Steps to Intelligent Banking
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Setup takes under 2 minutes. Start talking to Companion immediately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector lines for desktop */}
              <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 -z-10"></div>

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-md border border-white dark:border-slate-950 ring-4 ring-blue-50 dark:ring-blue-900/20">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tell Companion your goals</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  Type or speak details like "I want to save ₹10,000 for a holiday next summer" or "Minimize my monthly bills".
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-md border border-white dark:border-slate-950 ring-4 ring-blue-50 dark:ring-blue-900/20">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Companion analyzes your profile</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  The companion aggregates balances, reviews transactions, and builds a customized action plan.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-accent text-slate-900 flex items-center justify-center font-bold text-2xl shadow-md border border-white dark:border-slate-950 ring-4 ring-yellow-50 dark:ring-yellow-900/20">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Take action with AI</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                  Verify transactions, confirm payments, or finalize investments securely inside the app using safe OTP auth.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Secured inside the SBI Sandbox
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              SBI Companion represents a next-generation banking assistant design. It integrates conversational SBI AIs securely with mock accounts. No funds are touched without your absolute explicit action, and the environment is isolated for safety.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-8 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-5 w-5 text-green-500" />
                RBI Sandbox compliant architecture
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Zero access to real-money wallets
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Multi-factor OTP confirmation
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
