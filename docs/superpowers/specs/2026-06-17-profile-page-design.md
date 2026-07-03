# Profile Settings Page Layout and Functional Enhancements

## Goal
Improve the profile page layout, responsiveness, input data prefilling, and input security (XSS sanitization) to ensure a premium, modern user interface that behaves predictably.

## Proposed Changes

### 1. Form Grid System Restructuring
* Combine the individual row `div` elements of the **Personal Details** form into a single outer CSS Grid:
  ```html
  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
  ```
  - **Full Name**: `col-span-1 md:col-span-3`
  - **Mobile Number**: `col-span-1 md:col-span-3`
  - **Email Address**: `col-span-1 md:col-span-3`
  - **Date of Birth**: `col-span-1 md:col-span-3`
  - **PAN Number**: `col-span-1 md:col-span-2`
  - **City**: `col-span-1 md:col-span-2`
  - **State**: `col-span-1 md:col-span-2`
* Modify the **Change Password** form to use a matching grid layout:
  ```html
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  ```
* Ensure all action buttons ("Save Changes", "Change Password", "Delete Account") are aligned consistently to the right edge of their forms using Flexbox (`flex justify-end`).

### 2. State Integration and Prefilling
* Prefill form inputs from the fetched Supabase profile state inside the `useEffect` hook on mount:
  - `phone` from `profile.phone`
  - `dob` from `profile.dob`
  - `pan` from `profile.pan`
  - `city` from `profile.city`
  - `state` from `profile.state`

### 3. XSS Sanitization
* Implement a helper function `sanitizeText` to strip HTML tags before updating:
  ```typescript
  const sanitizeText = (input: string) => {
    return input.replace(/<[^>]*>/g, "").trim();
  };
  ```
* Apply `sanitizeText` to the editable profile attributes during profile updates.

### 4. Aesthetics and Typo Fixes
* Replace the invalid class `bg-slate-55/60` with a valid, clean Tailwind class for disabled styling:
  `bg-slate-150/50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed`

## Verification Plan
* Verify that the fields populate correctly upon page refresh.
* Ensure all elements adjust cleanly on browser resizing.
* Check that input containing HTML tags is sanitized on save.
