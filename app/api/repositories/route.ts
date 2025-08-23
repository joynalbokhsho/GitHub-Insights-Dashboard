import { NextRequest, NextResponse } from 'next/server'
import { auth, adminDb } from '@/lib/firebase-admin'
import GitHubAPI from '@/lib/github-api'

export async function GET(request: NextRequest) {
  try {
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
    
    // Fetch repositories for the authenticated user (includes private repos)
    const repositories = await githubAPI.getUserRepositories()

    return NextResponse.json(repositories)
  } catch (error) {
    console.error('Repositories API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}
