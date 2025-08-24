'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Share2, 
  Link, 
  Copy, 
  Eye, 
  Settings,
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  BarChart3,
  MessageSquare,
  Trash2,
  ExternalLink,
  Clock,
  Edit3
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { generateShareId } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SharePage() {
  const { userProfile, user } = useAuth()
  const [shareId, setShareId] = useState('')
  const [copied, setCopied] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [shareSettings, setShareSettings] = useState({
    allowComments: false,
    showAnalytics: true,
    autoExpire: true,
    expireDays: 30
  })
  const [userShares, setUserShares] = useState<any[]>([])
  const [loadingShares, setLoadingShares] = useState(false)
  const [editingShare, setEditingShare] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch user's existing shares
  const fetchUserShares = async () => {
    try {
      setLoadingShares(true)
      const idToken = await user?.getIdToken()
      if (!idToken) return

      const response = await fetch('/api/shares', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })

      if (response.ok) {
        const shares = await response.json()
        setUserShares(shares)
      }
    } catch (error) {
      console.error('Error fetching shares:', error)
    } finally {
      setLoadingShares(false)
    }
  }

  // Delete a share
  const deleteShare = async (shareId: string) => {
    try {
      const idToken = await user?.getIdToken()
      if (!idToken) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/shares/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })

      if (response.ok) {
        setUserShares(prev => prev.filter(share => share.id !== shareId))
        if (shareId === shareId) {
          setShareId('')
        }
        toast.success('Share link deleted successfully!')
      } else {
        throw new Error('Failed to delete share')
      }
    } catch (error) {
      console.error('Error deleting share:', error)
      toast.error('Failed to delete share link')
    }
  }

  // Edit a share
  const editShare = async (shareId: string, updatedData: any) => {
    try {
      const idToken = await user?.getIdToken()
      if (!idToken) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/shares/${shareId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        const updatedShare = await response.json()
        setUserShares(prev => prev.map(share => 
          share.id === shareId ? { ...share, ...updatedShare } : share
        ))
        toast.success('Share link updated successfully!')
        setShowEditModal(false)
        setEditingShare(null)
      } else {
        throw new Error('Failed to update share')
      }
    } catch (error) {
      console.error('Error updating share:', error)
      toast.error('Failed to update share link')
    }
  }

  // Open edit modal
  const openEditModal = (share: any) => {
    setEditingShare(share)
    setShowEditModal(true)
  }

  useEffect(() => {
    if (user) {
      fetchUserShares()
    }
  }, [user])

  const generateShareLink = async () => {
    try {
      setGenerating(true)
      
      // Get user token for authentication
      const idToken = await user?.getIdToken()
      if (!idToken) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          type: 'dashboard',
          isPublic,
          settings: shareSettings
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create share')
      }

             const result = await response.json()
       setShareId(result.shareId)
       setCopied(false)
       toast.success('Share link generated successfully!')
       // Refresh the shares list
       await fetchUserShares()
    } catch (error) {
      console.error('Error generating share link:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate share link')
      // Fallback to local generation
      const newShareId = generateShareId()
      setShareId(newShareId)
      setCopied(false)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (!shareId) return
    
    try {
      const shareUrl = `${window.location.origin}/shared/${shareId}`
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const shareOptions = [
    {
      id: 'dashboard',
      title: 'Dashboard Overview',
      description: 'Share your main dashboard with key metrics',
      icon: Eye,
    },
    {
      id: 'repositories',
      title: 'Repository List',
      description: 'Share your repository collection',
      icon: Link,
    },
    {
      id: 'contributions',
      title: 'Contribution History',
      description: 'Share your GitHub activity',
      icon: Share2,
    },
  ]

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Share Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Create public links to share your GitHub insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Share Options</CardTitle>
              <CardDescription>
                Choose what you want to share
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shareOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-medium">{option.title}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                )
              })}
              
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="public" className="text-sm">
                  Make this link publicly accessible
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Generated Link</CardTitle>
              <CardDescription>
                Share this link with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {shareId ? (
                <>
                  <div className="flex space-x-2">
                    <Input
                      value={`${window.location.origin}/shared/${shareId}`}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      {isPublic 
                        ? 'This link is publicly accessible'
                        : 'This link requires authentication'
                      }
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Generate a share link to get started
                  </p>
                </div>
              )}
              
                             <Button 
                 onClick={generateShareLink}
                 className="w-full"
                 size="lg"
                 disabled={generating}
               >
                 <Link className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                 {generating ? 'Generating...' : 'Generate Share Link'}
               </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Share Settings</CardTitle>
            <CardDescription>
              Manage your shared links and privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                             <div className="flex items-center justify-between">
                 <div>
                   <h4 className="font-medium">Privacy</h4>
                   <p className="text-sm text-muted-foreground">
                     Control who can access your shared dashboard
                   </p>
                 </div>
                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => setShowSettings(true)}
                 >
                   <Settings className="mr-2 h-4 w-4" />
                   Settings
                 </Button>
               </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• Shared links are read-only</p>
                <p>• You can revoke access at any time</p>
                <p>• Analytics are available for shared views</p>
              </div>
            </div>
          </CardContent>
                 </Card>
       </motion.div>

       {/* User's Generated Shares */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, delay: 0.6 }}
         className="mt-8"
       >
         <Card>
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Link className="h-5 w-5" />
               Your Generated Links
             </CardTitle>
             <CardDescription>
               Manage and delete your shared links
             </CardDescription>
           </CardHeader>
           <CardContent>
             {loadingShares ? (
               <div className="flex items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
               </div>
             ) : userShares.length > 0 ? (
               <div className="space-y-4">
                 {userShares.map((share) => (
                   <div
                     key={share.id}
                     className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                   >
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3">
                         <div className="flex-shrink-0">
                           <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                             <Eye className="h-5 w-5 text-primary" />
                           </div>
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                             <p className="font-medium truncate">
                               {share.type === 'dashboard' ? 'Dashboard Overview' : 
                                share.type === 'repositories' ? 'Repository List' : 
                                share.type === 'contributions' ? 'Contribution History' : 
                                'Unknown Type'}
                             </p>
                             <span className={`px-2 py-1 text-xs rounded-full ${
                               share.isPublic 
                                 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                 : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                             }`}>
                               {share.isPublic ? 'Public' : 'Private'}
                             </span>
                           </div>
                           <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                             <span className="truncate">
                               {`${window.location.origin}/shared/${share.id}`}
                             </span>
                             <div className="flex items-center gap-1">
                               <Eye className="h-3 w-3" />
                               <span>{share.viewCount || 0} views</span>
                             </div>
                             <div className="flex items-center gap-1">
                               <Clock className="h-3 w-3" />
                               <span>{new Date(share.createdAt).toLocaleDateString()}</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                                           <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/shared/${share.id}`)
                            toast.success('Link copied to clipboard!')
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/shared/${share.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(share)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteShare(share.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8">
                 <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                 <p className="text-muted-foreground">
                   No shared links yet. Generate your first share link above.
                 </p>
               </div>
             )}
           </CardContent>
         </Card>
       </motion.div>

       {/* Settings Modal */}
       {showSettings && (
         <div 
           className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
           onClick={() => setShowSettings(false)}
         >
                        <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}
             >
             <div className="flex items-center justify-between p-6 border-b">
               <h2 className="text-xl font-semibold">Share Settings</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setShowSettings(false)}
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             <div className="p-6 space-y-6">
               {/* Privacy Settings */}
               <div className="space-y-4">
                 <h3 className="font-medium flex items-center gap-2">
                   <Eye className="h-4 w-4" />
                   Privacy Settings
                 </h3>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-medium">Public Access</p>
                       <p className="text-sm text-muted-foreground">
                         Allow anyone to view this shared link
                       </p>
                     </div>
                     <input
                       type="checkbox"
                       checked={isPublic}
                       onChange={(e) => setIsPublic(e.target.checked)}
                       className="rounded"
                     />
                   </div>
                 </div>
               </div>

               {/* Analytics Settings */}
               <div className="space-y-4">
                 <h3 className="font-medium flex items-center gap-2">
                   <BarChart3 className="h-4 w-4" />
                   Analytics
                 </h3>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-medium">Show Analytics</p>
                       <p className="text-sm text-muted-foreground">
                         Track views and engagement
                       </p>
                     </div>
                     <input
                       type="checkbox"
                       checked={shareSettings.showAnalytics}
                       onChange={(e) => setShareSettings(prev => ({
                         ...prev,
                         showAnalytics: e.target.checked
                       }))}
                       className="rounded"
                     />
                   </div>
                 </div>
               </div>

               {/* Expiration Settings */}
               <div className="space-y-4">
                 <h3 className="font-medium flex items-center gap-2">
                   <Calendar className="h-4 w-4" />
                   Expiration
                 </h3>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-medium">Auto Expire</p>
                       <p className="text-sm text-muted-foreground">
                         Automatically expire shared links
                       </p>
                     </div>
                     <input
                       type="checkbox"
                       checked={shareSettings.autoExpire}
                       onChange={(e) => setShareSettings(prev => ({
                         ...prev,
                         autoExpire: e.target.checked
                       }))}
                       className="rounded"
                     />
                   </div>
                   {shareSettings.autoExpire && (
                     <div className="space-y-2">
                       <label className="text-sm font-medium">Expire after (days)</label>
                       <input
                         type="number"
                         min="1"
                         max="365"
                         value={shareSettings.expireDays}
                         onChange={(e) => setShareSettings(prev => ({
                           ...prev,
                           expireDays: parseInt(e.target.value) || 30
                         }))}
                         className="w-full px-3 py-2 border rounded-md"
                       />
                     </div>
                   )}
                 </div>
               </div>

               {/* Comments Settings */}
               <div className="space-y-4">
                 <h3 className="font-medium flex items-center gap-2">
                   <MessageSquare className="h-4 w-4" />
                   Comments
                 </h3>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="font-medium">Allow Comments</p>
                       <p className="text-sm text-muted-foreground">
                         Let viewers leave comments
                       </p>
                     </div>
                     <input
                       type="checkbox"
                       checked={shareSettings.allowComments}
                       onChange={(e) => setShareSettings(prev => ({
                         ...prev,
                         allowComments: e.target.checked
                       }))}
                       className="rounded"
                     />
                   </div>
                 </div>
               </div>
             </div>

             <div className="flex items-center justify-end gap-3 p-6 border-t">
               <Button
                 variant="outline"
                 onClick={() => setShowSettings(false)}
               >
                 Cancel
               </Button>
               <Button
                 onClick={() => {
                   setShowSettings(false)
                   toast.success('Settings saved successfully!')
                 }}
               >
                 Save Settings
               </Button>
             </div>
           </motion.div>
         </div>
       )}

       {/* Edit Share Modal */}
       {showEditModal && editingShare && (
         <div 
           className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
           onClick={() => {
             setShowEditModal(false)
             setEditingShare(null)
           }}
         >
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="flex items-center justify-between p-6 border-b">
               <h2 className="text-xl font-semibold">Edit Share Link</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => {
                   setShowEditModal(false)
                   setEditingShare(null)
                 }}
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             
             <EditShareForm 
               share={editingShare}
               onSave={editShare}
               onCancel={() => {
                 setShowEditModal(false)
                 setEditingShare(null)
               }}
             />
           </motion.div>
         </div>
       )}
     </div>
   )
 }

// Edit Share Form Component
function EditShareForm({ share, onSave, onCancel }: { 
  share: any, 
  onSave: (shareId: string, data: any) => Promise<void>, 
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    type: share.type || 'dashboard',
    isPublic: share.isPublic || false,
    settings: {
      allowComments: share.settings?.allowComments || false,
      showAnalytics: share.settings?.showAnalytics ?? true,
      autoExpire: share.settings?.autoExpire ?? true,
      expireDays: share.settings?.expireDays || 30
    }
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(share.id, formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Share Type */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Share Type
        </h3>
        <div className="space-y-3">
          {[
            { id: 'dashboard', title: 'Dashboard Overview', description: 'Share your main dashboard with key metrics' },
            { id: 'repositories', title: 'Repository List', description: 'Share your repository collection' },
            { id: 'contributions', title: 'Contribution History', description: 'Share your GitHub activity' }
          ].map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`type-${option.id}`}
                name="type"
                value={option.id}
                checked={formData.type === option.id}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="rounded"
              />
              <label htmlFor={`type-${option.id}`} className="flex-1">
                <div className="font-medium">{option.title}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Privacy Settings
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Access</p>
              <p className="text-sm text-muted-foreground">
                Allow anyone to view this shared link
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      {/* Analytics Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Analytics</p>
              <p className="text-sm text-muted-foreground">
                Track views and engagement
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.settings.showAnalytics}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, showAnalytics: e.target.checked }
              }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      {/* Expiration Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Expiration
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Expire</p>
              <p className="text-sm text-muted-foreground">
                Automatically expire shared links
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.settings.autoExpire}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, autoExpire: e.target.checked }
              }))}
              className="rounded"
            />
          </div>
          {formData.settings.autoExpire && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Expire after (days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.settings.expireDays}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, expireDays: parseInt(e.target.value) || 30 }
                }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Comments Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Comments</p>
              <p className="text-sm text-muted-foreground">
                Let viewers leave comments
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.settings.allowComments}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                settings: { ...prev.settings, allowComments: e.target.checked }
              }))}
              className="rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
 }
