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
    
    const pullRequests = await githubAPI.getUserPullRequests(username)

    return NextResponse.json(pullRequests)
  } catch (error) {
    console.error('Pull requests API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pull requests' },
      { status: 500 }
    )
  }
}
