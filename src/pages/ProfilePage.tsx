import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  QrCode,
  ShieldAlert,
  CheckCircle
} from "lucide-react"

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()

  // 1. Personal Information Form State
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [pan, setPan] = useState("ABCDE1234F") // Mock PAN
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [personalLoading, setPersonalLoading] = useState(false)
  const [personalSuccess, setPersonalSuccess] = useState(false)
  const [avatarSimulated, setAvatarSimulated] = useState<string | null>(null)

  // 3. App Preferences State
  const [commStyle, setCommStyle] = useState("Brief & Direct")
  const [lang, setLang] = useState("English")
  const [nudges, setNudges] = useState(true)
  const [prefLoading, setPrefLoading] = useState(false)

  // 4. Security: Change Password State
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState("")
  const [passSuccess, setPassSuccess] = useState(false)

  // Security: 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false)
  const [twoFactorOtp, setTwoFactorOtp] = useState("")
  const [twoFactorError, setTwoFactorError] = useState("")

  // Security: Active Sessions State
  const [sessionList, setSessionList] = useState<any[]>([])

  // 5. Danger Zone State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load Initial Data
  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setPhone(profile.phone || "")
      setDob(profile.dob || "")
      setPan(profile.pan || "ABCDE1234F")
      setCity(profile.city || "")
      setState(profile.state || "")
    }
  }, [profile])

  // Load User details and mock session list
  useEffect(() => {
    // Session list simulation
    const currentAgent = navigator.userAgent
    const browser = currentAgent.includes("Chrome") ? "Google Chrome" : currentAgent.includes("Firefox") ? "Mozilla Firefox" : "Web Browser"
    const os = currentAgent.includes("Windows") ? "Windows OS" : currentAgent.includes("Mac") ? "macOS" : "Linux OS"
    setSessionList([
      {
        id: "sess-current",
        browser,
        os,
        ip: "127.0.0.1 (Local Host)",
        current: true,
        lastActive: "Active Now"
      },
      {
        id: "sess-old-1",
        browser: "Mobile YONO App",
        os: "Android OS",
        ip: "192.168.1.45",
        current: false,
        lastActive: "2 hours ago"
      }
    ])
  }, [])

  // Preferences loaded on mount
  useEffect(() => {
    if (profile) {
      setCommStyle(profile.communication_style || "Brief & Direct")
      setLang(profile.preferred_language || "English")
      setNudges(profile.nudges_enabled !== false)
    }
  }, [profile])

  // Helper to sanitize input by stripping HTML tags
  const sanitizeText = (input: string): string => {
    return input.replace(/<[^>]*>/g, "").trim()
  }

  // Handle Personal Info Update
  const handlePersonalUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPersonalLoading(true)
    setPersonalSuccess(false)
    try {
      const sanitizedName = sanitizeText(name)
      const sanitizedPhone = sanitizeText(phone)
      const sanitizedCity = sanitizeText(city)
      const sanitizedState = sanitizeText(state)
      const sanitizedPan = sanitizeText(pan)

      // Update state immediately to reflect sanitized values
      setName(sanitizedName)
      setPhone(sanitizedPhone)
      setCity(sanitizedCity)
      setState(sanitizedState)
      setPan(sanitizedPan)

      // We will save name, city, state, and other custom columns
      const updates: any = {
        name: sanitizedName,
        city: sanitizedCity,
        state: sanitizedState,
        phone: sanitizedPhone,
        dob,
        pan: sanitizedPan
      }
      const { error } = await updateProfile(updates)
      if (error) throw error
      setPersonalSuccess(true)
      setTimeout(() => setPersonalSuccess(false), 3000)
    } catch (err) {
      console.error(err)
      alert("Failed to update personal details.")
    } finally {
      setPersonalLoading(false)
    }
  }

  // Handle Preferences Auto-save on Change
  const handlePreferenceChange = async (key: string, value: any) => {
    setPrefLoading(true)
    try {
      const updates: any = {}
      if (key === "communication_style") {
        setCommStyle(value)
        updates.communication_style = value
      } else if (key === "preferred_language") {
        setLang(value)
        updates.preferred_language = value
      } else if (key === "nudges_enabled") {
        setNudges(value)
        updates.nudges_enabled = value
      }
      await updateProfile(updates)
    } catch (err) {
      console.error(err)
    } finally {
      setPrefLoading(false)
    }
  }

  // Handle Onboarding Re-run
  const handleRerunOnboarding = async () => {
    const confirm = window.confirm("Are you sure you want to reset your financial profile and re-run the onboarding wizard?")
    if (!confirm) return
    try {
      await updateProfile({ onboarding_complete: false })
      navigate("/onboarding")
    } catch (err) {
      console.error(err)
      alert("Failed to reset onboarding status.")
    }
  }

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError("")
    setPassSuccess(false)
    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.")
      return
    }
    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters.")
      return
    }
    setPassLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPassSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPassError(err.message || "Failed to update password.")
    } finally {
      setPassLoading(false)
    }
  }

  // Handle 2FA Toggle
  const handleTwoFactorToggle = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false)
      alert("Two-Factor Authentication disabled.")
    } else {
      setTwoFactorOtp("")
      setTwoFactorError("")
      setShowTwoFactorModal(true)
    }
  }

  const handleVerifyTwoFactor = () => {
    if (twoFactorOtp === "123456") {
      setTwoFactorEnabled(true)
      setShowTwoFactorModal(false)
      alert("Two-Factor Authentication successfully enabled!")
    } else {
      setTwoFactorError("Invalid OTP. Enter '123456' for verification.")
    }
  }

  // Handle Sign out other sessions
  const handleSignOutOthers = async () => {
    alert("Sign out request sent. All other device sessions have been terminated.")
    setSessionList(prev => prev.filter(s => s.current))
  }

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert("Verification mismatch. Please type 'DELETE' in uppercase.")
      return
    }
    setDeleteLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setDeleteLoading(false)
    setShowDeleteModal(false)
    alert("Your account deletion request has been registered. You will now be signed out.")
    await signOut()
    navigate("/")
  }

  // Simulated Avatar Upload
  const triggerAvatarUpload = () => {
    alert("Simulated: Image upload triggered! Selected standard avatar.")
    setAvatarSimulated("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120")
  }

  // Values loaded from DB
  const userInitial = name ? name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || "C"

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8 text-left">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal credentials, view financial summaries, and customize your app preference rules.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Avatar Card & Financial Profile */}
          <div className="lg:col-span-1 space-y-8">

            {/* Profile Avatar Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center flex flex-col items-center">
              <div
                onClick={triggerAvatarUpload}
                className="relative h-24 w-24 rounded-full bg-primary/10 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-primary dark:text-blue-400 text-3xl font-black cursor-pointer hover:opacity-85 transition-opacity overflow-hidden"
              >
                {avatarSimulated ? (
                  <img src={avatarSimulated} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  userInitial
                )}
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">{name || "Valued Customer"}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>

              <div className="mt-4 text-[10px] uppercase tracking-wider bg-slate-50 dark:bg-slate-950/30 px-3 py-1 rounded-full text-slate-500 font-bold border border-slate-100 dark:border-slate-850">
                SBI Customer Sandbox
              </div>
            </div>

            {/* Financial Profile Summary (Read Only Onboarding Data) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Financial Profile Summary</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Income Range</span>
                  <span className="font-semibold">{profile?.income_range || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Employment Type</span>
                  <span className="font-semibold">{profile?.employment_type || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Active Goals</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Array.isArray(profile?.goals) && profile.goals.length > 0 ? (
                      (profile.goals as string[]).map((g: string) => (
                        <span key={g} className="text-[10px] bg-blue-50 text-primary dark:bg-blue-950/20 dark:text-blue-400 px-2 py-0.5 rounded font-semibold capitalize">
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-450 italic">None selected</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Existing Investments</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Array.isArray(profile?.existing_investments) && profile.existing_investments.length > 0 ? (
                      (profile.existing_investments as string[]).map((i: string) => (
                        <span key={i} className="text-[10px] bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded font-semibold">
                          {i}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-450 italic">None</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider block">Insurance Covers</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Array.isArray(profile?.existing_insurance) && profile.existing_insurance.length > 0 ? (
                      (profile.existing_insurance as string[]).map((ins: string) => (
                        <span key={ins} className="text-[10px] bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded font-semibold">
                          {ins}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-450 italic">None</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                  <button
                    onClick={handleRerunOnboarding}
                    className="w-full text-center text-xs font-bold text-primary dark:text-blue-400 hover:underline cursor-pointer flex items-center justify-center gap-1"
                  >
                    Re-run Onboarding Wizard <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Editing panels (2 cols width) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Personal Information Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-4">Personal Details</h3>

              <form onSubmit={handlePersonalUpdate} className="space-y-6 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  {/* Full Name */}
                  <div className="space-y-1 col-span-1 md:col-span-3">
                    <label className="text-slate-500 font-semibold block">Full Name:</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1 col-span-1 md:col-span-3">
                    <label className="text-slate-500 font-semibold block">Mobile Number:</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        className="w-full pl-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1 col-span-1 md:col-span-3">
                    <label className="text-slate-500 font-semibold block">Email Address (Read Only):</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full pl-9 border border-slate-200 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-950/40 p-2.5 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed font-semibold font-mono opacity-80"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1 col-span-1 md:col-span-3">
                    <label className="text-slate-500 font-semibold block">Date of Birth:</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* PAN Number */}
                  <div className="space-y-1 col-span-1 md:col-span-2">
                    <label className="text-slate-500 font-semibold block">PAN Number (Masked):</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={pan}
                      onChange={(e) => setPan(e.target.value.toUpperCase())}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-mono font-bold tracking-wider text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1 col-span-1 md:col-span-2">
                    <label className="text-slate-500 font-semibold block">City:</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="space-y-1 col-span-1 md:col-span-2">
                    <label className="text-slate-500 font-semibold block">State:</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  {personalSuccess && (
                    <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Personal details saved!
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={personalLoading}
                    className="rounded-lg bg-primary py-2.5 px-6 font-bold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    {personalLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* App Preferences */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-extrabold text-slate-900 dark:text-white">App Preferences</h3>
                {prefLoading && <RefreshCw className="h-4 w-4 animate-spin text-primary dark:text-blue-400" />}
              </div>

              <div className="space-y-5 text-xs text-left">
                {/* Preferred Language */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div className="md:col-span-1">
                    <span className="font-bold text-slate-800 dark:text-white">Preferred Language:</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">App localization setting.</p>
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={lang}
                      onChange={(e) => handlePreferenceChange("preferred_language", e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Hinglish">Hinglish</option>
                    </select>
                  </div>
                </div>

                {/* Communication Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border-b border-slate-100 dark:border-slate-850 pb-4">
                  <div className="md:col-span-1">
                    <span className="font-bold text-slate-800 dark:text-white">SBI AI Tone:</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Companion assistant communication style.</p>
                  </div>
                  <div className="md:col-span-2">
                    <select
                      value={commStyle}
                      onChange={(e) => handlePreferenceChange("communication_style", e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Brief & Direct">Brief & Direct</option>
                      <option value="Friendly & Informative">Friendly & Informative</option>
                      <option value="Formal & Technical">Formal & Technical</option>
                    </select>
                  </div>
                </div>

                {/* Enable Nudges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-1">
                    <span className="font-bold text-slate-800 dark:text-white">Proactive Wealth Nudges:</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Let SBI AI scan metrics and alert gaps.</p>
                  </div>

                  <div className="md:col-span-2 flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={nudges}
                        onChange={(e) => handlePreferenceChange("nudges_enabled", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <h3 className="text-md font-extrabold text-slate-900 dark:text-white">Security Settings</h3>

              {/* Change Password Form */}
              <div className="border-b border-slate-100 dark:border-slate-850 pb-6">
                <span className="font-bold text-xs text-slate-850 dark:text-white block mb-3">Update Account Password:</span>

                <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold">New Password:</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-9 pr-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-3.5 text-slate-455 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-semibold">Confirm Password:</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          placeholder="Verify your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-9 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {passError && <div className="text-red-600 dark:text-red-400 font-bold">{passError}</div>}

                  <div className="flex justify-end items-center gap-4 pt-2">
                    {passSuccess && (
                      <span className="text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Password updated!
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={passLoading}
                      className="rounded-lg bg-slate-900 dark:bg-slate-800 py-2.5 px-6 font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1 transition-all"
                    >
                      {passLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Two-Factor Toggle */}
              <div className="border-b border-slate-100 dark:border-slate-850 pb-6 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white">Secure Two-Factor Authentication (2FA):</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Adds an additional safety code check on sign-ins.</p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={twoFactorEnabled ? handleTwoFactorToggle : () => handleTwoFactorToggle()}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary dark:peer-checked:bg-blue-600" />
                </label>
              </div>

              {/* Active Sessions Manager */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white">Active Account Sessions:</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Devices currently authenticated to your sandbox profile.</p>
                  </div>
                  <button
                    onClick={handleSignOutOthers}
                    className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                  >
                    Terminate Other Sessions
                  </button>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  {sessionList.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-slate-150 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20 flex justify-between items-center"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-850 dark:text-white">
                          <span>{s.browser} on {s.os}</span>
                          {s.current && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 px-1.5 py-0.25 rounded font-bold">
                              THIS DEVICE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">IP Address: {s.ip}</div>
                      </div>
                      <span className="text-[10px] text-slate-450 font-bold">{s.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-200 bg-red-50/10 p-6 shadow-sm dark:border-red-950/20">
              <div className="flex items-start gap-3 text-xs">
                <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <span className="font-extrabold text-red-600 dark:text-red-400 block">Danger Zone: Request Account Deletion</span>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                    Once deletion is completed, all financial data, transactions histories, and conversational context with Companion will be purged permanently. This action cannot be undone.
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmText("")
                        setShowDeleteModal(true)
                      }
                      }
                      className="rounded-lg border border-red-200 bg-white dark:bg-slate-900 text-red-600 dark:border-red-900/40 dark:text-red-400 px-4 py-2 font-bold shadow-xs hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />

      {/* ─────────────────── SECURITY DIALOGS ─────────────────── */}

      {/* 2FA Setup Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-sm w-full text-center">
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-2">Enable Two-Factor Authentication</h3>
            <p className="text-[11px] text-slate-500 mb-4">Scan the QR code with Google Authenticator or Microsoft Authenticator, then enter the validation code.</p>

            <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl inline-block border border-slate-150 dark:border-slate-850 mb-4">
              {/* Simulated QR Code graphic */}
              <div className="h-32 w-32 bg-white flex items-center justify-center border border-slate-200 p-2 mx-auto rounded">
                <QrCode className="h-28 w-28 text-slate-900" />
              </div>
              <span className="text-[9px] text-slate-400 font-mono block mt-2">SECRET: SBI Companion SANDBOX KEY</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1 text-left">
                <span className="text-slate-500 font-semibold">Verification Code:</span>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP code"
                  value={twoFactorOtp}
                  onChange={(e) => setTwoFactorOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg text-center font-mono tracking-widest text-lg font-black"
                />
              </div>

              {twoFactorError && <div className="text-red-600 font-bold text-left">{twoFactorError}</div>}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowTwoFactorModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyTwoFactor}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 cursor-pointer font-bold"
                >
                  Verify & Activate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-w-sm w-full text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/35 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-2">Delete Your Account Permanently?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              This will request permanent deletion of your profile. To confirm this action, please type the word <span className="font-black text-red-600 dark:text-red-400">"DELETE"</span> in the box below.
            </p>

            <div className="space-y-4 text-xs">
              <input
                type="text"
                placeholder="Type 'DELETE' to confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full border border-red-200 focus:ring-red-500 focus:border-red-500 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 rounded-lg text-center font-bold tracking-wider"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-white shadow-sm hover:bg-red-700 disabled:opacity-55 cursor-pointer font-bold flex justify-center items-center gap-1.5"
                >
                  {deleteLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
