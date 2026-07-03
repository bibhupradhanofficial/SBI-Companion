import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { KeyRound, Mail, AlertCircle, CheckCircle } from "lucide-react"


export const LoginPage: React.FC = () => {
  const { signIn, resetPassword, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "forgot">("login")

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!email || !password) {
      setError("Please fill in all fields.")
      setLoading(false)
      return
    }

    const { error: signInErr } = await signIn(email, password)
    if (signInErr) {
      setError(signInErr.message || "Failed to sign in. Please check your credentials.")
    } else {
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    }
    setLoading(false)
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    if (!email) {
      setError("Please enter your email address.")
      setLoading(false)
      return
    }

    const redirectTo = `${window.location.origin}/profile`
    const { error: resetErr } = await resetPassword(email, redirectTo)
    if (resetErr) {
      setError(resetErr.message || "Failed to send password reset email.")
    } else {
      setSuccessMessage("Password reset link sent! Please check your email to update your password.")
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#1565C0] to-[#F9A825] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
      </div>

      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="SBI Companion Logo"
              className="h-12 w-12 object-contain"
            />
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              SBI <span className="text-primary dark:text-blue-400">Companion</span>
            </span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {mode === "login" ? "Welcome Back" : "Reset Password"}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {mode === "login"
              ? "Sign in to chat with your AI Banking Companion"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {mode === "login" ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Alert */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700 dark:text-red-400 font-medium text-left">
                    {error}
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 text-left">
                  Email Address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 text-left">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot")
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className="text-xs font-semibold text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 outline-none cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-primary py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
              {/* Error Alert */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-700 dark:text-red-400 font-medium text-left">
                    {error}
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium text-left">
                    {successMessage}
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 text-left">
                  Email Address
                </label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-850 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500 outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-lg bg-primary py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login")
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="text-sm font-semibold text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 outline-none cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          New to SBI Companion?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
