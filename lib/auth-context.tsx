'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, signInWithPopup, signOut, onAuthStateChanged, OAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, githubProvider, db } from './firebase'
import toast from 'react-hot-toast'

interface UserProfile {
  uid: string
  githubUsername: string
  email: string
  avatar: string
  githubToken?: string
  lastSync?: Date
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithGitHub: () => Promise<void>
  signOutUser: () => Promise<void>
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          // Convert Firestore timestamp to Date object
          const profile: UserProfile = {
            ...data,
            lastSync: data.lastSync ? new Date(data.lastSync.toDate ? data.lastSync.toDate() : data.lastSync) : undefined
          } as UserProfile
          setUserProfile(profile)
        } else {
          // Create new user profile
          const profile: UserProfile = {
            uid: user.uid,
            githubUsername: user.providerData[0]?.displayName || '',
            email: user.email || '',
            avatar: user.providerData[0]?.photoURL || '',
            lastSync: new Date(),
          }
          
          await setDoc(doc(db, 'users', user.uid), profile)
          setUserProfile(profile)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGitHub = async () => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, githubProvider)
      
      // Get GitHub access token
      const credential = OAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken
      
      if (token && result.user) {
        // Get GitHub username from GitHub API
        let githubUsername = ''
        try {
          const response = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })
          if (response.ok) {
            const userData = await response.json()
            githubUsername = userData.login
          }
        } catch (error) {
          console.error('Error fetching GitHub username:', error)
        }
        
        // Update user profile with GitHub token
        const profile: UserProfile = {
          uid: result.user.uid,
          githubUsername: githubUsername,
          email: result.user.email || '',
          avatar: result.user.providerData[0]?.photoURL || '',
          githubToken: token,
          lastSync: new Date(),
        }
        
        await setDoc(doc(db, 'users', result.user.uid), profile)
        setUserProfile(profile)
        
        toast.success('Successfully signed in with GitHub!')
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in with GitHub')
    } finally {
      setLoading(false)
    }
  }

  const signOutUser = async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
      toast.success('Successfully signed out!')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return
    
    try {
      const updatedProfile = { ...userProfile, ...profile }
      await setDoc(doc(db, 'users', user.uid), updatedProfile)
      setUserProfile(updatedProfile as UserProfile)
    } catch (error: any) {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile')
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithGitHub,
    signOutUser,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
