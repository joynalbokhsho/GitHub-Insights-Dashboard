import axios from 'axios'

const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'

export interface Repository {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  language: string
  updated_at: string
  created_at: string
  private: boolean
  fork: boolean
  owner: {
    login: string
    avatar_url: string
  }
}

export interface UserStats {
  public_repos: number
  total_private_repos: number
  followers: number
  following: number
  public_gists: number
  private_gists: number
}

export interface ContributionDay {
  date: string
  contributionCount: number
  color: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionData {
  totalContributions: number
  weeks: ContributionWeek[]
}

export interface Issue {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  created_at: string
  updated_at: string
  repository: {
    name: string
    full_name: string
  }
}

export interface PullRequest {
  id: number
  number: number
  title: string
  state: string
  html_url: string
  created_at: string
  updated_at: string
  repository: {
    name: string
    full_name: string
  }
}

export interface Commit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
  repository: {
    name: string
    full_name: string
  }
}

class GitHubAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  private getHeaders() {
    return {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  }

  // Get user repositories (including private ones)
  async getUserRepositories(username?: string, page = 1, per_page = 100): Promise<Repository[]> {
    try {
      // Use /user/repos to get both public and private repositories for the authenticated user
      const response = await axios.get(
        `${GITHUB_API_BASE}/user/repos`,
        {
          headers: this.getHeaders(),
          params: {
            page,
            per_page,
            sort: 'updated',
            direction: 'desc',
            affiliation: 'owner', // Only get repositories owned by the user
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching repositories:', error)
      throw error
    }
  }

  // Get user statistics
  async getUserStats(username: string): Promise<UserStats> {
    try {
      const response = await axios.get(
        `${GITHUB_API_BASE}/users/${username}`,
        {
          headers: this.getHeaders(),
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  }

  // Get contribution data using GraphQL
  async getContributionData(username: string): Promise<ContributionData> {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                }
              }
            }
          }
        }
      }
    `

    try {
      const response = await axios.post(
        GITHUB_GRAPHQL_URL,
        {
          query,
          variables: { username },
        },
        {
          headers: {
            'Authorization': `bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = response.data.data.user.contributionsCollection.contributionCalendar
      return {
        totalContributions: data.totalContributions,
        weeks: data.weeks,
      }
    } catch (error) {
      console.error('Error fetching contribution data:', error)
      throw error
    }
  }

  // Get user issues
  async getUserIssues(username: string, page = 1, per_page = 30): Promise<Issue[]> {
    try {
      const response = await axios.get(
        `${GITHUB_API_BASE}/search/issues`,
        {
          headers: this.getHeaders(),
          params: {
            q: `author:${username} is:issue`,
            page,
            per_page,
            sort: 'updated',
            order: 'desc',
          },
        }
      )
      return response.data.items
    } catch (error) {
      console.error('Error fetching issues:', error)
      throw error
    }
  }

  // Get user pull requests
  async getUserPullRequests(username: string, page = 1, per_page = 30): Promise<PullRequest[]> {
    try {
      const response = await axios.get(
        `${GITHUB_API_BASE}/search/issues`,
        {
          headers: this.getHeaders(),
          params: {
            q: `author:${username} is:pr`,
            page,
            per_page,
            sort: 'updated',
            order: 'desc',
          },
        }
      )
      return response.data.items
    } catch (error) {
      console.error('Error fetching pull requests:', error)
      throw error
    }
  }

  // Get repository statistics
  async getRepositoryStats(owner: string, repo: string) {
    try {
      const [repoData, languages, contributors] = await Promise.all([
        axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
          headers: this.getHeaders(),
        }),
        axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`, {
          headers: this.getHeaders(),
        }),
        axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`, {
          headers: this.getHeaders(),
        }),
      ])

      return {
        repository: repoData.data,
        languages: languages.data,
        contributors: contributors.data,
      }
    } catch (error) {
      console.error('Error fetching repository stats:', error)
      throw error
    }
  }

  // Get recent commits from user's repositories
  async getRecentCommits(username: string, page = 1, per_page = 30): Promise<Commit[]> {
    try {
      // First get user's repositories
      const repos = await this.getUserRepositories(username)
      
      // Get commits from the most recently updated repositories
      const recentRepos = repos
        .filter(repo => !repo.fork) // Only include non-forked repositories
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5) // Get commits from top 5 most recent repos
      
      const commitPromises = recentRepos.map(async (repo) => {
        try {
          const response = await axios.get(
            `${GITHUB_API_BASE}/repos/${repo.full_name}/commits`,
            {
              headers: this.getHeaders(),
              params: {
                author: username,
                page: 1,
                per_page: 10,
                since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
              },
            }
          )
          return response.data.map((commit: any) => ({
            ...commit,
            repository: {
              name: repo.name,
              full_name: repo.full_name,
            },
          }))
        } catch (error) {
          console.error(`Error fetching commits for ${repo.full_name}:`, error)
          return []
        }
      })
      
      const allCommits = await Promise.all(commitPromises)
      const flattenedCommits = allCommits.flat()
      
      // Sort by commit date and return the most recent ones
      return flattenedCommits
        .sort((a, b) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime())
        .slice(0, per_page)
    } catch (error) {
      console.error('Error fetching recent commits:', error)
      throw error
    }
  }

  // Check rate limit
  async checkRateLimit() {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/rate_limit`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error checking rate limit:', error)
      throw error
    }
  }
}

export default GitHubAPI
