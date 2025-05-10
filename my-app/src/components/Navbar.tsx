'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    const links = [
        { href: '/practice', label: 'Practice' },
        { href: '/quiz',     label: 'Quiz'     },
        { href: '/games',    label: 'Games'    },
        { href: '/about',    label: 'About'    },
    ]

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-md">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/">
                    <div className="flex items-center cursor-pointer">
                        <Image
                            src="/logo.svg"
                            alt="LinguaLoop Logo"
                            width={140}
                            height={32}
                            priority
                        />
                    </div>
                </Link>

                <nav className="hidden md:flex space-x-8">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`font-medium hover:text-blue-600 ${
                                pathname === link.href
                                    ? 'text-blue-600 font-bold'
                                    : 'text-gray-700'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <button
                    className="md:hidden text-gray-700"
                    onClick={() => setOpen(o => !o)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                                open
                                    ? 'M6 18L18 6M6 6l12 12'
                                    : 'M4 6h16M4 12h16M4 18h16'
                            }
                        />
                    </svg>
                </button>

                {open && (
                    <nav className="absolute top-full left-0 w-full bg-white shadow-md md:hidden">
                        <ul className="flex flex-col p-4">
                            {links.map((link) => (
                                <li key={link.href} className="py-2">
                                    <Link
                                        href={link.href}
                                        className="block text-gray-700 hover:text-blue-600"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}
            </div>
        </header>
    )
}
