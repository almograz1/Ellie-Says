// Theme context for light/dark mode
// - Provides theme state and toggle function
// - Persists theme in localStorage
// - Updates CSS variables on <html> for background/foreground

import React, { createContext, useContext, useState, useEffect } from 'react'

// Theme type: 'light' or 'dark'
type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) setTheme(saved)
  }, [])

  // Save theme to localStorage and update CSS variables on <html>
  useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = document.documentElement

    if (theme === 'dark') {
      root.style.setProperty('--background', '#0a0a0a')
      root.style.setProperty('--foreground', '#ededed')
    } else {
      root.style.setProperty('--background', '#ffffff')
      root.style.setProperty('--foreground', '#171717')
    }
  }, [theme])

  // Toggle between light and dark mode
  function toggleTheme() {
    setTheme(t => (t === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to access theme context
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
