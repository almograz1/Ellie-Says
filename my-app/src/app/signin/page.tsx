'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/app/firebase' // ✅ Make sure googleProvider is exported from your firebase.ts
import { useTheme } from '@/lib/ThemeContext'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { theme } = useTheme()

  const handleSignIn = async () => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/translate')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Unknown error occurred')
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/translate')
    } catch (err) {
      console.error(err) // ✅ Log it for debugging
      setError('Google sign-in failed')
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'light'
        ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
        : 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
    }`}>
      <div className={`rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 backdrop-blur-md ${
        theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90'
      }`}>
        <div className="text-center">
          <h1 className={theme === 'light'
            ? 'text-3xl font-extrabold text-purple-800'
            : 'text-3xl font-extrabold text-purple-300'}>
            🔑 Welcome Back!
          </h1>
          <p className={theme === 'light'
            ? 'mt-2 text-purple-600'
            : 'mt-2 text-purple-400'}>
            Sign in to your account
          </p>
        </div>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
            theme === 'light'
              ? 'border-purple-300 focus:border-purple-500 placeholder-purple-200 text-black placeholder-opacity-100'
              : 'border-purple-700 focus:border-purple-400 placeholder-purple-400 text-white placeholder-opacity-70'
          }`}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
            theme === 'light'
              ? 'border-purple-300 focus:border-purple-500 placeholder-purple-200 text-black placeholder-opacity-100'
              : 'border-purple-700 focus:border-purple-400 placeholder-purple-400 text-white placeholder-opacity-70'
          }`}
        />

        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          onClick={handleSignIn}
          className={`w-full py-3 font-bold rounded-lg shadow-md transition ${
            theme === 'light'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-700 hover:bg-purple-600 text-gray-100'
          }`}
        >
          Sign In
        </button>

        <button
          onClick={handleGoogleSignIn}
          className={`w-full py-3 font-bold rounded-lg shadow-md transition ${
            theme === 'light'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-red-600 hover:bg-red-500 text-white'
          }`}
        >
          Sign In with Google
        </button>

        <div className={theme === 'light'
          ? 'flex justify-between text-sm text-purple-700'
          : 'flex justify-between text-sm text-purple-300'}>
          <Link href="/registration" className="hover:underline">
            Don’t have an account? Sign Up
          </Link>
          <Link href="/" className="hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
