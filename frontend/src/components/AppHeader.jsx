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
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold text-foreground">
          AI Recipe Generator
        </span>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1 transition-colors',
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
      <Button variant="outline" onClick={signOut}>
        Sign out
      </Button>
    </header>
  )
}

export default AppHeader
