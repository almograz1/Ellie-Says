'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/lib/ThemeContext'
import { useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!pathname || pathname === '/') return null
  if (loading) return null

  const isLoggedIn = !!user
  const hoverAnim = 'transform transition duration-200 ease-out hover:scale-110 hover:animate-pulse hover:opacity-80'

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
      <header className={`fixed top-0 left-0 w-full z-50 ${
          theme === 'light'
              ? 'bg-purple-700'
              : 'bg-gray-900 border-b border-purple-500/30'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className={`flex items-center space-x-2 ${hoverAnim}`}>
            <Image
                src="/Ellie_icon.png"
                alt="Ellie Says Avatar"
                width={40}
                height={40}
                className="rounded-full"
                priority
            />
            <span className="text-white text-2xl font-extrabold">Ellie Says</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            {isLoggedIn && (
                <Link
                    href="/profile"
                    className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}
                >
                  My Profile
                </Link>
            )}
            <Link
                href="/games"
                className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}
            >
              Games
            </Link>
            <Link
                href="/translate"
                className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}
            >
              Translate
            </Link>
            <Link
                href="/contact"
                className={`text-white font-bold hover:text-yellow-200 ${hoverAnim}`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
                onClick={() => {
                  console.log('[Navbar] Toggle button clicked')
                  toggleTheme()
                }}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    theme === 'light'
                        ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-800'
                        : 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
                }`}
                aria-label="Toggle light/dark mode"
            >
            <span className="text-xl">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            </button>

            {/* Desktop Auth Button */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                  <button
                      onClick={logout}
                      className={`bg-white text-purple-600 font-bold py-2 px-4 rounded-full transition-all duration-200 hover:bg-gray-100 hover:scale-105 hover:shadow-lg`}
                  >
                    Log Out
                  </button>
              ) : (
                  <Link
                      href="/signin"
                      className={`bg-white text-purple-600 font-bold py-2 px-4 rounded-full transition-all duration-200 hover:bg-gray-100 hover:scale-105 hover:shadow-lg`}
                  >
                    Sign In / Sign Up
                  </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-white hover:bg-purple-600 transition-colors duration-200"
                aria-label="Toggle mobile menu"
            >
              <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
            <div className={`md:hidden ${
                theme === 'light'
                    ? 'bg-purple-600'
                    : 'bg-gray-800'
            } border-t border-purple-500/30`}>
              <div className="px-4 py-2 space-y-1">
                {isLoggedIn && (
                    <Link
                        href="/profile"
                        className="block text-white font-bold py-2 px-2 rounded hover:bg-purple-500 transition-colors duration-200"
                        onClick={closeMobileMenu}
                    >
                      My Profile
                    </Link>
                )}
                <Link
                    href="/games"
                    className="block text-white font-bold py-2 px-2 rounded hover:bg-purple-500 transition-colors duration-200"
                    onClick={closeMobileMenu}
                >
                  Games
                </Link>
                <Link
                    href="/translate"
                    className="block text-white font-bold py-2 px-2 rounded hover:bg-purple-500 transition-colors duration-200"
                    onClick={closeMobileMenu}
                >
                  Translate
                </Link>
                <Link
                    href="/contact"
                    className="block text-white font-bold py-2 px-2 rounded hover:bg-purple-500 transition-colors duration-200"
                    onClick={closeMobileMenu}
                >
                  Contact Us
                </Link>

                {/* Mobile Auth Button */}
                <div className="pt-2 border-t border-purple-500/30">
                  {isLoggedIn ? (
                      <button
                          onClick={() => {
                            logout()
                            closeMobileMenu()
                          }}
                          className="w-full text-left bg-white text-purple-600 font-bold py-2 px-4 rounded-full transition-all duration-200 hover:bg-gray-100"
                      >
                        Log Out
                      </button>
                  ) : (
                      <Link
                          href="/signin"
                          className="block text-center bg-white text-purple-600 font-bold py-2 px-4 rounded-full transition-all duration-200 hover:bg-gray-100"
                          onClick={closeMobileMenu}
                      >
                        Sign In / Sign Up
                      </Link>
                  )}
                </div>
              </div>
            </div>
        )}
      </header>
  )
}