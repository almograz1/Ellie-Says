'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/lib/ThemeContext'

export default function Home() {
  const [showMenu, setShowMenu] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    if (!loading && user) router.replace('/translate')
  }, [loading, user, router])

  if (loading) return null
  if (user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-purple-700 animate-pulse">Redirecting…</p>
      </div>
    )

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center p-6 overflow-hidden
        ${theme === 'light'
          ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200 text-purple-800'
          : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900 text-purple-200'}
      `}
    >
      {/* Ellie entrance */}
      <motion.div
        className="mt-16"
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        onAnimationComplete={() => setShowMenu(true)}
      >
        <Image
          src="/ellie-fullbody.png"
          alt="Ellie Says Full Body"
          width={400}
          height={400}
          className="rounded-lg"
          priority
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="mt-6 text-4xl font-extrabold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Welcome to Ellie&nbsp;Says!
      </motion.h1>

      {/* Bold summary */}
      <motion.p
        className="mt-2 text-lg leading-relaxed text-center max-w-xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        Ellie&nbsp;Says is your playful hub for learning Hebrew! Play language
        games, solve trivia, translate words&nbsp;and&nbsp;sentences (and save
        them), or chat with our friendly AI coach. We’ll track your progress
        every step of the way.
      </motion.p>

      {/* Call-to-action line below, bigger */}
      <motion.p
        className="mt-4 text-2xl font-extrabold text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        Get started&nbsp;— it's free!
      </motion.p>

      {/* Menu appears after Ellie lands */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Link
              href="/signin"
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg text-center shadow transition"
            >
              Sign&nbsp;In&nbsp;/&nbsp;Register
            </Link>
            <Link
              href="/games"
              className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-4 rounded-lg text-center shadow transition"
            >
              Games
            </Link>
            <Link
              href="/translate"
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 rounded-lg text-center shadow transition"
            >
              Translate
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
