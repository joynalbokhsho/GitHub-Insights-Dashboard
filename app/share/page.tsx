'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Share2, 
  Link, 
  Copy, 
  Eye, 
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { generateShareId } from '@/lib/utils'

export default function SharePage() {
  const { userProfile } = useAuth()
  const [shareId, setShareId] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const generateShareLink = () => {
    const newShareId = generateShareId()
    setShareId(newShareId)
    setCopied(false)
  }

  const copyToClipboard = async () => {
    if (!shareId) return
    
    try {
      const shareUrl = `${window.location.origin}/shared/${shareId}`
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const shareOptions = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Share your main dashboard with key metrics',
      icon: Eye,
    },
    {
      id: 'repositories',
      title: 'Repository List',
      description: 'Share your repository collection',
      icon: Link,
    },
    {
      id: 'contributions',
      title: 'Contribution History',
      description: 'Share your GitHub activity',
      icon: Share2,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Share Dashboard</h1>
        <p className="text-muted-foreground">
          Create public links to share your GitHub insights
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
              <CardTitle>Share Options</CardTitle>
              <CardDescription>
                Choose what you want to share
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shareOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-medium">{option.title}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                )
              })}
              
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="public" className="text-sm">
                  Make this link publicly accessible
                </label>
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
              <CardTitle>Generated Link</CardTitle>
              <CardDescription>
                Share this link with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shareId ? (
                <>
                  <div className="flex space-x-2">
                    <Input
                      value={`${window.location.origin}/shared/${shareId}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {isPublic 
                        ? 'This link is publicly accessible'
                        : 'This link requires authentication'
                      }
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Generate a share link to get started
                  </p>
                </div>
              )}
              
              <Button 
                onClick={generateShareLink}
                className="w-full"
                size="lg"
              >
                <Link className="mr-2 h-4 w-4" />
                Generate Share Link
              </Button>
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
            <CardTitle>Share Settings</CardTitle>
            <CardDescription>
              Manage your shared links and privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Privacy</h4>
                  <p className="text-sm text-muted-foreground">
                    Control who can access your shared dashboard
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• Shared links are read-only</p>
                <p>• You can revoke access at any time</p>
                <p>• Analytics are available for shared views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
