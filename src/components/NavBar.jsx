import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { ui } from '../utils/i18n'

const navItems = [
  { to: '/', key: 'home' },
  { to: '/about', key: 'about' },
  { to: '/applicants', key: 'applicants' },
  { to: '/students', key: 'students' },
  { to: '/documents', key: 'documents' },
  { to: '/gallery', key: 'gallery' },
  { to: '/news', key: 'news' },
  { to: '/contacts', key: 'contacts' },
]

function NavBar({ onNavigate, mobile = false }) {
  const { content, language, text } = useContent()
  const [isPckOpen, setIsPckOpen] = useState(false)
  const pckItems = content?.pckDirections || []
  const labels = ui[language]

  if (mobile) {
    return (
      <nav className="grid gap-2" aria-label="Основная навигация">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            item={{ ...item, label: labels[item.key] }}
            onNavigate={onNavigate}
            mobile
          />
        ))}
        <div className="rounded-lg border border-line/60 bg-panel/45">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-medium text-muted transition hover:bg-accent/10 hover:text-accent"
            onClick={() => setIsPckOpen((value) => !value)}
          >
            {labels.pck}
            <ChevronDown
              size={18}
              className={isPckOpen ? 'rotate-180 transition' : 'transition'}
            />
          </button>
          {isPckOpen && (
            <div className="grid gap-1 border-t border-line/50 p-2">
              {pckItems.map((item) => (
                <NavLink
                  key={item.slug}
                  to={`/pck/${item.slug}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-accent text-white'
                        : 'text-muted hover:bg-accent/10 hover:text-accent',
                    ].join(' ')
                  }
                >
                  {text(item.title)}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>
    )
  }

  return (
    <nav
      className="hidden items-center gap-1 rounded-lg border border-line/50 bg-panel/45 p-1 backdrop-blur-2xl lg:flex"
      aria-label="Основная навигация"
    >
      {navItems.map((item) => (
        <NavItem key={item.to} item={{ ...item, label: labels[item.key] }} onNavigate={onNavigate} />
      ))}

      <div className="relative" onMouseLeave={() => setIsPckOpen(false)}>
        <button
          type="button"
          className="focus-ring flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted transition duration-300 hover:bg-accent/10 hover:text-accent"
          onClick={() => setIsPckOpen((value) => !value)}
          onMouseEnter={() => setIsPckOpen(true)}
          aria-expanded={isPckOpen}
        >
          {labels.pck} <ChevronDown size={16} />
        </button>

        {isPckOpen && (
          <div className="glass-panel absolute right-0 top-full mt-3 w-80 rounded-lg p-2">
            {pckItems.map((item) => (
              <NavLink
                key={item.slug}
                to={`/pck/${item.slug}`}
                onClick={() => {
                  setIsPckOpen(false)
                  onNavigate?.()
                }}
                className={({ isActive }) =>
                  [
                    'block rounded-lg px-3 py-3 text-sm font-medium leading-5 transition',
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-muted hover:bg-accent/10 hover:text-accent',
                  ].join(' ')
                }
              >
                {text(item.title)}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

function NavItem({ item, onNavigate, mobile = false }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'focus-ring rounded-lg px-4 py-2 text-sm font-medium transition duration-300',
          'hover:bg-accent/10 hover:text-accent',
          mobile ? 'w-full py-3 text-base' : '',
          isActive
            ? 'bg-accent text-white shadow-soft hover:bg-accent hover:text-white'
            : 'text-muted',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  )
}

export default NavBar
