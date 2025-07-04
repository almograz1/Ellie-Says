'use client'

import React from 'react'
import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Navbar from '../components/Navbar'
import { ThemeProvider, useTheme } from '@/lib/ThemeContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

function LayoutBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme } = useTheme()

  React.useEffect(() => {
    console.log('[LayoutBody] Current theme:', theme)
  }, [theme])

  // Gradient and text color classes based on theme
  const gradient =
    theme === 'light'
      ? 'bg-gradient-to-br from-indigo-100 via-pink-200 to-yellow-200 text-gray-900'
      : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900 text-gray-100'

  return (
    <body
      className={`
        ${geistSans.variable} ${geistMono.variable}
        antialiased min-h-screen
        ${gradient}
      `}
    >
      <Navbar />
      <main className={pathname === '/' ? '' : 'pt-16'}>{children}</main>
    </body>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <LayoutBody>{children}</LayoutBody>
      </ThemeProvider>
    </html>
  )
}
