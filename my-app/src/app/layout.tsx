'use client'

import './globals.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Navbar from '../components/Navbar'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <html lang="en">
        <body
            className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased
          bg-gradient-to-br from-indigo-100 via-pink-200 to-yellow-200
          text-foreground
        `}
        >
        <Navbar />

        {/* push content *only* when navbar is visible */}
        <main className={pathname === '/' ? '' : 'pt-16'}>
            {children}
        </main>
        </body>
        </html>
    )
}
