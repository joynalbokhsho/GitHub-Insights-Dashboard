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
  User,
  Eye,
  Lock,
  Globe,
  Calendar,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '@/lib/utils'
import { Repository, UserStats, Commit } from '@/lib/github-api'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
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
  Scatter,
  FunnelChart,
  Funnel,
  Treemap,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Surface,
  Sector
} from 'recharts'
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

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4',
  '#84CC16', '#F97316', '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
]

const GRADIENT_COLORS = {
  primary: ['#3B82F6', '#1D4ED8'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#EF4444', '#DC2626'],
  purple: ['#8B5CF6', '#7C3AED'],
  cyan: ['#06B6D4', '#0891B2']
}

// Animation variants
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
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
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
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

const chartVariants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      duration: 0.8
    }
  }
}

const commitVariants = {
  hidden: { 
    opacity: 0, 
    x: -20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15
    }
  },
  hover: {
    x: 5,
    scale: 1.01,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
}

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

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
    <div className="p-4 md:p-8 pt-20 md:pt-8">
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8"
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
            className="text-2xl md:text-3xl font-bold"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Dashboard
          </motion.h1>
          <motion.p 
            className="text-sm md:text-base text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Welcome back, {userProfile?.githubUsername}!
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Button 
            onClick={fetchDashboardData}
            disabled={refreshing}
            variant="outline"
            className="relative overflow-hidden w-full sm:w-auto"
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

      {/* Overview Cards - Row 1 */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 0.5 }}
              >
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.totalRepos)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {stats.publicRepos} public • {stats.privateRepos} private
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 0.6 }}
              >
                <Star className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.totalStars)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 0.7 }}
              >
                <Users className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.userStats.followers)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Following {formatNumber(stats.userStats.following)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 0.8 }}
              >
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.totalIssues)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Overview Cards - Row 2 */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Original Repos</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 0.9 }}
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.originalRepos)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Created by you
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forked Repos</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 1.0 }}
              >
                <GitFork className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.forkedRepos)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                From other projects
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 1.1 }}
              >
                <GitFork className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.totalForks)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                Of your repositories
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="relative group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          />
          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Gists</CardTitle>
              <motion.div
                animate={pulseVariants.pulse}
                transition={{ delay: 1.2 }}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
              >
                {formatNumber(stats.userStats.public_gists)}
              </motion.div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats.userStats.private_gists)} private
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Repository Distribution - Enhanced Pie Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ 
            scale: 1.02,
            y: -5,
            transition: { type: "spring", stiffness: 300, damping: 20 }
          }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Repository Distribution</CardTitle>
              <CardDescription>Visual breakdown of your repositories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Public', value: stats.publicRepos, fill: GRADIENT_COLORS.primary[0] },
                      { name: 'Private', value: stats.privateRepos, fill: GRADIENT_COLORS.danger[0] },
                      { name: 'Original', value: stats.originalRepos, fill: GRADIENT_COLORS.success[0] },
                      { name: 'Forked', value: stats.forkedRepos, fill: GRADIENT_COLORS.warning[0] }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Public', value: stats.publicRepos, fill: GRADIENT_COLORS.primary[0] },
                      { name: 'Private', value: stats.privateRepos, fill: GRADIENT_COLORS.danger[0] },
                      { name: 'Original', value: stats.originalRepos, fill: GRADIENT_COLORS.success[0] },
                      { name: 'Forked', value: stats.forkedRepos, fill: GRADIENT_COLORS.warning[0] }
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
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language Distribution - Enhanced Bar Chart with Gradient */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Programming Languages</CardTitle>
              <CardDescription>Most used languages across repositories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.languageStats}>
                  <defs>
                    <linearGradient id="languageGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GRADIENT_COLORS.primary[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={GRADIENT_COLORS.primary[1]} stopOpacity={0.9}/>
                    </linearGradient>
                    <linearGradient id="languageGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GRADIENT_COLORS.success[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={GRADIENT_COLORS.success[1]} stopOpacity={0.9}/>
                    </linearGradient>
                    <linearGradient id="languageGradient3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GRADIENT_COLORS.warning[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={GRADIENT_COLORS.warning[1]} stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
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
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    fill="url(#languageGradient1)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity & Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Repository Activity - Radar Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Repository Activity Radar</CardTitle>
              <CardDescription>Multi-dimensional view of your activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={[
                  {
                    subject: 'Stars',
                    A: stats.totalStars,
                    B: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues),
                    fullMark: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues)
                  },
                  {
                    subject: 'Forks',
                    A: stats.totalForks,
                    B: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues),
                    fullMark: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues)
                  },
                  {
                    subject: 'Issues',
                    A: stats.totalIssues,
                    B: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues),
                    fullMark: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues)
                  },
                  {
                    subject: 'Repos',
                    A: stats.totalRepos,
                    B: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues),
                    fullMark: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues)
                  },
                  {
                    subject: 'Followers',
                    A: stats.userStats.followers,
                    B: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues),
                    fullMark: Math.max(stats.totalStars, stats.totalForks, stats.totalIssues)
                  }
                ]}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, Math.max(stats.totalStars, stats.totalForks, stats.totalIssues)]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    name="Activity"
                    dataKey="A"
                    stroke={GRADIENT_COLORS.primary[0]}
                    fill={GRADIENT_COLORS.primary[0]}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* GitHub Stats - Enhanced Radial Bar Chart */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>GitHub Profile Metrics</CardTitle>
              <CardDescription>Your GitHub profile statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="30%" 
                  outerRadius="90%" 
                  data={[
                    { name: 'Followers', value: stats.userStats.followers, fill: GRADIENT_COLORS.primary[0] },
                    { name: 'Following', value: stats.userStats.following, fill: GRADIENT_COLORS.success[0] },
                    { name: 'Public Gists', value: stats.userStats.public_gists, fill: GRADIENT_COLORS.warning[0] },
                    { name: 'Private Gists', value: stats.userStats.private_gists, fill: GRADIENT_COLORS.danger[0] },
                    { name: 'Public Repos', value: stats.publicRepos, fill: GRADIENT_COLORS.cyan[0] }
                  ]}
                >
                  <RadialBar 
                    background 
                    dataKey="value"
                    label={{ fill: '#fff', fontSize: 11, fontWeight: 'bold' }}
                    cornerRadius={10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Repository Activity Scatter Plot */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.01 }}
          transition={{ delay: 1.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Repository Activity Scatter</CardTitle>
              <CardDescription>Stars vs Forks correlation analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    dataKey="stars" 
                    name="Stars"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    type="number" 
                    dataKey="forks" 
                    name="Forks"
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
                  <Scatter 
                    data={[
                      { stars: stats.totalStars, forks: stats.totalForks, name: 'Total' },
                      { stars: Math.floor(stats.totalStars * 0.8), forks: Math.floor(stats.totalForks * 0.7), name: 'Public' },
                      { stars: Math.floor(stats.totalStars * 0.2), forks: Math.floor(stats.totalForks * 0.3), name: 'Private' }
                    ]} 
                    fill={GRADIENT_COLORS.primary[0]}
                  >
                    {[
                      { stars: stats.totalStars, forks: stats.totalForks, name: 'Total' },
                      { stars: Math.floor(stats.totalStars * 0.8), forks: Math.floor(stats.totalForks * 0.7), name: 'Public' },
                      { stars: Math.floor(stats.totalStars * 0.2), forks: Math.floor(stats.totalForks * 0.3), name: 'Private' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[GRADIENT_COLORS.primary[0], GRADIENT_COLORS.success[0], GRADIENT_COLORS.warning[0]][index]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Language Distribution Treemap */}
        {stats.languageStats.length > 0 && (
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.01 }}
            transition={{ delay: 1.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Language Distribution Treemap</CardTitle>
                <CardDescription>Visual representation of language usage by repository count</CardDescription>
              </CardHeader>
                          <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <Treemap
                    data={stats.languageStats}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="hsl(var(--border))"
                    fill="hsl(var(--primary))"
                  >
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Enhanced Recent Commits */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.01 }}
        transition={{ delay: 1.4 }}
        className="mb-6 md:mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitCommit className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your latest commits across repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCommits.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCommits.map((commit, index) => (
                  <motion.div 
                    key={commit.sha} 
                    variants={commitVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <motion.div 
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            y: [0, -2, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                          {commit.sha.substring(0, 7)}
                        </span>
                        <span className="text-sm font-medium text-primary">
                          {commit.repository.name}
                        </span>
                      </div>
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {formatCommitMessage(commit.commit.message)}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(commit.commit.author.date)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{commit.commit.author.name}</span>
                        </span>
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
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="relative">
                  <GitCommit className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin"></div>
                  </div>
                </div>
                <p className="text-lg font-medium mb-2">No recent commits found</p>
                <p className="text-sm">Commits from the last 30 days will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Star Growth Chart */}
      {stats.starGrowth.length > 0 && (
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.01 }}
          transition={{ delay: 1.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Star Growth Trend</CardTitle>
              <CardDescription>Repository popularity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={stats.starGrowth}>
                  <defs>
                    <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GRADIENT_COLORS.warning[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={GRADIENT_COLORS.warning[1]} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="starLineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={GRADIENT_COLORS.warning[0]}/>
                      <stop offset="100%" stopColor={GRADIENT_COLORS.warning[1]}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
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
                    dataKey="stars" 
                    stroke="url(#starLineGradient)"
                    strokeWidth={3}
                    fill="url(#starGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stars" 
                    stroke="url(#starLineGradient)"
                    strokeWidth={2}
                    dot={{ fill: GRADIENT_COLORS.warning[0], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: GRADIENT_COLORS.warning[0], strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
