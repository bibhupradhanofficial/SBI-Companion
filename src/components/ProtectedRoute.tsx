import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading SBI Companion...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const onboardingComplete = profile?.onboarding_complete === true
  const isVisitingOnboarding = location.pathname === "/onboarding"

  if (isVisitingOnboarding && onboardingComplete) {
    return <Navigate to="/dashboard" replace />
  }

  if (!isVisitingOnboarding && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}

