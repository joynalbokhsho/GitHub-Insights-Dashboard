import { NextRequest, NextResponse } from 'next/server'
import { auth, adminDb } from '@/lib/firebase-admin'
import GitHubAPI from '@/lib/github-api'

export async function POST(request: NextRequest) {
  try {
    const { exportType } = await request.json()
    
    // Get user token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user info
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get GitHub token from user profile in Firestore
    const userDocRef = adminDb.collection('users').doc(decodedToken.uid)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    const userData = userDoc.data()
    const githubToken = userData?.githubToken
    const username = userData?.githubUsername
    
    if (!githubToken || !username) {
      return NextResponse.json({ error: 'GitHub token or username not found' }, { status: 401 })
    }

    const githubAPI = new GitHubAPI(githubToken)

    let exportData: any = {}

    switch (exportType) {
      case 'dashboard':
        // Fetch dashboard data
        const [repositories, userStats, recentCommits] = await Promise.all([
          githubAPI.getUserRepositories(),
          githubAPI.getUserStats(username),
          githubAPI.getRecentCommits(username, 1, 10),
        ])

        // Calculate aggregated stats
        const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
        const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0)
        const totalIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0)
        const publicRepos = repositories.filter(repo => !repo.private).length
        const privateRepos = repositories.filter(repo => repo.private).length
        const forkedRepos = repositories.filter(repo => repo.fork).length
        const originalRepos = repositories.filter(repo => !repo.fork).length

        // Calculate language statistics
        const languageMap = new Map<string, number>()
        repositories.forEach(repo => {
          if (repo.language) {
            languageMap.set(repo.language, (languageMap.get(repo.language) || 0) + 1)
          }
        })

        const languageStats = Array.from(languageMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6)

        exportData = {
          type: 'dashboard',
          username,
          generatedAt: new Date().toISOString(),
          stats: {
            totalRepos: repositories.length,
            totalStars,
            totalForks,
            totalIssues,
            publicRepos,
            privateRepos,
            forkedRepos,
            originalRepos,
            followers: userStats.followers,
            following: userStats.following,
            publicGists: userStats.public_gists,
            privateGists: userStats.private_gists,
          },
          languageStats,
          recentCommits: recentCommits.slice(0, 10),
          topRepositories: repositories
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 10)
        }
        break

      case 'repositories':
        // Fetch detailed repository data
        const repos = await githubAPI.getUserRepositories()
        const detailedRepos = repos.map(repo => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          issues: repo.open_issues_count,
          isPrivate: repo.private,
          isFork: repo.fork,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          url: repo.html_url
        }))

        exportData = {
          type: 'repositories',
          username,
          generatedAt: new Date().toISOString(),
          totalRepositories: repos.length,
          repositories: detailedRepos,
          summary: {
            public: repos.filter(r => !r.private).length,
            private: repos.filter(r => r.private).length,
            forks: repos.filter(r => r.fork).length,
            original: repos.filter(r => !r.fork).length,
            totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
            totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
          }
        }
        break

      case 'contributions':
        // Fetch contribution data
        const contributionData = await githubAPI.getContributionData(username)
        const issues = await githubAPI.getUserIssues(username, 1, 20)
        const pullRequests = await githubAPI.getUserPullRequests(username, 1, 20)
        const commits = await githubAPI.getRecentCommits(username, 1, 20)

        exportData = {
          type: 'contributions',
          username,
          generatedAt: new Date().toISOString(),
          totalContributions: contributionData.totalContributions,
          contributionWeeks: contributionData.weeks.slice(-52), // Last 52 weeks
          recentActivity: {
            issues: issues.slice(0, 10),
            pullRequests: pullRequests.slice(0, 10),
            commits: commits.slice(0, 10)
          }
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
