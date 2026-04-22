import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(null)
  const [language, setLanguageState] = useState(() => localStorage.getItem('language') || 'ru')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadContent = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await axiosInstance.get('/content')
      setContent(response.data)
    } catch {
      setError('Не удалось загрузить контент сайта.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = nextLanguage === 'ky' ? 'ky' : 'ru'
    localStorage.setItem('language', normalized)
    setLanguageState(normalized)
  }, [])

  const text = useCallback(
    (value, fallback = '') => {
      if (!value) {
        return fallback
      }

      if (typeof value === 'string') {
        return value || fallback
      }

      return value[language] || value.ru || value.ky || fallback
    },
    [language],
  )

  const value = useMemo(
    () => ({
      content,
      setContent,
      isLoading,
      error,
      reloadContent: loadContent,
      language,
      setLanguage,
      text,
    }),
    [content, isLoading, error, loadContent, language, setLanguage, text],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const context = useContext(ContentContext)

  if (!context) {
    throw new Error('useContent must be used inside ContentProvider')
  }

  return context
}
