import React, { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import {
  profilesService,
  goalsService,
  activitiesService,
  type Profile,
  type GoalProgress,
  type Activity,
} from "@/lib/supabase-service"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  goalsProgress: GoalProgress[]
  activities: Activity[]
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  fetchProfile: (userId: string) => Promise<Profile | null>
  updateProfile: (profileData: Partial<Profile>) => Promise<{ data: Profile | null; error: any }>
  fetchGoalsProgress: (userId: string) => Promise<GoalProgress[]>
  updateGoalProgress: (goalName: string, current: number, target: number) => Promise<{ error: any }>
  fetchActivities: (userId: string) => Promise<Activity[]>
  addActivity: (type: Activity["type"], description: string, amount?: number) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [goalsProgress, setGoalsProgress] = useState<GoalProgress[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  // ─── Profile ─────────────────────────────────────────────────────────────────
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const data = await profilesService.get(userId)
      setProfile(data)
      return data
    } catch (err) {
      console.error("fetchProfile error:", err)
      setProfile(null)
      return null
    }
  }

  const updateProfile = async (profileData: Partial<Profile>): Promise<{ data: Profile | null; error: any }> => {
    if (!user) return { data: null, error: new Error("No user authenticated") }
    try {
      const data = await profilesService.upsert({ id: user.id, name: profile?.name ?? "", ...profileData })
      setProfile(data)
      return { data, error: null }
    } catch (err: any) {
      console.error("updateProfile error:", err)
      return { data: null, error: err }
    }
  }

  // ─── Goals ───────────────────────────────────────────────────────────────────
  const fetchGoalsProgress = async (userId: string): Promise<GoalProgress[]> => {
    try {
      const data = await goalsService.list(userId)
      setGoalsProgress(data)
      return data
    } catch (err) {
      console.error("fetchGoalsProgress error:", err)
      setGoalsProgress([])
      return []
    }
  }

  const updateGoalProgress = async (
    goalName: string,
    currentAmount: number,
    targetAmount: number
  ): Promise<{ error: any }> => {
    if (!user) return { error: new Error("No user authenticated") }
    try {
      await goalsService.upsert(user.id, goalName, currentAmount, targetAmount)
      await fetchGoalsProgress(user.id)
      return { error: null }
    } catch (err: any) {
      console.error("updateGoalProgress error:", err)
      return { error: err }
    }
  }

  // ─── Activities ──────────────────────────────────────────────────────────────
  const fetchActivities = async (userId: string): Promise<Activity[]> => {
    try {
      const data = await activitiesService.list(userId, 10)
      setActivities(data)
      return data
    } catch (err) {
      console.error("fetchActivities error:", err)
      setActivities([])
      return []
    }
  }

  const addActivity = async (
    type: Activity["type"],
    description: string,
    amount?: number
  ): Promise<{ error: any }> => {
    if (!user) return { error: new Error("No user authenticated") }
    try {
      await activitiesService.add({
        user_id: user.id,
        type,
        description,
        amount: amount ?? null,
      })
      await fetchActivities(user.id)
      return { error: null }
    } catch (err: any) {
      console.error("addActivity error:", err)
      return { error: err }
    }
  }

  // ─── Session bootstrap ────────────────────────────────────────────────────────
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await Promise.all([
            fetchProfile(session.user.id),
            fetchGoalsProgress(session.user.id),
            fetchActivities(session.user.id),
          ])
        }
      } catch (err) {
        console.error("Error fetching initial session:", err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await Promise.all([
          fetchProfile(session.user.id),
          fetchGoalsProgress(session.user.id),
          fetchActivities(session.user.id),
        ])
      } else {
        setProfile(null)
        setGoalsProgress([])
        setActivities([])
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ─── Auth methods ─────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name ?? "" },
        },
      })
      return { data, error }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      return { data, error }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      setProfile(null)
      setGoalsProgress([])
      setActivities([])
      return { error }
    } catch (error: any) {
      return { error }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    goalsProgress,
    activities,
    loading,
    signUp,
    signIn,
    signOut,
    fetchProfile,
    updateProfile,
    fetchGoalsProgress,
    updateGoalProgress,
    fetchActivities,
    addActivity,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
