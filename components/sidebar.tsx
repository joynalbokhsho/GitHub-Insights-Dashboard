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
  Download,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useTheme } from '@/components/theme-provider'
import { useState, useEffect } from 'react'
import { useMobile } from '@/lib/hooks/use-mobile'

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
  const { isDark, setTheme } = useTheme()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isMobile } = useMobile()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const SidebarContent = () => (
    <>
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
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-4 space-y-2">
        <Button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          variant="ghost"
          className="w-full justify-start"
        >
          {isDark ? (
            <Sun className="mr-3 h-5 w-5 flex-shrink-0" />
          ) : (
            <Moon className="mr-3 h-5 w-5 flex-shrink-0" />
          )}
          <span className="truncate">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
        
        <Button
          onClick={signOutUser}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b h-16">
          <div className="flex items-center justify-between px-4 py-3 h-full">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
              <h1 className="text-lg font-bold text-primary">GitHub Insights</h1>
            </div>
            {userProfile && (
              <Image
                src={userProfile.avatar}
                alt={userProfile.githubUsername}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </div>

        {/* Mobile Content Padding */}
        <div className="pt-20 md:pt-0" />
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-card border-r">
      <SidebarContent />
    </div>
  )
}
