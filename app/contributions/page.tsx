'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  TrendingUp, 
  GitCommit, 
  GitPullRequest, 
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatNumber, getContributionLevel } from '@/lib/utils'
import { ContributionData, Issue, PullRequest } from '@/lib/github-api'
import toast from 'react-hot-toast'

export default function ContributionsPage() {
  const { userProfile, user } = useAuth()
  const [contributionData, setContributionData] = useState<ContributionData>({
    totalContributions: 0,
    weeks: []
  })
  const [issues, setIssues] = useState<Issue[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchContributionData = async () => {
    if (!userProfile?.githubUsername || !user) return

    try {
      setRefreshing(true)
      const idToken = await user.getIdToken()
      
      const [contribResponse, issuesResponse, prsResponse] = await Promise.all([
        fetch(`/api/contributions?username=${userProfile.githubUsername}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }),
        fetch(`/api/issues?username=${userProfile.githubUsername}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }),
        fetch(`/api/pull-requests?username=${userProfile.githubUsername}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }),
      ])

      const [contribData, issuesData, prsData] = await Promise.all([
        contribResponse.json(),
        issuesResponse.json(),
        prsResponse.json(),
      ])

      setContributionData(contribData || { totalContributions: 0, weeks: [] })
      setIssues(Array.isArray(issuesData) ? issuesData : [])
      setPullRequests(Array.isArray(prsData) ? prsData : [])
    } catch (error) {
      console.error('Error fetching contribution data:', error)
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('400')) {
        toast.error('Invalid GitHub username. Please check your profile settings.')
      } else {
        toast.error('Failed to fetch contribution data. Please try again.')
      }
      // Keep default values on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchContributionData()
  }, [userProfile])

  const renderContributionHeatmap = () => {
    if (!contributionData || !contributionData.weeks || contributionData.weeks.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No contribution data available
        </div>
      )
    }

    return (
      <div className="contribution-heatmap">
        {contributionData.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.contributionDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`contribution-day contribution-level-${getContributionLevel(day.contributionCount)}`}
                title={`${day.date}: ${day.contributionCount} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-80 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contributions</h1>
          <p className="text-muted-foreground">
            Your GitHub activity and contribution history
          </p>
        </div>
        <Button 
          onClick={fetchContributionData}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {contributionData && (
        <>
          {/* Contribution Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(contributionData.totalContributions)}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
                  <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(pullRequests.length)}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Issues</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(issues.length)}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Days</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contributionData?.weeks?.flatMap(week => 
                      week.contributionDays.filter(day => day.contributionCount > 0)
                    ).length || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Contribution Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Contribution Heatmap</CardTitle>
                <CardDescription>
                  Your GitHub contributions over the past year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {renderContributionHeatmap()}
                </div>
                <div className="flex justify-center mt-4 space-x-2 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-sm contribution-level-${level}`}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Pull Requests</CardTitle>
                  <CardDescription>Your latest pull request activity</CardDescription>
                </CardHeader>
                <CardContent>
                                     <div className="space-y-4">
                     {(Array.isArray(pullRequests) ? pullRequests : []).slice(0, 5).filter(pr => pr && pr.id && pr.title).map((pr) => (
                       <div key={pr.id} className="flex items-start space-x-3">
                         <GitPullRequest className="h-5 w-5 text-primary mt-0.5" />
                         <div className="flex-1 min-w-0">
                           <a
                             href={pr.html_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-sm font-medium hover:text-primary transition-colors"
                           >
                             {pr.title}
                           </a>
                           <p className="text-xs text-muted-foreground">
                             {pr.repository?.full_name || 'Unknown repository'} • {pr.state || 'Unknown'}
                           </p>
                         </div>
                       </div>
                     ))}
                     {(Array.isArray(pullRequests) ? pullRequests : []).filter(pr => pr && pr.id && pr.title).length === 0 && (
                       <div className="text-center py-4 text-muted-foreground">
                         No pull requests found
                       </div>
                     )}
                   </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Issues</CardTitle>
                  <CardDescription>Your latest issue activity</CardDescription>
                </CardHeader>
                <CardContent>
                                     <div className="space-y-4">
                     {(Array.isArray(issues) ? issues : []).slice(0, 5).filter(issue => issue && issue.id && issue.title).map((issue) => (
                       <div key={issue.id} className="flex items-start space-x-3">
                         <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                         <div className="flex-1 min-w-0">
                           <a
                             href={issue.html_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-sm font-medium hover:text-primary transition-colors"
                           >
                             {issue.title}
                           </a>
                           <p className="text-xs text-muted-foreground">
                             {issue.repository?.full_name || 'Unknown repository'} • {issue.state || 'Unknown'}
                           </p>
                         </div>
                       </div>
                     ))}
                     {(Array.isArray(issues) ? issues : []).filter(issue => issue && issue.id && issue.title).length === 0 && (
                       <div className="text-center py-4 text-muted-foreground">
                         No issues found
                       </div>
                     )}
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
