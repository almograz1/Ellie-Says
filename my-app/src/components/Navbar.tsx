'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
    const pathname = usePathname()

    // Hide on home
    if (pathname === '/') return null

    const mainLinks = [
        { href: '/profile',   label: 'My Profile' },
        { href: '/games',     label: 'Games'      },
        { href: '/translate', label: 'Translate'  },
        { href: '/contact',   label: 'Contact Us' }
    ]

    return (
        <header className="fixed top-0 left-0 w-full bg-purple-700 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/Ellie_icon.png"
                        alt="Ellie Says Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                        priority
                    />
                    <span className="text-white text-2xl font-extrabold">
            Ellie Says
          </span>
                </Link>

                {/* Centered main nav */}
                <nav className="hidden md:flex space-x-6">
                    {mainLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-white hover:text-pink-200 font-medium"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Sign In / Sign Up */}
                <Link
                    href="/registration"
                    className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full hover:bg-purple-50 transition"
                >
                    Sign In / Sign Up
                </Link>
            </div>
        </header>
    )
}
