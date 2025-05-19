'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const mainLinks = [
        { href: '/profile',   label: 'My Profile' },
        { href: '/games',     label: 'Games'      },
        { href: '/translate', label: 'Translate'  },
        { href: '/contact',   label: 'Contact Us' }
    ]

    return (
        <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-200 shadow-lg z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                {/* Logo for Ellie Says */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/Ellie-icon.png"
                        alt="Ellie Says Avatar"
                        width={40}
                        height={40}
                        className="cursor-pointer rounded-full"
                    />
                    <span className="text-white text-2xl font-extrabold tracking-tight">
    Ellie Says
  </span>
                </Link>

                {/* Main links - centered */}
                <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 space-x-6">
                    {mainLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-white font-semibold hover:text-purple-900 transition ${
                                pathname === link.href ? 'underline' : ''
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth - right corner */}
                <div className="hidden md:block">
                    <Link
                        href="/registration"
                        className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full hover:bg-purple-50 transition"
                    >
                        Sign In / Sign Up
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white focus:outline-none"
                    onClick={() => setOpen(o => !o)}
                    aria-label="Toggle menu"
                >
                    {open ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {open && (
                <nav className="md:hidden bg-gradient-to-r from-purple-300 via-pink-200 to-yellow-200 shadow-lg">
                    <div className="flex flex-col items-center py-4 space-y-3">
                        {mainLinks.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-white font-semibold text-lg hover:text-purple-900 transition ${
                                    pathname === link.href ? 'underline' : ''
                                }`}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/registration"
                            className="mt-2 bg-white text-purple-600 font-bold py-2 px-6 rounded-full hover:bg-purple-50 transition"
                            onClick={() => setOpen(false)}
                        >
                            Sign In / Sign Up
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    )
}
