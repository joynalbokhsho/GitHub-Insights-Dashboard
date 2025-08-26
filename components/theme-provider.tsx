'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { userProfile } = useAuth()
  const [theme, setThemeState] = useState<Theme>('dark')
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize theme from user settings
  useEffect(() => {
    if (userProfile?.settings?.darkMode !== undefined) {
      const userTheme = userProfile.settings.darkMode ? 'dark' : 'light'
      setThemeState(userTheme)
    }
  }, [userProfile?.settings?.darkMode])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Apply current theme
    if (theme === 'dark') {
      root.classList.add('dark')
      setIsDark(true)
    } else if (theme === 'light') {
      root.classList.add('light')
      setIsDark(false)
    } else {
      // System theme
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      setIsDark(systemTheme === 'dark')
    }
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    
    // Update user settings if user is logged in
    if (userProfile && newTheme !== 'system') {
      const newDarkMode = newTheme === 'dark'
      if (userProfile.settings?.darkMode !== newDarkMode) {
        // Update local user profile immediately for UI responsiveness
        userProfile.settings = {
          emailNotifications: userProfile.settings?.emailNotifications ?? true,
          weeklyReports: userProfile.settings?.weeklyReports ?? false,
          darkMode: newDarkMode,
          autoRefresh: userProfile.settings?.autoRefresh ?? true,
        }
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
