import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = localStorage.getItem('theme')

  if (savedTheme) {
    return savedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', theme)
  }, [isDark, theme])

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line/60 bg-panel/60 text-text shadow-soft backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
      aria-label={isDark ? 'Включить светлую тему' : 'Включить темную тему'}
      title={isDark ? 'Светлая тема' : 'Темная тема'}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  )
}

export default ThemeToggle
