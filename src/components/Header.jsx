import { GraduationCap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import LanguageToggle from './LanguageToggle'
import NavBar from './NavBar'
import ThemeToggle from './ThemeToggle'

function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { content, text } = useContent()

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="glass-panel mx-auto max-w-7xl rounded-[25px] px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="focus-ring flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 text-text"
            onClick={() => setIsOpen(false)}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-soft">
              <GraduationCap size={24} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold sm:text-lg">
                {text(content?.site?.name, 'Колледж ИГУ')}
              </span>
              <span className="block truncate text-xs text-muted sm:text-sm">
                {text(content?.site?.tagline, 'Колледж')}
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <NavBar />
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line/60 bg-panel/60 text-text shadow-soft backdrop-blur-xl transition duration-300 hover:border-accent/40 hover:text-accent lg:hidden"
              onClick={() => setIsOpen((value) => !value)}
              aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        <div
          className={[
            'grid overflow-hidden transition-all duration-300 lg:hidden',
            isOpen ? 'grid-rows-[1fr] pt-3 opacity-100' : 'grid-rows-[0fr] opacity-0',
          ].join(' ')}
        >
          <div className="min-h-0">
            <div className="rounded-lg border border-line/50 bg-panel/50 p-2 backdrop-blur-2xl">
              <NavBar mobile onNavigate={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
