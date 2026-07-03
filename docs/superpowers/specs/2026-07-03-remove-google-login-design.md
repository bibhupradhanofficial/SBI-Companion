# Remove Google Login Option Design Spec

## Goal
Remove the Google login (both real Google OAuth and sandbox fallback) option from the application to simplify the login process and focus on traditional credentials-based login.

## Proposed Changes

### 1. Remove Google Sign-in Handler Logic
* Delete the `handleGoogleSignIn` function from [LoginPage.tsx](file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Companion/src/pages/LoginPage.tsx) (lines 46-98). This function handles both actual Supabase Google OAuth and the fallback Sandbox flow.

### 2. Remove Google Sign-in UI Components
* Remove the `"Or continue with"` divider section in the rendering JSX of [LoginPage.tsx](file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Companion/src/pages/LoginPage.tsx) (lines 204-212).
* Remove the Google button section in the rendering JSX of [LoginPage.tsx](file:///d:/Programming%20Playground/Google%20Antigravity%20Playground/SBI%20Companion/src/pages/LoginPage.tsx) (lines 214-242).

## Verification Plan

### Manual Verification
* Navigate to the `/login` page and verify that:
  1. The "Or continue with" divider is no longer visible.
  2. The Google sign-in button is no longer visible.
  3. Standard email/password login still functions correctly.
  4. The signup link still redirects correctly.
