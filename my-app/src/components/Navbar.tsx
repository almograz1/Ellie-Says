'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/lib/ThemeContext'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()

  if (!pathname || pathname === '') return null
  if (loading) return null

  const isLoggedIn = !!user
  const hoverAnim = 'transform transition duration-200 ease-out hover:scale-110 hover:animate-pulse hover:opacity-80'

  return (
    <header className="fixed top-0 left-0 w-full bg-purple-700 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className={`flex items-center space-x-2 ${hoverAnim}`}>
          <Image src="/Ellie_icon.png" alt="Ellie Says Avatar" width={40} height={40} className="rounded-full" priority />
          <span className="text-white text-2xl font-extrabold">Ellie Says</span>
        </Link>

        <nav className="hidden md:flex space-x-6">
          {isLoggedIn && (
            <Link href="/profile" className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}>
              My Profile
            </Link>
          )}
          <Link href="/games" className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}>
            Games
          </Link>
          <Link href="/translate" className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}>
            Translate
          </Link>
          <Link href="/contact" className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}>
            Contact Us
          </Link>
        </nav>

        {isLoggedIn ? (
          <button onClick={logout} className={`bg-white text-purple-600 font-bold py-2 px-4 rounded-full cursor-pointer ${hoverAnim}`}>
            Log Out
          </button>
        ) : (
          <Link href="/signin" className={`bg-white text-purple-600 font-bold py-2 px-4 rounded-full cursor-pointer ${hoverAnim}`}>
            Sign In / Sign Up
          </Link>
        )}

        <button
          onClick={() => {
            console.log('[Navbar] Toggle button clicked')
            toggleTheme()
          }}
          className="ml-4 bg-white text-purple-600 font-bold py-2 px-4 rounded-full cursor-pointer"
          aria-label="Toggle light/dark mode"
        >
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </header>
  )
}
