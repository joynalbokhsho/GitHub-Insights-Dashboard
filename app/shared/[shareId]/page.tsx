'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GitCommit, 
  GitPullRequest, 
  AlertCircle,
  Star,
  GitFork,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  Eye,
  ExternalLink,
  Copy,
  CheckCircle,
  MapPin,
  Building,
  Globe,
  Twitter,
  Clock,
  Code,
  Database,
  GitBranch,
  Lock,
  Unlock,
  Archive,
  AlertTriangle,
  Heart,
  MessageSquare,
  GitPullRequestClosed,
  GitMerge
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatNumber, getContributionLevel } from '@/lib/utils'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts'

interface SharedData {
  shareId: string
  username: string
  avatar: string
  type: 'dashboard' | 'repositories' | 'contributions'
  data: any
  createdAt: string
  isPublic: boolean
}

export default function SharedPage() {
  const params = useParams()
  const shareId = params.shareId as string
  const [sharedData, setSharedData] = useState<SharedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchSharedData()
  }, [shareId])

  const fetchSharedData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shared/${shareId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch shared data')
      }
      
      const data = await response.json()
      setSharedData(data)
    } catch (error) {
      setError('Failed to load shared data')
      console.error('Error fetching shared data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 md:h-32 md:w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {error === 'Share not found' ? 'Link Not Found' : 
                 error === 'Share has expired' ? 'Link Expired' :
                 error === 'Share is private' ? 'Private Link' :
                 'Error Loading Data'}
              </h2>
              <p className="text-muted-foreground">
                {error === 'Share not found' ? 'This shared link is invalid or has been removed.' :
                 error === 'Share has expired' ? 'This shared link has expired and is no longer available.' :
                 error === 'Share is private' ? 'This shared link is private and requires authentication.' :
                 'Failed to load the shared data. Please try again later.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={sharedData.avatar} 
                alt={sharedData.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{sharedData.username}</h1>
                <p className="text-muted-foreground">
                  Shared {sharedData.type} • {new Date(sharedData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="flex items-center space-x-2"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://github.com/${sharedData.username}`, '_blank')}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {sharedData.type === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* User Profile Section */}
            {sharedData.data.userProfile && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium text-lg">{sharedData.data.userProfile.name}</h4>
                      {sharedData.data.userProfile.bio && (
                        <p className="text-muted-foreground">{sharedData.data.userProfile.bio}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{formatNumber(sharedData.data.userProfile.followers)} followers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{formatNumber(sharedData.data.userProfile.following)} following</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {sharedData.data.userProfile.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{sharedData.data.userProfile.location}</span>
                        </div>
                      )}
                      {sharedData.data.userProfile.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{sharedData.data.userProfile.company}</span>
                        </div>
                      )}
                      {sharedData.data.userProfile.blog && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a href={sharedData.data.userProfile.blog} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {sharedData.data.userProfile.blog}
                          </a>
                        </div>
                      )}
                      {sharedData.data.userProfile.twitter && (
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-muted-foreground" />
                          <a href={`https://twitter.com/${sharedData.data.userProfile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            @{sharedData.data.userProfile.twitter}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Member since {new Date(sharedData.data.userProfile.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span>{formatNumber(sharedData.data.userProfile.publicRepos)} public repos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span>{formatNumber(sharedData.data.userProfile.publicGists)} public gists</span>
                      </div>
                      {sharedData.data.userProfile.hireable && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Available for hire</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.totalContributions)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    GitHub activity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Repositories</CardTitle>
                  <GitFork className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.totalRepositories)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total repos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stars</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.totalStars)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Received stars
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Forks</CardTitle>
                  <GitFork className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.totalForks)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Repository forks
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Watchers</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.totalWatchers || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total watchers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Code Size</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.totalSize || 0)} MB</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total repository size
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Public Repos</CardTitle>
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.repositoryStats?.public || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Public repositories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Original Repos</CardTitle>
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(sharedData.data.repositoryStats?.original || 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Original repositories
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Weekly Activity</span>
                </CardTitle>
                <CardDescription>Contribution activity over the last 12 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={sharedData.data.weeklyStats}>
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
                      strokeWidth={3}
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

                         {/* Activity Breakdown */}
             <Card className="mb-8">
               <CardHeader>
                 <CardTitle className="flex items-center space-x-2">
                   <BarChart3 className="h-5 w-5" />
                   <span>Activity Breakdown</span>
                 </CardTitle>
                 <CardDescription>Distribution of different contribution types</CardDescription>
               </CardHeader>
               <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                   <RadialBarChart 
                     cx="50%" 
                     cy="50%" 
                     innerRadius="20%" 
                     outerRadius="80%" 
                     data={[
                       { name: 'Commits', value: sharedData.data.activityBreakdown.commits, fill: '#3B82F6' },
                       { name: 'Issues', value: sharedData.data.activityBreakdown.issues, fill: '#F59E0B' },
                       { name: 'Pull Requests', value: sharedData.data.activityBreakdown.pullRequests, fill: '#10B981' }
                     ]}
                     startAngle={180}
                     endAngle={0}
                   >
                     <RadialBar 
                       background 
                       dataKey="value"
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

             {/* Top Languages */}
             {sharedData.data.topLanguages && sharedData.data.topLanguages.length > 0 && (
               <Card className="mb-8">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Code className="h-5 w-5" />
                     Top Programming Languages
                   </CardTitle>
                   <CardDescription>Most used programming languages across repositories</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {sharedData.data.topLanguages.map((lang: any, index: number) => (
                       <div key={lang.language} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-4 h-4 rounded-full bg-primary"></div>
                           <span className="font-medium">{lang.language}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-sm text-muted-foreground">{lang.count} repos</span>
                           <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-primary rounded-full"
                               style={{ width: `${(lang.count / sharedData.data.topLanguages[0].count) * 100}%` }}
                             ></div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* Repository Categories */}
             {sharedData.data.repoCategories && sharedData.data.repoCategories.length > 0 && (
               <Card className="mb-8">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <GitBranch className="h-5 w-5" />
                     Repository Categories
                   </CardTitle>
                   <CardDescription>Projects organized by topics and categories</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {sharedData.data.repoCategories.map((category: any) => (
                       <div key={category.category} className="text-center p-4 border rounded-lg">
                         <div className="text-2xl font-bold text-primary">{category.count}</div>
                         <div className="text-sm text-muted-foreground">{category.category}</div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* Top Repositories */}
             {sharedData.data.topRepositories && sharedData.data.topRepositories.length > 0 && (
               <Card className="mb-8">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Star className="h-5 w-5" />
                     Top Repositories
                   </CardTitle>
                   <CardDescription>Most starred repositories</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     {sharedData.data.topRepositories.map((repo: any) => (
                       <div key={repo.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                         <div className="flex-1">
                           <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-medium">{repo.name}</h4>
                             {repo.private && <Lock className="h-3 w-3 text-muted-foreground" />}
                             {repo.fork && <GitBranch className="h-3 w-3 text-muted-foreground" />}
                           </div>
                           {repo.description && (
                             <p className="text-sm text-muted-foreground mb-2">{repo.description}</p>
                           )}
                           <div className="flex items-center gap-4 text-xs text-muted-foreground">
                             <span>{repo.language}</span>
                             <div className="flex items-center gap-1">
                               <Star className="h-3 w-3" />
                               <span>{formatNumber(repo.stars)}</span>
                             </div>
                             <div className="flex items-center gap-1">
                               <GitFork className="h-3 w-3" />
                               <span>{formatNumber(repo.forks)}</span>
                             </div>
                             <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                           </div>
                           {repo.topics && repo.topics.length > 0 && (
                             <div className="flex flex-wrap gap-1 mt-2">
                               {repo.topics.slice(0, 3).map((topic: string) => (
                                 <span key={topic} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                                   {topic}
                                 </span>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* Recent Activity */}
             {sharedData.data.recentActivity && sharedData.data.recentActivity.length > 0 && (
               <Card className="mb-8">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Activity className="h-5 w-5" />
                     Recent Activity
                   </CardTitle>
                   <CardDescription>Latest commits and contributions</CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-3">
                     {sharedData.data.recentActivity.map((activity: any) => (
                       <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                         <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium truncate">{activity.message}</p>
                           <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                             <span>{activity.repo}</span>
                             <span>{activity.author}</span>
                             <span>{new Date(activity.date).toLocaleDateString()}</span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             )}

             {/* Repository Statistics */}
             <Card className="mb-8">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <BarChart3 className="h-5 w-5" />
                   Repository Statistics
                 </CardTitle>
                 <CardDescription>Detailed breakdown of repository types and status</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="text-center p-4 border rounded-lg">
                     <div className="text-2xl font-bold text-green-600">{sharedData.data.repositoryStats?.public || 0}</div>
                     <div className="text-sm text-muted-foreground">Public</div>
                   </div>
                   <div className="text-center p-4 border rounded-lg">
                     <div className="text-2xl font-bold text-orange-600">{sharedData.data.repositoryStats?.private || 0}</div>
                     <div className="text-sm text-muted-foreground">Private</div>
                   </div>
                   <div className="text-center p-4 border rounded-lg">
                     <div className="text-2xl font-bold text-blue-600">{sharedData.data.repositoryStats?.forked || 0}</div>
                     <div className="text-sm text-muted-foreground">Forked</div>
                   </div>
                   <div className="text-center p-4 border rounded-lg">
                     <div className="text-2xl font-bold text-purple-600">{sharedData.data.repositoryStats?.original || 0}</div>
                     <div className="text-sm text-muted-foreground">Original</div>
                   </div>
                 </div>
                 {(sharedData.data.repositoryStats?.archived || sharedData.data.repositoryStats?.disabled) && (
                   <div className="grid grid-cols-2 gap-4 mt-4">
                     {sharedData.data.repositoryStats.archived > 0 && (
                       <div className="text-center p-4 border rounded-lg">
                         <div className="text-2xl font-bold text-gray-600">{sharedData.data.repositoryStats.archived}</div>
                         <div className="text-sm text-muted-foreground">Archived</div>
                       </div>
                     )}
                     {sharedData.data.repositoryStats.disabled > 0 && (
                       <div className="text-center p-4 border rounded-lg">
                         <div className="text-2xl font-bold text-red-600">{sharedData.data.repositoryStats.disabled}</div>
                         <div className="text-sm text-muted-foreground">Disabled</div>
                       </div>
                     )}
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Private Repository Statistics */}
             {sharedData.data.privateRepoStats && sharedData.data.privateRepoStats.total > 0 && (
               <Card className="mb-8">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <Lock className="h-5 w-5" />
                     Private Repository Statistics
                   </CardTitle>
                   <CardDescription>Aggregated statistics for private repositories (names hidden for privacy)</CardDescription>
                 </CardHeader>
                 <CardContent>
                   {/* Private Repo Overview Stats */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     <div className="text-center p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                       <div className="text-2xl font-bold text-orange-600">{sharedData.data.privateRepoStats.total}</div>
                       <div className="text-sm text-muted-foreground">Total Private</div>
                     </div>
                     <div className="text-center p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                       <div className="text-2xl font-bold text-orange-600">{formatNumber(sharedData.data.privateRepoStats.totalSize || 0)} MB</div>
                       <div className="text-sm text-muted-foreground">Total Size</div>
                     </div>
                     <div className="text-center p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                       <div className="text-2xl font-bold text-orange-600">{formatNumber(sharedData.data.privateRepoStats.totalStars || 0)}</div>
                       <div className="text-sm text-muted-foreground">Total Stars</div>
                     </div>
                     <div className="text-center p-4 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                       <div className="text-2xl font-bold text-orange-600">{formatNumber(sharedData.data.privateRepoStats.totalForks || 0)}</div>
                       <div className="text-sm text-muted-foreground">Total Forks</div>
                     </div>
                   </div>

                   {/* Private Repo Breakdown */}
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                     <div className="text-center p-4 border rounded-lg">
                       <div className="text-2xl font-bold text-blue-600">{sharedData.data.privateRepoStats.original || 0}</div>
                       <div className="text-sm text-muted-foreground">Original</div>
                     </div>
                     <div className="text-center p-4 border rounded-lg">
                       <div className="text-2xl font-bold text-purple-600">{sharedData.data.privateRepoStats.forked || 0}</div>
                       <div className="text-sm text-muted-foreground">Forked</div>
                     </div>
                     {sharedData.data.privateRepoStats.archived > 0 && (
                       <div className="text-center p-4 border rounded-lg">
                         <div className="text-2xl font-bold text-gray-600">{sharedData.data.privateRepoStats.archived}</div>
                         <div className="text-sm text-muted-foreground">Archived</div>
                       </div>
                     )}
                     {sharedData.data.privateRepoStats.disabled > 0 && (
                       <div className="text-center p-4 border rounded-lg">
                         <div className="text-2xl font-bold text-red-600">{sharedData.data.privateRepoStats.disabled}</div>
                         <div className="text-sm text-muted-foreground">Disabled</div>
                       </div>
                     )}
                   </div>

                   {/* Private Repo Languages */}
                   {sharedData.data.privateRepoStats.languages && sharedData.data.privateRepoStats.languages.length > 0 && (
                     <div className="mb-6">
                       <h4 className="font-medium mb-3 flex items-center gap-2">
                         <Code className="h-4 w-4" />
                         Programming Languages Used
                       </h4>
                       <div className="space-y-3">
                         {sharedData.data.privateRepoStats.languages.map((lang: any) => (
                           <div key={lang.language} className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                               <span className="font-medium">{lang.language}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-sm text-muted-foreground">{lang.count} repos</span>
                               <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                 <div 
                                   className="h-full bg-orange-500 rounded-full"
                                   style={{ width: `${(lang.count / sharedData.data.privateRepoStats.languages[0].count) * 100}%` }}
                                 ></div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Private Repo Topics */}
                   {sharedData.data.privateRepoStats.topics && sharedData.data.privateRepoStats.topics.length > 0 && (
                     <div>
                       <h4 className="font-medium mb-3 flex items-center gap-2">
                         <GitBranch className="h-4 w-4" />
                         Project Categories
                       </h4>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {sharedData.data.privateRepoStats.topics.map((topic: any) => (
                           <div key={topic.topic} className="text-center p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                             <div className="text-lg font-bold text-orange-600">{topic.count}</div>
                             <div className="text-xs text-muted-foreground truncate">{topic.topic}</div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </CardContent>
               </Card>
             )}
          </motion.div>
        )}

        {sharedData.type === 'contributions' && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Contribution History</h2>
            <p className="text-muted-foreground">
              Detailed contribution data will be displayed here.
            </p>
          </div>
        )}

        {sharedData.type === 'repositories' && (
          <div className="text-center py-12">
            <GitFork className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Repository Collection</h2>
            <p className="text-muted-foreground">
              Repository list will be displayed here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
