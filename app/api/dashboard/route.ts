import { NextRequest, NextResponse } from 'next/server'
import { auth, adminDb } from '@/lib/firebase-admin'
import GitHubAPI from '@/lib/github-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

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
    
    if (!githubToken) {
      return NextResponse.json({ error: 'GitHub token not found' }, { status: 401 })
    }

    const githubAPI = new GitHubAPI(githubToken)

    // Validate username (should not contain spaces or special characters)
    if (!username || username.includes(' ') || username.length === 0) {
      return NextResponse.json({ error: 'Invalid GitHub username' }, { status: 400 })
    }

    // Fetch all data in parallel
    const [repositories, userStats, recentCommits] = await Promise.all([
      githubAPI.getUserRepositories(), // Get repositories for authenticated user
      githubAPI.getUserStats(username),
      githubAPI.getRecentCommits(username, 1, 10), // Get recent commits
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

    // Generate star growth data (simplified - you might want to fetch actual historical data)
    const starGrowth = repositories
      .filter(repo => repo.stargazers_count > 0)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((repo, index) => ({
        date: new Date(repo.created_at).toLocaleDateString(),
        stars: repo.stargazers_count,
      }))
      .slice(-10) // Last 10 repositories

    const dashboardStats = {
      totalRepos: repositories.length,
      totalStars,
      totalForks,
      totalIssues,
      publicRepos,
      privateRepos,
      forkedRepos,
      originalRepos,
      languageStats,
      starGrowth,
      recentCommits,
      userStats,
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
