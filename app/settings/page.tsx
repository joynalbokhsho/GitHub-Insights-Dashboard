'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  RefreshCw,
  Download,
  Trash2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const { userProfile, updateUserProfile, user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [settings, setSettings] = useState({
    emailNotifications: userProfile?.settings?.emailNotifications ?? true,
    weeklyReports: userProfile?.settings?.weeklyReports ?? false,
    darkMode: userProfile?.settings?.darkMode ?? false,
    autoRefresh: userProfile?.settings?.autoRefresh ?? true,
  })

  // Update settings when userProfile changes
  useEffect(() => {
    if (userProfile?.settings) {
      setSettings({
        emailNotifications: userProfile.settings.emailNotifications ?? true,
        weeklyReports: userProfile.settings.weeklyReports ?? false,
        darkMode: userProfile.settings.darkMode ?? false,
        autoRefresh: userProfile.settings.autoRefresh ?? true,
      })
    }
  }, [userProfile])

  const handleSaveSettings = async () => {
    if (!user || !userProfile) {
      toast.error('Please sign in to save settings')
      return
    }

    setSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        settings: settings
      })
      
      // Update local user profile
      await updateUserProfile({ settings })
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const refreshGitHubData = async () => {
    if (!user || !userProfile) {
      toast.error('Please sign in to refresh data')
      return
    }

    setRefreshing(true)
    try {
      // Update lastSync timestamp
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        lastSync: new Date()
      })
      
      // Update local user profile
      await updateUserProfile({ lastSync: new Date() })
      
      toast.success('GitHub data refreshed successfully!')
    } catch (error) {
      console.error('Failed to refresh data:', error)
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  const handleExportData = async () => {
    if (!user || !userProfile) {
      toast.error('Please sign in to export data')
      return
    }

    try {
      // Fetch all data for JSON export
      const idToken = await user.getIdToken()
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ exportType: 'all' })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Create JSON blob
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })

      const url = window.URL.createObjectURL(jsonBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `github-insights-data-${userProfile.githubUsername}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || !userProfile) {
      toast.error('Please sign in to delete account')
      return
    }

    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      // Delete user document from Firestore
      const userRef = doc(db, 'users', user.uid)
      await deleteDoc(userRef)
      
      // Delete user account from Firebase Auth
      await user.delete()
      
      toast.success('Account deleted successfully')
    } catch (error) {
      console.error('Failed to delete account:', error)
      toast.error('Failed to delete account')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and GitHub information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">GitHub Username</label>
                <Input
                  value={userProfile?.githubUsername || ''}
                  readOnly
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={userProfile?.email || ''}
                  readOnly
                  className="mt-1"
                />
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="font-medium">Last Sync</h4>
                                     <p className="text-sm text-muted-foreground">
                     {userProfile?.lastSync 
                       ? (() => {
                           try {
                             const date = new Date(userProfile.lastSync)
                             return isNaN(date.getTime()) ? 'Never' : date.toLocaleString()
                           } catch {
                             return 'Never'
                           }
                         })()
                       : 'Never'
                     }
                   </p>
                </div>
                <Button 
                  onClick={refreshGitHubData}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your GitHub activity
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    emailNotifications: e.target.checked
                  })}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Get weekly summaries of your activity
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => setSettings({
                    ...settings,
                    weeklyReports: e.target.checked
                  })}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto Refresh</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh data every hour
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => setSettings({
                    ...settings,
                    autoRefresh: e.target.checked
                  })}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Dark Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({
                  ...settings,
                  darkMode: e.target.checked
                })}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy & Security</span>
            </CardTitle>
            <CardDescription>
              Manage your data and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Export</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your data
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and data
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-8 flex justify-end"
      >
        <Button 
          onClick={handleSaveSettings}
          disabled={saving}
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>
    </div>
  )
}
