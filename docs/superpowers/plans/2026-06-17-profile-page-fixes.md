# Profile Page Fixes and Layout Alignments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix layout misalignment, disabled input rendering, profile data loading, and XSS vulnerabilities on the profile settings page.

**Architecture:** Use CSS Grid styling in Tailwind to establish a unified 6-column form grid. Fix profile loading by expanding state setting in `useEffect`. Add client-side sanitization to filter HTML tags from text inputs before database updates.

**Tech Stack:** React, Tailwind CSS, Lucide icons, Supabase, TypeScript

---

### Task 1: Fix Initial Profile Data Prefilling

**Files:**
* Modify: `src/pages/ProfilePage.tsx` (Update the `useEffect` hook to set local state fields for phone, dob, pan, city, and state from `profile` data on mount)

- [ ] **Step 1: Update the `useEffect` hook to prefill state variables**
  Update `useEffect` in [ProfilePage.tsx](file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Companion/src/pages/ProfilePage.tsx) around line 67:
  ```typescript
  // Load Initial Data
  useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setPhone(profile.phone || "")
      setDob(profile.dob || "")
      setPan(profile.pan || "")
      setCity(profile.city || "")
      setState(profile.state || "")
    }
  }, [profile])
  ```
- [ ] **Step 2: Run verification**
  Reload the `/profile` page and check if existing fields like PAN, City, and State are no longer blank or reset to their default values.

---

### Task 2: Refactor Form Grid Layout and Action Buttons

**Files:**
* Modify: `src/pages/ProfilePage.tsx` (Refactor Personal Details and Security forms to use unified grid layouts and align buttons)

- [ ] **Step 1: Refactor Personal Details Form Grid**
  Replace the row-by-row divs in the Personal Details form (lines 381-491) with a single `grid-cols-6` parent container, and set correct column spans:
  ```tsx
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

    {/* Buttons Container aligned right */}
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
  ```

- [ ] **Step 2: Refactor Change Password Form Grid and Buttons**
  Update Change Password form (lines 568-622) to use matching column structure and align its change password button to the right:
  ```tsx
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
            className="absolute right-3 top-3.5 text-slate-450 hover:text-slate-700 dark:hover:text-slate-350 cursor-pointer"
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

    {passError && <div className="text-red-650 dark:text-red-400 font-bold">{passError}</div>}
    
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
  ```

---

### Task 3: Implement XSS Sanitization

**Files:**
* Modify: `src/pages/ProfilePage.tsx` (Add `sanitizeText` helper and sanitize form values on save)

- [ ] **Step 1: Add sanitizeText helper**
  Add the `sanitizeText` helper inside the component `ProfilePage` or above it:
  ```typescript
  const sanitizeText = (input: string): string => {
    return input.replace(/<[^>]*>/g, "").trim()
  }
  ```
- [ ] **Step 2: Update handlePersonalUpdate**
  Sanitize user inputs before updating the profile:
  ```typescript
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

      const updates: any = {
        name: sanitizedName,
        city: sanitizedCity,
        state: sanitizedState,
        phone: sanitizedPhone,
        dob: dob, // dob is calendar input, no tags possible
        pan: sanitizedPan
      }

      // Update state immediately to reflect sanitized values
      setName(sanitizedName)
      setPhone(sanitizedPhone)
      setCity(sanitizedCity)
      setState(sanitizedState)
      setPan(sanitizedPan)

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
  ```
- [ ] **Step 3: Verification**
  Try to input `<img src=x onerror=alert(1)>` in the Name field and click Save. Check that the saved name is stripped of tags and saved as an empty string or correct plain text, and does not render as raw HTML.
