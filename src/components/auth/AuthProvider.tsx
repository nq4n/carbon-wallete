import React, { createContext, useContext } from 'react'
import { useAuth, UserProfile } from '../../hooks/useAuth'
import { User, Session } from '@supabase/supabase-js'
import { MockUser, MockSession, MockUserProfile } from '../../lib/mockAuth'

interface AuthContextType {
  user: User | MockUser | null
  profile: UserProfile | MockUserProfile | null
  session: Session | MockSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData: any) => Promise<any>
  signOut: () => Promise<any>
  createProfile: (userData: any) => Promise<any>
  updateProfile: (updates: Partial<UserProfile | MockUserProfile>) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}