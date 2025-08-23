'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  BarChart3, 
  GitBranch, 
  TrendingUp, 
  Settings, 
  LogOut, 
  User,
  Share2,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Repositories', href: '/repositories', icon: GitBranch },
  { name: 'Contributions', href: '/contributions', icon: TrendingUp },
  { name: 'Export', href: '/export', icon: Download },
  { name: 'Share', href: '/share', icon: Share2 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const { userProfile, signOutUser } = useAuth()
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold text-primary">GitHub Insights</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {userProfile && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Image
                    src={userProfile.avatar}
                    alt={userProfile.githubUsername}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {userProfile.githubUsername}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userProfile.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          onClick={signOutUser}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
