'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GitBranch, 
  Star, 
  GitFork, 
  AlertCircle, 
  TrendingUp,
  RefreshCw,
  GitCommit,
  Users,
  Eye,
  Lock,
  Globe,
  Calendar,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatNumber } from '@/lib/utils'
import { Repository, UserStats, Commit } from '@/lib/github-api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalRepos: number
  totalStars: number
  totalForks: number
  totalIssues: number
  publicRepos: number
  privateRepos: number
  forkedRepos: number
  originalRepos: number
  languageStats: { name: string; value: number }[]
  starGrowth: { date: string; stars: number }[]
  recentCommits: Commit[]
  userStats: UserStats
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function DashboardPage() {
  const { userProfile, user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalRepos: 0,
    totalStars: 0,
    totalForks: 0,
    totalIssues: 0,
    publicRepos: 0,
    privateRepos: 0,
    forkedRepos: 0,
    originalRepos: 0,
    languageStats: [],
    starGrowth: [],
    recentCommits: [],
    userStats: {
      public_repos: 0,
      total_private_repos: 0,
      followers: 0,
      following: 0,
      public_gists: 0,
      private_gists: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    if (!userProfile?.githubUsername || !user) return

    try {
      setRefreshing(true)
      const idToken = await user.getIdToken()
      const response = await fetch(`/api/dashboard?username=${userProfile.githubUsername}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setStats({
        totalRepos: data.totalRepos || 0,
        totalStars: data.totalStars || 0,
        totalForks: data.totalForks || 0,
        totalIssues: data.totalIssues || 0,
        publicRepos: data.publicRepos || 0,
        privateRepos: data.privateRepos || 0,
        forkedRepos: data.forkedRepos || 0,
        originalRepos: data.originalRepos || 0,
        languageStats: data.languageStats || [],
        starGrowth: data.starGrowth || [],
        recentCommits: data.recentCommits || [],
        userStats: data.userStats || {
          public_repos: 0,
          total_private_repos: 0,
          followers: 0,
          following: 0,
          public_gists: 0,
          private_gists: 0
        }
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (error instanceof Error && error.message.includes('400')) {
        toast.error('Invalid GitHub username. Please check your profile settings.')
      } else {
        toast.error('Failed to fetch dashboard data. Please try again.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [userProfile])

  const formatCommitMessage = (message: string) => {
    return message.length > 50 ? message.substring(0, 50) + '...' : message
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-muted rounded-lg"></div>
            <div className="h-80 bg-muted rounded-lg"></div>
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.githubUsername}!
          </p>
        </div>
        <Button 
          onClick={fetchDashboardData}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalRepos)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publicRepos} public • {stats.privateRepos} private
              </p>
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
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalStars)}</div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
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
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.userStats.followers)}</div>
              <p className="text-xs text-muted-foreground">
                Following {formatNumber(stats.userStats.following)}
              </p>
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
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalIssues)}</div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overview Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Original Repos</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.originalRepos)}</div>
              <p className="text-xs text-muted-foreground">
                Created by you
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forked Repos</CardTitle>
              <GitFork className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.forkedRepos)}</div>
              <p className="text-xs text-muted-foreground">
                From other projects
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
              <GitFork className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalForks)}</div>
              <p className="text-xs text-muted-foreground">
                Of your repositories
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Gists</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.userStats.public_gists)}</div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats.userStats.private_gists)} private
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Repository Distribution</CardTitle>
              <CardDescription>Public vs Private repositories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Public', value: stats.publicRepos },
                      { name: 'Private', value: stats.privateRepos }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#0088FE" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
              <CardDescription>Most used programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.languageStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Commits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitCommit className="h-5 w-5" />
              <span>Recent Commits</span>
            </CardTitle>
            <CardDescription>
              Your latest commits across repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCommits.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCommits.map((commit, index) => (
                  <div key={commit.sha} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {commit.sha.substring(0, 7)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {commit.repository.name}
                        </span>
                      </div>
                      <p className="font-medium">{formatCommitMessage(commit.commit.message)}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(commit.commit.author.date)}</span>
                        </span>
                        <span>{commit.commit.author.name}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(commit.html_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GitCommit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent commits found</p>
                <p className="text-sm">Commits from the last 30 days will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Star Growth Chart */}
      {stats.starGrowth.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Star Growth</CardTitle>
              <CardDescription>Repository stars over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.starGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="stars" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
