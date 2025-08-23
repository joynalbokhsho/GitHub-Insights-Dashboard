'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { generatePDF } from '@/lib/pdf-generator'
import toast from 'react-hot-toast'

export default function ExportPage() {
  const { userProfile, user } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'dashboard' | 'repositories' | 'contributions'>('dashboard')

  const handleExport = async () => {
    if (!userProfile?.githubUsername || !user) {
      toast.error('Please sign in to export data')
      return
    }

    setExporting(true)
    try {
      // Get user token
      const idToken = await user.getIdToken()
      
      // Fetch export data from API
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ exportType })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Generate PDF
      const pdfBlob = await generatePDF(data)
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `github-insights-${exportType}-${userProfile.githubUsername}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const exportOptions = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Complete dashboard with charts and statistics',
      icon: BarChart3,
    },
    {
      id: 'repositories',
      title: 'Repository Report',
      description: 'Detailed repository analysis and insights',
      icon: FileText,
    },
    {
      id: 'contributions',
      title: 'Contribution History',
      description: 'Your GitHub activity and contribution trends',
      icon: Calendar,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Export Insights</h1>
        <p className="text-muted-foreground">
          Export your GitHub insights as PDF reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {exportOptions.map((option) => {
          const Icon = option.icon
          const isSelected = exportType === option.id
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'
                }`}
                onClick={() => setExportType(option.id as any)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>
              Configure your export preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Selected Report</h4>
                <p className="text-sm text-muted-foreground">
                  {exportOptions.find(opt => opt.id === exportType)?.title}
                </p>
              </div>
              <Button 
                onClick={handleExport}
                disabled={exporting || !userProfile?.githubUsername}
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Generating...' : 'Export PDF'}
              </Button>
            </div>
            
            {!userProfile?.githubUsername && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Please connect your GitHub account to export data
                </p>
              </div>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>• Report will include your latest GitHub data</p>
              <p>• PDF will be generated with comprehensive insights</p>
              <p>• File will be automatically downloaded</p>
              <p>• Data is fetched in real-time from GitHub API</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
            <CardDescription>
              Preview of what will be included in your {exportType} report
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exportType === 'dashboard' && (
              <div className="space-y-2 text-sm">
                <p>• Overview statistics (repositories, stars, forks, issues)</p>
                <p>• Repository breakdown (public/private, original/forked)</p>
                <p>• Top programming languages used</p>
                <p>• Top repositories by stars</p>
                <p>• Recent commits activity</p>
                <p>• Follower and following statistics</p>
              </div>
            )}
            {exportType === 'repositories' && (
              <div className="space-y-2 text-sm">
                <p>• Complete repository summary</p>
                <p>• Detailed list of all repositories</p>
                <p>• Language distribution for each repo</p>
                <p>• Stars, forks, and issues count</p>
                <p>• Repository type classification</p>
                <p>• Creation and update dates</p>
              </div>
            )}
            {exportType === 'contributions' && (
              <div className="space-y-2 text-sm">
                <p>• Total contribution count</p>
                <p>• Recent issues and pull requests</p>
                <p>• Recent commit activity</p>
                <p>• Contribution trends</p>
                <p>• Activity summary</p>
                <p>• GitHub activity timeline</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
