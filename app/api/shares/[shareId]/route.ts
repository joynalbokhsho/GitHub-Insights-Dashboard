import { NextRequest, NextResponse } from 'next/server'
import { auth, adminDb } from '@/lib/firebase-admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params
    const body = await request.json()

    // Get user token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user info
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get the share document
    const shareDocRef = adminDb.collection('shares').doc(shareId)
    const shareDoc = await shareDocRef.get()
    
    if (!shareDoc.exists) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }
    
    const shareData = shareDoc.data()
    
    // Check if the user owns this share
    if (shareData?.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (body.type !== undefined) updateData.type = body.type
    if (body.isPublic !== undefined) updateData.isPublic = body.isPublic
    if (body.settings !== undefined) {
      updateData.settings = {
        ...shareData.settings,
        ...body.settings
      }
    }
    
    // Update expiration if autoExpire or expireDays changed
    if (body.settings?.autoExpire !== undefined || body.settings?.expireDays !== undefined) {
      const settings = updateData.settings || shareData.settings
      if (settings.autoExpire) {
        updateData.expiresAt = new Date(Date.now() + (settings.expireDays || 30) * 24 * 60 * 60 * 1000)
      }
    }
    
    // Update the share
    await shareDocRef.update(updateData)
    
    // Get updated document
    const updatedDoc = await shareDocRef.get()
    const updatedData = updatedDoc.data()
    
    return NextResponse.json({
      ...updatedData,
      createdAt: updatedData?.createdAt.toDate().toISOString(),
      expiresAt: updatedData?.expiresAt.toDate().toISOString()
    })
  } catch (error) {
    console.error('Error updating share:', error)
    return NextResponse.json(
      { error: 'Failed to update share' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params

    // Get user token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user info
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get the share document
    const shareDocRef = adminDb.collection('shares').doc(shareId)
    const shareDoc = await shareDocRef.get()
    
    if (!shareDoc.exists) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 })
    }
    
    const shareData = shareDoc.data()
    
    // Check if the user owns this share
    if (shareData?.userId !== decodedToken.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    // Delete the share
    await shareDocRef.delete()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting share:', error)
    return NextResponse.json(
      { error: 'Failed to delete share' },
      { status: 500 }
    )
  }
}
