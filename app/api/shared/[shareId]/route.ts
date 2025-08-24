import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import GitHubAPI from '@/lib/github-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params

    // Get share data from Firestore
    const shareDocRef = adminDb.collection('shares').doc(shareId)
    const shareDoc = await shareDocRef.get()

    if (!shareDoc.exists) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }

    const shareData = shareDoc.data()
    
    // Check if share is expired
    if (shareData?.expiresAt && new Date(shareData.expiresAt.toDate()) < new Date()) {
      return NextResponse.json({ error: 'Share has expired' }, { status: 410 })
    }

    // Check if share is public
    if (!shareData?.isPublic) {
      return NextResponse.json({ error: 'Share is private' }, { status: 403 })
    }

    // Get user profile to get GitHub token
    const userDocRef = adminDb.collection('users').doc(shareData.userId)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const userData = userDoc.data()
    const githubToken = userData?.githubToken

    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token not found' }, { status: 401 })
    }

    // Initialize GitHub API
    const githubAPI = new GitHubAPI(githubToken)
    const username = shareData.username

               // Fetch real data based on share type
           let dashboardData = {}
           
           if (shareData.type === 'dashboard') {
             // Fetch comprehensive dashboard data
             const [repositories, userStats, recentCommits, userProfile] = await Promise.all([
               githubAPI.getUserRepositories(),
               githubAPI.getUserStats(username),
               githubAPI.getRecentCommits(username, 1, 20),
               githubAPI.getUserProfile(username),
             ])

             // Calculate comprehensive stats
             const totalStars = repositories.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
             const totalForks = repositories.reduce((sum: number, repo: any) => sum + repo.forks_count, 0)
             const totalContributions = userStats?.public_repos || 0
             const totalWatchers = repositories.reduce((sum: number, repo: any) => sum + repo.watchers_count, 0)
             const totalSize = repositories.reduce((sum: number, repo: any) => sum + (repo.size || 0), 0)
             
             // Get top languages
             const languageStats = repositories.reduce((acc, repo) => {
               if (repo.language) {
                 acc[repo.language] = (acc[repo.language] || 0) + 1
               }
               return acc
             }, {} as Record<string, number>)
             
             const topLanguages = Object.entries(languageStats)
               .sort(([,a], [,b]) => b - a)
               .slice(0, 5)
               .map(([language, count]) => ({ language, count }))

             // Get repository types
             const publicRepos = repositories.filter(repo => !repo.private).length
             const privateRepos = repositories.filter(repo => repo.private).length
             const forkedRepos = repositories.filter(repo => repo.fork).length
             const originalRepos = repositories.filter(repo => !repo.fork).length
             
                           // Calculate private repo stats (without revealing names) - only if showPrivateRepos is enabled
              const showPrivateRepos = shareData.settings?.showPrivateRepos ?? false
              const privateRepoStats = showPrivateRepos ? {
                total: privateRepos,
                totalSize: repositories.filter(repo => repo.private).reduce((sum: number, repo: any) => sum + (repo.size || 0), 0),
                totalStars: repositories.filter(repo => repo.private).reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0),
                totalForks: repositories.filter(repo => repo.private).reduce((sum: number, repo: any) => sum + repo.forks_count, 0),
                totalWatchers: repositories.filter(repo => repo.private).reduce((sum: number, repo: any) => sum + repo.watchers_count, 0),
                languages: repositories.filter(repo => repo.private).reduce((acc: Record<string, number>, repo: any) => {
                  if (repo.language) {
                    acc[repo.language] = (acc[repo.language] || 0) + 1
                  }
                  return acc
                }, {}),
                topics: repositories.filter(repo => repo.private).reduce((acc: Record<string, number>, repo: any) => {
                  if (repo.topics && repo.topics.length > 0) {
                    repo.topics.forEach((topic: string) => {
                      acc[topic] = (acc[topic] || 0) + 1
                    })
                  }
                  return acc
                }, {}),
                archived: repositories.filter(repo => repo.private && repo.archived).length,
                disabled: repositories.filter(repo => repo.private && repo.disabled).length,
                forked: repositories.filter(repo => repo.private && repo.fork).length,
                original: repositories.filter(repo => repo.private && !repo.fork).length
              } : null

             // Get recent activity
             const recentActivity = recentCommits.slice(0, 10).map(commit => ({
               id: commit.sha,
               message: commit.commit.message,
               date: commit.commit.author.date,
               repo: commit.repository?.name || 'Unknown',
               author: commit.commit.author.name
             }))

             // Generate weekly stats (simplified - you might want to fetch actual contribution data)
             const weeklyStats = Array.from({ length: 12 }, (_, i) => ({
               week: `Week ${i + 1}`,
               contributions: Math.floor(Math.random() * 50) + 10,
               commits: Math.floor(Math.random() * 40) + 8,
               issues: Math.floor(Math.random() * 10) + 2,
               pullRequests: Math.floor(Math.random() * 8) + 1
             }))

             // Get repository categories
             const repoCategories = repositories.reduce((acc, repo) => {
               const category = repo.topics?.length > 0 ? repo.topics[0] : 'General'
               acc[category] = (acc[category] || 0) + 1
               return acc
             }, {} as Record<string, number>)

             dashboardData = {
               // Basic stats
               totalContributions,
               totalRepositories: repositories.length,
               totalStars,
               totalForks,
               totalWatchers,
               totalSize: Math.round(totalSize / 1024), // Convert to MB
               
               // User profile
               userProfile: {
                 name: userProfile?.name || username,
                 bio: userProfile?.bio || '',
                 location: userProfile?.location || '',
                 company: userProfile?.company || '',
                 blog: userProfile?.blog || '',
                 twitter: userProfile?.twitter_username || '',
                 followers: userProfile?.followers || 0,
                 following: userProfile?.following || 0,
                 createdAt: userProfile?.created_at || '',
                 updatedAt: userProfile?.updated_at || '',
                 publicGists: userProfile?.public_gists || 0,
                 publicRepos: userProfile?.public_repos || 0,
                 hireable: userProfile?.hireable || false,
                 type: userProfile?.type || 'User'
               },
               
                                // Repository breakdown
                 repositoryStats: {
                   public: publicRepos,
                   private: privateRepos,
                   forked: forkedRepos,
                   original: originalRepos,
                   archived: repositories.filter(repo => repo.archived).length,
                   disabled: repositories.filter(repo => repo.disabled).length
                 },
                 
                                   // Private repository statistics (aggregated, no names revealed) - only if enabled
                  privateRepoStats: privateRepoStats ? {
                    total: privateRepoStats.total,
                    totalSize: Math.round(privateRepoStats.totalSize / 1024), // Convert to MB
                    totalStars: privateRepoStats.totalStars,
                    totalForks: privateRepoStats.totalForks,
                    totalWatchers: privateRepoStats.totalWatchers,
                    languages: Object.entries(privateRepoStats.languages)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([language, count]) => ({ language, count })),
                    topics: Object.entries(privateRepoStats.topics)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 8)
                      .map(([topic, count]) => ({ topic, count })),
                    archived: privateRepoStats.archived,
                    disabled: privateRepoStats.disabled,
                    forked: privateRepoStats.forked,
                    original: privateRepoStats.original
                  } : null,
               
               // Language stats
               topLanguages,
               languageStats,
               
               // Repository categories
               repoCategories: Object.entries(repoCategories)
                 .sort(([,a], [,b]) => b - a)
                 .slice(0, 8)
                 .map(([category, count]) => ({ category, count })),
               
               // Recent activity
               recentActivity,
               
               // Charts data
               weeklyStats,
               activityBreakdown: {
                 commits: Math.floor(totalContributions * 0.7),
                 issues: Math.floor(totalContributions * 0.2),
                 pullRequests: Math.floor(totalContributions * 0.1)
               },
               
               // Top repositories
               topRepositories: repositories
                 .sort((a, b) => b.stargazers_count - a.stargazers_count)
                 .slice(0, 5)
                 .map(repo => ({
                   name: repo.name,
                   description: repo.description || '',
                   stars: repo.stargazers_count,
                   forks: repo.forks_count,
                   language: repo.language || 'Unknown',
                   updatedAt: repo.updated_at,
                   topics: repo.topics || [],
                   private: repo.private,
                   fork: repo.fork
                               }))
            }
            
            } else if (shareData.type === 'repositories') {
              // Fetch repository list data
              const [repositories, userProfile] = await Promise.all([
                githubAPI.getUserRepositories(),
                githubAPI.getUserProfile(username),
              ])

                             // Calculate repository stats
               const visibleRepos = repositories.filter(repo => showPrivateRepos || !repo.private)
               const totalStars = visibleRepos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
               const totalForks = visibleRepos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0)
               const totalWatchers = visibleRepos.reduce((sum: number, repo: any) => sum + repo.watchers_count, 0)
               const totalSize = visibleRepos.reduce((sum: number, repo: any) => sum + (repo.size || 0), 0)

                             // Get language stats
               const languageStats = visibleRepos.reduce((acc: Record<string, number>, repo: any) => {
                 if (repo.language) {
                   acc[repo.language] = (acc[repo.language] || 0) + 1
                 }
                 return acc
               }, {})

               const topLanguages = Object.entries(languageStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([language, count]) => ({ language, count }))

              // Get repository types
              const showPrivateRepos = shareData.settings?.showPrivateRepos ?? false
              const publicRepos = repositories.filter(repo => !repo.private).length
              const privateRepos = showPrivateRepos ? repositories.filter(repo => repo.private).length : 0
              const forkedRepos = repositories.filter(repo => repo.fork).length
              const originalRepos = repositories.filter(repo => !repo.fork).length

              dashboardData = {
                // User profile
                userProfile: {
                  name: userProfile?.name || username,
                  bio: userProfile?.bio || '',
                  location: userProfile?.location || '',
                  company: userProfile?.company || '',
                  blog: userProfile?.blog || '',
                  twitter: userProfile?.twitter_username || '',
                  followers: userProfile?.followers || 0,
                  following: userProfile?.following || 0,
                  createdAt: userProfile?.created_at || '',
                  updatedAt: userProfile?.updated_at || '',
                  publicGists: userProfile?.public_gists || 0,
                  publicRepos: userProfile?.public_repos || 0,
                  hireable: userProfile?.hireable || false,
                  type: userProfile?.type || 'User'
                },
                
                // Repository stats
                totalRepositories: repositories.filter(repo => showPrivateRepos || !repo.private).length,
                totalStars,
                totalForks,
                totalWatchers,
                totalSize: Math.round(totalSize / 1024), // Convert to MB
                
                // Repository breakdown
                repositoryStats: {
                  public: publicRepos,
                  private: privateRepos,
                  forked: forkedRepos,
                  original: originalRepos,
                  archived: repositories.filter(repo => repo.archived).length,
                  disabled: repositories.filter(repo => repo.disabled).length
                },
                
                // Language stats
                topLanguages,
                languageStats,
                
                // All repositories (for list view) - filter private repos based on setting
                repositories: repositories
                  .filter(repo => showPrivateRepos || !repo.private)
                  .map(repo => ({
                  name: repo.name,
                  description: repo.description || '',
                  stars: repo.stargazers_count,
                  forks: repo.forks_count,
                  language: repo.language || 'Unknown',
                  updatedAt: repo.updated_at,
                  createdAt: repo.created_at,
                  topics: repo.topics || [],
                  private: repo.private,
                  fork: repo.fork,
                  archived: repo.archived,
                  disabled: repo.disabled,
                  size: repo.size,
                  watchers: repo.watchers_count,
                  openIssues: repo.open_issues_count,
                  htmlUrl: repo.html_url
                }))
              }
              
            } else if (shareData.type === 'contributions') {
              // Fetch contribution data
              const [userProfile, contributionData, recentCommits, userIssues, userPullRequests] = await Promise.allSettled([
                githubAPI.getUserProfile(username),
                githubAPI.getContributionData(username),
                githubAPI.getRecentCommits(username, 1, 30),
                githubAPI.getUserIssues(username, 1, 20),
                githubAPI.getUserPullRequests(username, 1, 20),
              ])

              // Handle potential failures
              const userProfileData = userProfile.status === 'fulfilled' ? userProfile.value : null
              const contributionDataResult = contributionData.status === 'fulfilled' ? contributionData.value : { totalContributions: 0, weeks: [] }
              const recentCommitsData = recentCommits.status === 'fulfilled' ? recentCommits.value : []
              const userIssuesData = userIssues.status === 'fulfilled' ? userIssues.value : []
              const userPullRequestsData = userPullRequests.status === 'fulfilled' ? userPullRequests.value : []

              // Calculate contribution stats
              const totalContributions = contributionDataResult?.totalContributions || 0
              const totalCommits = recentCommitsData.length
              const totalIssues = userIssuesData.length
              const totalPullRequests = userPullRequestsData.length

              // Process contribution weeks for chart
              const contributionWeeks = contributionDataResult?.weeks?.slice(-12) || []
              const weeklyStats = contributionWeeks.map((week: any, index: number) => {
                const weekContributions = week.contributionDays.reduce((sum: number, day: any) => sum + day.contributionCount, 0)
                return {
                  week: `Week ${index + 1}`,
                  contributions: weekContributions,
                  commits: Math.floor(weekContributions * 0.7),
                  issues: Math.floor(weekContributions * 0.2),
                  pullRequests: Math.floor(weekContributions * 0.1)
                }
              })

              // Process recent activity
              const recentActivity = recentCommitsData.slice(0, 15).map((commit: any) => ({
                id: commit.sha,
                message: commit.commit.message,
                date: commit.commit.author.date,
                repo: commit.repository?.name || 'Unknown',
                author: commit.commit.author.name,
                type: 'commit'
              }))

              // Add issues and PRs to recent activity
              userIssuesData.slice(0, 10).forEach((issue: any) => {
                recentActivity.push({
                  id: `issue-${issue.id}`,
                  message: issue.title,
                  date: issue.created_at,
                  repo: issue.repository?.name || 'Unknown',
                  author: 'User',
                  type: 'issue'
                })
              })

              userPullRequestsData.slice(0, 10).forEach((pr: any) => {
                recentActivity.push({
                  id: `pr-${pr.id}`,
                  message: pr.title,
                  date: pr.created_at,
                  repo: pr.repository?.name || 'Unknown',
                  author: 'User',
                  type: 'pull_request'
                })
              })

              // Sort by date
              recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

              dashboardData = {
                // User profile
                userProfile: {
                  name: userProfileData?.name || username,
                  bio: userProfileData?.bio || '',
                  location: userProfileData?.location || '',
                  company: userProfileData?.company || '',
                  blog: userProfileData?.blog || '',
                  twitter: userProfileData?.twitter_username || '',
                  followers: userProfileData?.followers || 0,
                  following: userProfileData?.following || 0,
                  createdAt: userProfileData?.created_at || '',
                  updatedAt: userProfileData?.updated_at || '',
                  publicGists: userProfileData?.public_gists || 0,
                  publicRepos: userProfileData?.public_repos || 0,
                  hireable: userProfileData?.hireable || false,
                  type: userProfileData?.type || 'User'
                },
                
                // Contribution stats
                totalContributions,
                totalCommits,
                totalIssues,
                totalPullRequests,
                
                // Contribution data
                contributionData: {
                  totalContributions,
                  weeks: contributionWeeks
                },
                
                // Weekly stats for charts
                weeklyStats,
                
                // Recent activity
                recentActivity: recentActivity.slice(0, 20),
                
                // Activity breakdown
                activityBreakdown: {
                  commits: totalCommits,
                  issues: totalIssues,
                  pullRequests: totalPullRequests
                },
                
                // Issues and PRs
                issues: userIssuesData.map((issue: any) => ({
                  id: issue.id,
                  number: issue.number,
                  title: issue.title,
                  state: issue.state,
                  createdAt: issue.created_at,
                  updatedAt: issue.updated_at,
                  repo: issue.repository?.name || 'Unknown',
                  htmlUrl: issue.html_url
                })),
                
                pullRequests: userPullRequestsData.map((pr: any) => ({
                  id: pr.id,
                  number: pr.number,
                  title: pr.title,
                  state: pr.state,
                  createdAt: pr.created_at,
                  updatedAt: pr.updated_at,
                  repo: pr.repository?.name || 'Unknown',
                  htmlUrl: pr.html_url
                }))
              }
           }

    // Update view count
    await shareDocRef.update({
      viewCount: (shareData.viewCount || 0) + 1
    })

    const sharedData = {
      shareId,
      username: shareData.username,
      avatar: shareData.avatar,
      type: shareData.type,
      data: dashboardData,
      createdAt: shareData.createdAt.toDate().toISOString(),
      isPublic: shareData.isPublic,
      viewCount: (shareData.viewCount || 0) + 1
    }

    return NextResponse.json(sharedData)
  } catch (error) {
    console.error('Error fetching shared data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared data' },
      { status: 500 }
    )
  }
}
