import { NavLink } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { label: 'Generate', to: '/app', end: true },
  { label: 'Saved recipes', to: '/app/recipes', end: false },
]

function AppHeader() {
  const { signOut } = useAuth()

  return (
    <header className="flex flex-col gap-4 rounded-lg border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <span className="text-sm font-semibold text-foreground">
          AI Recipe Generator
        </span>
        <nav className="custom-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1 text-sm sm:flex-wrap sm:overflow-visible sm:pb-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'min-h-10 whitespace-nowrap rounded-md px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Button variant="outline" onClick={signOut} className="w-full sm:w-auto">
        Sign out
      </Button>
    </header>
  )
}

export default AppHeader
