'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'
import { useTheme } from '@/lib/ThemeContext'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaValue, setCaptchaValue] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const router = useRouter()
  const { theme } = useTheme()

  // Generate random 5-digit number as captcha when component mounts or refreshCaptcha called
  const generateCaptcha = () => {
    const randomNumber = Math.floor(10000 + Math.random() * 90000).toString()
    setCaptchaValue(randomNumber)
    setCaptchaInput('')
    setCaptchaError(null)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleSignIn = async () => {
    setError(null)
    setCaptchaError(null)

    // Validate captcha first
    if (captchaInput !== captchaValue) {
      setCaptchaError('Incorrect CAPTCHA, please try again.')
      generateCaptcha()
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/profile')
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError('Unknown error')
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4
           ${theme === 'light'
             ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
             : 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'}`}
    >
      <div
        className={`rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6 backdrop-blur-md
               ${theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90'}`}
      >
        {/* Header */}
        <div className="text-center">
          <h1
            className={
              theme === 'light'
                ? 'text-3xl font-extrabold text-purple-800'
                : 'text-3xl font-extrabold text-purple-300'
            }
          >
            🔑 Welcome Back!
          </h1>
          <p className={theme === 'light' ? 'mt-2 text-purple-600' : 'mt-2 text-purple-400'}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
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

          {/* CAPTCHA display */}
          <div className="flex items-center space-x-4">
            <div
              className={`select-none font-mono text-2xl font-bold tracking-widest px-4 py-2 rounded-lg border-2 ${
                theme === 'light'
                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-purple-900 border-purple-700 text-purple-300'
              }`}
            >
              {captchaValue}
            </div>
            <button
              type="button"
              onClick={generateCaptcha}
              className={`px-3 py-2 rounded-md border-2 font-semibold ${
                theme === 'light'
                  ? 'border-purple-300 text-purple-600 hover:bg-purple-200'
                  : 'border-purple-700 text-purple-300 hover:bg-purple-800'
              }`}
            >
              ↻
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter CAPTCHA"
            value={captchaInput}
            onChange={e => setCaptchaInput(e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
              theme === 'light'
                ? 'border-purple-300 focus:border-purple-500 placeholder-purple-200 text-black placeholder-opacity-100'
                : 'border-purple-700 focus:border-purple-400 placeholder-purple-400 text-white placeholder-opacity-70'
            }`}
          />
          {captchaError && <p className="text-red-600 text-center">{captchaError}</p>}
        </div>

        {/* Error */}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* Sign In Button */}
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

        {/* Footer Links */}
        <div
          className={
            theme === 'light'
              ? 'flex justify-between text-sm text-purple-700'
              : 'flex justify-between text-sm text-purple-300'
          }
        >
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
