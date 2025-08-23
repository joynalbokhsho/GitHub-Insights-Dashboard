'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  CheckCircle
} from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ExportPage() {
  const { userProfile } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<'dashboard' | 'repositories' | 'contributions'>('dashboard')

  const handleExport = async () => {
    if (!userProfile?.githubUsername) return

    setExporting(true)
    try {
      // This would integrate with a PDF generation service
      // For now, we'll simulate the export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, you would:
      // 1. Fetch the data
      // 2. Generate PDF using jsPDF and html2canvas
      // 3. Download the file
      
      console.log(`Exporting ${exportType} data for ${userProfile.githubUsername}`)
    } catch (error) {
      console.error('Export failed:', error)
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
                disabled={exporting}
                size="lg"
              >
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Generating...' : 'Export PDF'}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• Report will include your latest GitHub data</p>
              <p>• PDF will be generated with high-quality charts</p>
              <p>• File will be automatically downloaded</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
