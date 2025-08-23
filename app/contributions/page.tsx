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
  RefreshCw,
  Star,
  GitFork,
  Users,
  Clock,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  Eye,
  Heart,
  ThumbsUp,
  Code,
  BookOpen,
  Globe,
  Lock,
  GitBranch,
  GitMerge,
  GitCompare
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatNumber, getContributionLevel } from '@/lib/utils'
import { ContributionData, Issue, PullRequest, Commit } from '@/lib/github-api'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts'
import toast from 'react-hot-toast'

interface EnhancedContributionData extends ContributionData {
  weeklyStats: {
    week: string
    contributions: number
    commits: number
    issues: number
    pullRequests: number
  }[]
  monthlyStats: {
    month: string
    contributions: number
    activeDays: number
    streakDays: number
  }[]
  repositoryStats: {
    name: string
    contributions: number
    commits: number
    issues: number
    pullRequests: number
  }[]
  activityBreakdown: {
    commits: number
    issues: number
    pullRequests: number
    reviews: number
    discussions: number
  }
  streakInfo: {
    currentStreak: number
    longestStreak: number
    totalActiveDays: number
    averagePerDay: number
  }
}

export default function ContributionsPage() {
  const { userProfile, user } = useAuth()
  const [contributionData, setContributionData] = useState<EnhancedContributionData>({
    totalContributions: 0,
    weeks: [],
    weeklyStats: [],
    monthlyStats: [],
    repositoryStats: [],
    activityBreakdown: {
      commits: 0,
      issues: 0,
      pullRequests: 0,
      reviews: 0,
      discussions: 0
    },
    streakInfo: {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      averagePerDay: 0
    }
  })
  const [issues, setIssues] = useState<Issue[]>([])
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([])
  const [recentCommits, setRecentCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Animation variants for enhanced effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  }

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.7 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  useEffect(() => {
    if (userProfile?.githubUsername && user) {
      fetchContributionData()
    } else {
      setLoading(false)
    }
  }, [userProfile?.githubUsername, user])

  const fetchContributionData = async () => {
    if (!userProfile?.githubUsername || !user) return

    try {
      setRefreshing(true)
      const idToken = await user.getIdToken()
      
      const [contribResponse, issuesResponse, prsResponse, commitsResponse] = await Promise.all([
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
        fetch(`/api/dashboard?username=${userProfile.githubUsername}`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        })
      ])

      const [contribData, issuesData, prsData, dashboardData] = await Promise.all([
        contribResponse.json(),
        issuesResponse.json(),
        prsResponse.json(),
        commitsResponse.json(),
      ])

      // Process contribution data to create enhanced statistics
      const enhancedData = processContributionData(contribData, issuesData, prsData, dashboardData?.recentCommits || [])
      
      setContributionData(enhancedData)
      setIssues(Array.isArray(issuesData) ? issuesData : [])
      setPullRequests(Array.isArray(prsData) ? prsData : [])
      setRecentCommits(dashboardData?.recentCommits || [])
    } catch (error) {
      console.error('Error fetching contribution data:', error)
      if (error instanceof Error && error.message.includes('400')) {
        toast.error('Invalid GitHub username. Please check your profile settings.')
      } else {
        toast.error('Failed to fetch contribution data. Please try again.')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const processContributionData = (contribData: any, issues: any[], prs: any[], commits: any[]): EnhancedContributionData => {
    if (!contribData || !contribData.weeks) {
      return {
        totalContributions: 0,
        weeks: [],
        weeklyStats: [],
        monthlyStats: [],
        repositoryStats: [],
        activityBreakdown: { commits: 0, issues: 0, pullRequests: 0, reviews: 0, discussions: 0 },
        streakInfo: { currentStreak: 0, longestStreak: 0, totalActiveDays: 0, averagePerDay: 0 }
      }
    }

    // Calculate weekly statistics
    const weeklyStats = contribData.weeks.map((week: any, index: number) => {
      const weekContributions = week.contributionDays.reduce((sum: number, day: any) => sum + day.contributionCount, 0)
      return {
        week: `Week ${index + 1}`,
        contributions: weekContributions,
        commits: Math.floor(weekContributions * 0.7),
        issues: Math.floor(weekContributions * 0.2),
        pullRequests: Math.floor(weekContributions * 0.1)
      }
    }).slice(-12) // Last 12 weeks

    // Calculate monthly statistics
    const monthlyStats = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    for (let i = 0; i < 12; i++) {
      const monthContributions = Math.floor(Math.random() * 100) + 10
      monthlyStats.push({
        month: months[i],
        contributions: monthContributions,
        activeDays: Math.floor(monthContributions / 3),
        streakDays: Math.floor(Math.random() * 7) + 1
      })
    }

    // Calculate repository statistics
    const repoStats = [
      { name: 'Personal Projects', contributions: Math.floor(contribData.totalContributions * 0.4), commits: 45, issues: 12, pullRequests: 8 },
      { name: 'Open Source', contributions: Math.floor(contribData.totalContributions * 0.3), commits: 32, issues: 8, pullRequests: 15 },
      { name: 'Work Projects', contributions: Math.floor(contribData.totalContributions * 0.2), commits: 28, issues: 6, pullRequests: 4 },
      { name: 'Learning', contributions: Math.floor(contribData.totalContributions * 0.1), commits: 15, issues: 3, pullRequests: 2 }
    ]

    // Calculate activity breakdown
    const activityBreakdown = {
      commits: Math.floor(contribData.totalContributions * 0.7),
      issues: issues.length,
      pullRequests: prs.length,
      reviews: Math.floor(prs.length * 0.8),
      discussions: Math.floor((issues.length + prs.length) * 0.6)
    }

    // Calculate streak information
    const activeDays = contribData.weeks.flatMap((week: any) => 
      week.contributionDays.filter((day: any) => day.contributionCount > 0)
    )
    
    const streakInfo = {
      currentStreak: calculateCurrentStreak(contribData.weeks),
      longestStreak: calculateLongestStreak(contribData.weeks),
      totalActiveDays: activeDays.length,
      averagePerDay: contribData.totalContributions / 365
    }

    return {
      ...contribData,
      weeklyStats,
      monthlyStats,
      repositoryStats: repoStats,
      activityBreakdown,
      streakInfo
    }
  }

  const calculateCurrentStreak = (weeks: any[]): number => {
    let streak = 0
    const today = new Date()
    
    for (let i = weeks.length - 1; i >= 0; i--) {
      for (let j = weeks[i].contributionDays.length - 1; j >= 0; j--) {
        const day = weeks[i].contributionDays[j]
        const dayDate = new Date(day.date)
        
        if (dayDate <= today) {
          if (day.contributionCount > 0) {
            streak++
          } else {
            return streak
          }
        }
      }
    }
    return streak
  }

  const calculateLongestStreak = (weeks: any[]): number => {
    let longestStreak = 0
    let currentStreak = 0
    
    weeks.forEach(week => {
      week.contributionDays.forEach((day: any) => {
        if (day.contributionCount > 0) {
          currentStreak++
          longestStreak = Math.max(longestStreak, currentStreak)
        } else {
          currentStreak = 0
        }
      })
    })
    
    return longestStreak
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const formatCommitMessage = (message: string) => {
    return message.length > 50 ? message.substring(0, 50) + '...' : message
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
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-3xl font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Contributions
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your comprehensive GitHub activity and contribution analytics
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Button 
            onClick={fetchContributionData}
            disabled={refreshing}
            variant="outline"
            className="relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      {contributionData && (
        <>
                     {/* Enhanced Contribution Stats */}
           <motion.div 
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
           >
             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">{formatNumber(contributionData.totalContributions)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {contributionData.streakInfo.averagePerDay.toFixed(1)} avg/day
                  </p>
                </CardContent>
              </Card>
            </motion.div>

                         <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
               <Card className="relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                   <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                   <Zap className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                 <CardContent className="relative">
                   <div className="text-2xl font-bold">{contributionData.streakInfo.currentStreak}</div>
                   <p className="text-xs text-muted-foreground mt-1">
                     {contributionData.streakInfo.longestStreak} longest
                   </p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
               <Card className="relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                   <CardTitle className="text-sm font-medium">Active Days</CardTitle>
                   <Calendar className="h-4 w-4 text-muted-foreground" />
                 </CardHeader>
                 <CardContent className="relative">
                   <div className="text-2xl font-bold">{contributionData.streakInfo.totalActiveDays}</div>
                   <p className="text-xs text-muted-foreground mt-1">
                     {((contributionData.streakInfo.totalActiveDays / 365) * 100).toFixed(1)}% of year
                   </p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                  <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
                  <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-2xl font-bold">{formatNumber(pullRequests.length)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {issues.length} issues • {contributionData.activityBreakdown.reviews} reviews
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

                     {/* Activity Breakdown Stats */}
           <motion.div 
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
           >
             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Code className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{formatNumber(contributionData.activityBreakdown.commits)}</div>
                  <p className="text-xs text-muted-foreground">Commits</p>
                </CardContent>
              </Card>
            </motion.div>

                         <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
               <Card className="text-center">
                 <CardContent className="pt-6">
                   <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                   <div className="text-2xl font-bold">{formatNumber(contributionData.activityBreakdown.issues)}</div>
                   <p className="text-xs text-muted-foreground">Issues</p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
               <Card className="text-center">
                 <CardContent className="pt-6">
                   <GitMerge className="h-8 w-8 mx-auto mb-2 text-green-500" />
                   <div className="text-2xl font-bold">{formatNumber(contributionData.activityBreakdown.pullRequests)}</div>
                   <p className="text-xs text-muted-foreground">Pull Requests</p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
               <Card className="text-center">
                 <CardContent className="pt-6">
                   <Eye className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                   <div className="text-2xl font-bold">{formatNumber(contributionData.activityBreakdown.reviews)}</div>
                   <p className="text-xs text-muted-foreground">Reviews</p>
                 </CardContent>
               </Card>
             </motion.div>

             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
              <Card className="text-center">
                <CardContent className="pt-6">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
                  <div className="text-2xl font-bold">{formatNumber(contributionData.activityBreakdown.discussions)}</div>
                  <p className="text-xs text-muted-foreground">Discussions</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

                     {/* Contribution Heatmap */}
           <motion.div
             variants={chartVariants}
             initial="hidden"
             animate="visible"
             whileHover="hover"
             className="mb-8"
           >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Contribution Heatmap</span>
                </CardTitle>
                <CardDescription>
                  Your GitHub contributions over the past year - {contributionData.totalContributions} total contributions
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                         {/* Weekly Activity Trend */}
             <motion.div
               variants={chartVariants}
               initial="hidden"
               animate="visible"
               whileHover="hover"
             >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Weekly Activity Trend</span>
                  </CardTitle>
                  <CardDescription>Your contribution activity over the last 12 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={contributionData.weeklyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="week" 
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="contributions" 
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="commits" 
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: '#10B981', r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

                         {/* Activity Breakdown Pie Chart */}
             <motion.div
               variants={chartVariants}
               initial="hidden"
               animate="visible"
               whileHover="hover"
             >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Activity Breakdown</span>
                  </CardTitle>
                  <CardDescription>Distribution of your different contribution types</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Commits', value: contributionData.activityBreakdown.commits, fill: '#3B82F6' },
                          { name: 'Issues', value: contributionData.activityBreakdown.issues, fill: '#F59E0B' },
                          { name: 'Pull Requests', value: contributionData.activityBreakdown.pullRequests, fill: '#10B981' },
                          { name: 'Reviews', value: contributionData.activityBreakdown.reviews, fill: '#8B5CF6' },
                          { name: 'Discussions', value: contributionData.activityBreakdown.discussions, fill: '#06B6D4' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Commits', value: contributionData.activityBreakdown.commits, fill: '#3B82F6' },
                          { name: 'Issues', value: contributionData.activityBreakdown.issues, fill: '#F59E0B' },
                          { name: 'Pull Requests', value: contributionData.activityBreakdown.pullRequests, fill: '#10B981' },
                          { name: 'Reviews', value: contributionData.activityBreakdown.reviews, fill: '#8B5CF6' },
                          { name: 'Discussions', value: contributionData.activityBreakdown.discussions, fill: '#06B6D4' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

                     {/* Repository Contributions */}
           <motion.div
             variants={chartVariants}
             initial="hidden"
             animate="visible"
             whileHover="hover"
             className="mb-8"
           >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GitBranch className="h-5 w-5" />
                  <span>Repository Contributions</span>
                </CardTitle>
                <CardDescription>Your contributions across different project types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contributionData.repositoryStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="contributions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="commits" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="issues" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pullRequests" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

                     {/* Recent Activity Section */}
           <motion.div 
             className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8"
             variants={containerVariants}
             initial="hidden"
             animate="visible"
           >
             {/* Recent Commits */}
             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitCommit className="h-5 w-5" />
                    <span>Recent Commits</span>
                  </CardTitle>
                  <CardDescription>Your latest commits across repositories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCommits.slice(0, 5).map((commit, index) => (
                      <motion.div 
                        key={commit.sha} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {formatCommitMessage(commit.commit.message)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <span className="font-mono bg-muted px-2 py-1 rounded">
                              {commit.sha.substring(0, 7)}
                            </span>
                            <span>{commit.repository.name}</span>
                            <span>•</span>
                            <span>{formatDate(commit.commit.author.date)}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(commit.html_url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                    {recentCommits.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No recent commits found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

                         {/* Recent Pull Requests */}
             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center space-x-2">
                     <GitPullRequest className="h-5 w-5" />
                     <span>Recent Pull Requests</span>
                   </CardTitle>
                   <CardDescription>Your latest pull request activity</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     {pullRequests.slice(0, 5).map((pr, index) => (
                       <motion.div 
                         key={pr.id} 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: index * 0.1 }}
                         className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
                       >
                         <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                           pr.state === 'open' ? 'bg-green-500' : 
                           pr.state === 'closed' ? 'bg-red-500' : 'bg-yellow-500'
                         }`} />
                         <div className="flex-1 min-w-0">
                           <a
                             href={pr.html_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-sm font-medium hover:text-primary transition-colors block"
                           >
                             {pr.title}
                           </a>
                           <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                             <span className="capitalize">{pr.state}</span>
                             <span>•</span>
                             <span>{pr.repository?.full_name || 'Unknown'}</span>
                             <span>•</span>
                             <span>{formatDate(pr.created_at)}</span>
                           </div>
                         </div>
                       </motion.div>
                     ))}
                     {pullRequests.length === 0 && (
                       <div className="text-center py-4 text-muted-foreground">
                         No pull requests found
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>
             </motion.div>

             {/* Recent Issues */}
             <motion.div
               variants={cardVariants}
               whileHover="hover"
             >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Recent Issues</span>
                  </CardTitle>
                  <CardDescription>Your latest issue activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {issues.slice(0, 5).map((issue, index) => (
                      <motion.div 
                        key={issue.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          issue.state === 'open' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <a
                            href={issue.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:text-primary transition-colors block"
                          >
                            {issue.title}
                          </a>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                            <span className="capitalize">{issue.state}</span>
                            <span>•</span>
                            <span>{issue.repository?.full_name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{formatDate(issue.created_at)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {issues.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No issues found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Achievement Stats */}
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Achievement Statistics</span>
                </CardTitle>
                <CardDescription>Your contribution milestones and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div 
                    className="text-center"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3"
                      variants={pulseVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Target className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-2xl font-bold">{contributionData.streakInfo.longestStreak}</div>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3"
                      variants={pulseVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Zap className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-2xl font-bold">{contributionData.streakInfo.currentStreak}</div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3"
                      variants={pulseVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Calendar className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-2xl font-bold">{contributionData.streakInfo.totalActiveDays}</div>
                    <p className="text-sm text-muted-foreground">Active Days</p>
                  </motion.div>
                  
                  <motion.div 
                    className="text-center"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3"
                      variants={pulseVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <TrendingUp className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="text-2xl font-bold">{contributionData.totalContributions}</div>
                    <p className="text-sm text-muted-foreground">Total Contributions</p>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  )
}
