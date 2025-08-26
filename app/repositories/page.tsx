'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  GitBranch, 
  Star, 
  GitFork, 
  AlertCircle, 
  Calendar,
  Search,
  Filter
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatNumber, formatDate, formatRelativeTime } from '@/lib/utils'
import { Repository } from '@/lib/github-api'
import toast from 'react-hot-toast'

export default function RepositoriesPage() {
  const { userProfile, user } = useAuth()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('updated')
  const [languageFilter, setLanguageFilter] = useState('all')

  const fetchRepositories = async () => {
    if (!userProfile?.githubUsername || !user) return

    try {
      const idToken = await user.getIdToken()
      const response = await fetch(`/api/repositories`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Ensure data is an array
      const reposArray = Array.isArray(data) ? data : []
      setRepositories(reposArray)
      setFilteredRepos(reposArray)
    } catch (error) {
      console.error('Error fetching repositories:', error)
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('400')) {
        toast.error('Invalid GitHub username. Please check your profile settings.')
      } else {
        toast.error('Failed to fetch repositories. Please try again.')
      }
      // Set empty array on error
      setRepositories([])
      setFilteredRepos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRepositories()
  }, [userProfile])

  useEffect(() => {
    // Start with a shallow copy to avoid mutating original state
    let filtered = [...repositories]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(repo => (repo.language || '').toLowerCase() === languageFilter.toLowerCase())
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count
        case 'forks':
          return b.forks_count - a.forks_count
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredRepos(filtered)
  }, [repositories, searchTerm, sortBy, languageFilter])

  const languages = Array.from(new Set(
    (Array.isArray(repositories) ? repositories : [])
      .map(repo => repo.language || 'Unknown')
      .filter(Boolean)
  ))

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Repositories</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {filteredRepos.length} of {repositories.length} repositories
          </p>
        </div>
        <Button onClick={fetchRepositories} variant="outline" className="w-full sm:w-auto">
          <GitBranch className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map(lang => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently Updated</SelectItem>
            <SelectItem value="stars">Most Stars</SelectItem>
            <SelectItem value="forks">Most Forks</SelectItem>
            <SelectItem value="created">Recently Created</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Repository Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredRepos.map((repo, index) => (
          <motion.div
            key={repo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      <a 
                        href={repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {repo.name}
                      </a>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {repo.description || 'No description available'}
                    </CardDescription>
                  </div>
                  {repo.private && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Private</span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {repo.language && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                      {repo.language}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        <span>{formatNumber(repo.stargazers_count)}</span>
                      </div>
                      <div className="flex items-center">
                        <GitFork className="h-4 w-4 mr-1" />
                        <span>{formatNumber(repo.forks_count)}</span>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{formatNumber(repo.open_issues_count)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Updated {formatRelativeTime(repo.updated_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No repositories found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}
