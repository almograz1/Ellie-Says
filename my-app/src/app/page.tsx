'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
    const [showMenu, setShowMenu] = useState(false)

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200 flex flex-col items-center p-6 overflow-hidden">
            {/* Ellie full-body entrance */}
            {/* Ellie full-body entrance */}
            <motion.div
                className="mt-16"
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                onAnimationComplete={() => setShowMenu(true)}
            >
                {/* Transparent background image, larger size */}
                <Image
                    src="/ellie-fullbody.png"
                    alt="Ellie Says Full Body"
                    width={400}
                    height={400}
                    className="rounded-lg shadow-none"
                    priority
                />
            </motion.div>

            {/* Title & Tagline fade in */}
            <motion.h1
                className="mt-6 text-4xl font-extrabold text-purple-800 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                Welcome to Ellie Says!
            </motion.h1>
            <motion.p
                className="mt-2 text-lg text-purple-600 text-center max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
            >
                Choose an option to get started on your language journey.
            </motion.p>

            {/* Menu appears after entrance animation */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <Link href="/profile" className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg text-center shadow transition">
                            My Profile
                        </Link>
                        <Link href="/games" className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-4 rounded-lg text-center shadow transition">
                            Games
                        </Link>
                        <Link href="/translate" className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 rounded-lg text-center shadow transition">
                            Translate
                        </Link>
                        <Link href="/contact" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg text-center shadow transition">
                            Contact Us
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
