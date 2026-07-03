# Forgot Password Feature Design Spec

## Goal
Implement a workable "Forgot password?" feature on the login page, allowing users to request a password reset email using Supabase's auth service.

## Proposed Changes

### 1. AuthContext Extension
* Add a `resetPassword` function to the `AuthContextType` interface and expose it in `AuthProvider` in [AuthContext.tsx](file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Companion/src/context/AuthContext.tsx).
* Under the hood, this function calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.

### 2. LoginPage Form Switching Logic
* Introduce `mode` (`"login" | "forgot"`) and `successMessage` states in [LoginPage.tsx](file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Companion/src/pages/LoginPage.tsx).
* Destructure `resetPassword` from `useAuth()`.
* Add a form submit handler `handleForgotPasswordSubmit` to call the context method and handle success or error responses.

### 3. LoginPage UI Enhancements
* Dynamically adjust the card's main headers and subtext.
* Conditionally render form fields and buttons based on `mode`.
* When `mode === "forgot"`, show only the Email input, a "Send Reset Link" button, and a "Back to Sign In" option.

## Verification Plan

### Manual Verification
* Access the login page and click the "Forgot password?" link. Verify that the form correctly switches to the "Reset Password" UI (only email input, back link).
* Enter a valid email address and submit. Verify that a success alert is shown and no console errors occur.
* Verify that clicking "Back to Sign In" switches the card back to the standard login UI.
