import { NextRequest, NextResponse } from 'next/server'
import { auth, adminDb } from '@/lib/firebase-admin'
import { generateShareId } from '@/lib/utils'

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
    
    // Get user's shares from Firestore
    const sharesQuery = adminDb.collection('shares').where('userId', '==', decodedToken.uid)
    const sharesSnapshot = await sharesQuery.get()
    
    const shares = sharesSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
        expiresAt: data.expiresAt.toDate().toISOString()
      }
    })
    
    return NextResponse.json(shares)
  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user info
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get user profile from Firestore
    const userDocRef = adminDb.collection('users').doc(decodedToken.uid)
    const userDoc = await userDocRef.get()
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    
    const userData = userDoc.data()
    const body = await request.json()
    const { type, isPublic, settings } = body

    const shareId = generateShareId()
    
    // Store share data in Firestore
    const shareData = {
      id: shareId,
      userId: decodedToken.uid,
      username: userData?.githubUsername,
      avatar: userData?.avatar,
      type,
      isPublic: isPublic || false,
      settings: settings || {
        allowComments: false,
        showAnalytics: true,
        autoExpire: true,
        expireDays: 30
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (settings?.expireDays || 30) * 24 * 60 * 60 * 1000),
      viewCount: 0
    }

    // Save to Firestore
    await adminDb.collection('shares').doc(shareId).set(shareData)

    return NextResponse.json({
      shareId,
      shareUrl: `${request.nextUrl.origin}/shared/${shareId}`,
      ...shareData
    })
  } catch (error) {
    console.error('Error creating share:', error)
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    )
  }
}
