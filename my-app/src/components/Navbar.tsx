'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'

export default function Navbar() {
    const pathname = usePathname()
    if (pathname === '/') return null

    const { user, logout, loading } = useAuth()

    // While we’re still checking auth, show nothing (avoids flash)
    if (loading) return null

    // Only treat as logged in if emailVerified is true
    const isLoggedIn = !!user

    return (
        <header className="fixed top-0 left-0 w-full bg-purple-700 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/Ellie_icon.png" width={40} height={40} alt="Ellie Says" className="rounded-full" />
                    <span className="text-white text-2xl font-extrabold">Ellie Says</span>
                </Link>

                {/* Centered links */}
                <nav className="hidden md:flex space-x-6">
                    {isLoggedIn && (
                        <Link href="/profile" className="text-white hover:text-pink-200 font-medium">
                            My Profile
                        </Link>
                    )}
                    <Link href="/games"     className="text-white hover:text-pink-200 font-medium">Games</Link>
                    <Link href="/translate" className="text-white hover:text-pink-200 font-medium">Translate</Link>
                    <Link href="/contact"   className="text-white hover:text-pink-200 font-medium">Contact Us</Link>
                </nav>

                {/* Auth button */}
                {isLoggedIn ? (
                    <button
                        onClick={logout}
                        className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full"
                    >
                        Log Out
                    </button>
                ) : (
                    <Link
                        href="/signin"
                        className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full"
                    >
                        Sign In / Sign Up
                    </Link>
                )}
            </div>
        </header>
    )
}
