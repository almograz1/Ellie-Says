'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut, updateProfile
} from 'firebase/auth'
import { auth } from '@/firebase'
import { registerUser, UserProfile } from '@/firebaseService'
import { useTheme } from '@/lib/ThemeContext'

export default function RegistrationPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [captchaValue, setCaptchaValue] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaError, setCaptchaError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const { theme } = useTheme()

  const generateCaptcha = () => {
    const random = Math.floor(10000 + Math.random() * 90000).toString()
    setCaptchaValue(random)
    setCaptchaInput('')
    setCaptchaError(null)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleRegister = async () => {
    setError(null)
    setCaptchaError(null)

    if (captchaInput !== captchaValue) {
      setCaptchaError('Incorrect CAPTCHA, please try again.')
      generateCaptcha()
      return
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(user, {displayName})
      await sendEmailVerification(user)

      const profile: UserProfile = {
        userId: user.uid,
        displayName,
        email: user.email || '',
        createdAt: new Date().toISOString(),
        verified: false
      }

      await registerUser(profile)
      await signOut(auth)
      setPending(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  if (pending) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4
        ${theme === 'light'
          ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
          : 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'}`}>
        <div className={`max-w-md rounded-2xl p-8 text-center backdrop-blur-md
          ${theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90'}`}>
          <h2 className={theme === 'light' ? 'text-2xl font-bold mb-4 text-gray-900' : 'text-2xl font-bold mb-4 text-gray-100'}>
            Almost there!
          </h2>
          <p className={theme === 'light' ? 'mb-4 text-gray-900' : 'mb-4 text-gray-200'}>
            We’ve sent a verification link to <strong>{email}</strong>.<br />
            Please check your inbox (and spam folder), then{' '}
            <Link href="/signin" className="text-purple-600 hover:underline">
              sign in
            </Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4
      ${theme === 'light'
        ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
        : 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 space-y-6 backdrop-blur-md
        ${theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90'}`}>
        <div className="text-center">
          <h1 className={theme === 'light' ? 'text-3xl font-extrabold text-purple-800' : 'text-3xl font-extrabold text-purple-300'}>
            🚀 Join Ellie Says!
          </h1>
          <p className={theme === 'light' ? 'mt-2 text-purple-600' : 'mt-2 text-purple-400'}>
            Create a fun learning account
          </p>
        </div>

        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
            theme === 'light'
              ? 'border-purple-300 focus:border-purple-500 placeholder-purple-200 text-black'
              : 'border-purple-700 focus:border-purple-400 placeholder-purple-400 text-white'
          }`}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
            theme === 'light'
              ? 'border-purple-300 focus:border-purple-500 placeholder-purple-200 text-black'
              : 'border-purple-700 focus:border-purple-400 placeholder-purple-400 text-white'
          }`}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
            theme === 'light'
              ? 'border-purple-300 focus:border-purple-500 placeholder-purple-200 text-black'
              : 'border-purple-700 focus:border-purple-400 placeholder-purple-400 text-white'
          }`}
        />

        {/* CAPTCHA in horizontal layout */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Enter CAPTCHA"
            value={captchaInput}
            onChange={e => setCaptchaInput(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-lg border-2 focus:outline-none transition ${
              theme === 'light'
                ? 'border-purple-300 focus:border-purple-500 placeholder-purple-200 text-black'
                : 'border-purple-700 focus:border-purple-400 placeholder-purple-400 text-white'
            }`}
          />
          <div
            className={`select-none font-mono text-xl font-bold tracking-widest px-4 py-2 rounded-lg border-2 text-center ${
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
            aria-label="Refresh CAPTCHA"
          >
            ↻
          </button>
        </div>
        {captchaError && <p className="text-red-600 text-center">{captchaError}</p>}

        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          onClick={handleRegister}
          className={`w-full py-3 font-bold rounded-lg shadow-md transition ${
            theme === 'light'
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-purple-700 hover:bg-purple-600 text-gray-100'
          }`}
        >
          Register
        </button>

        <div className={theme === 'light'
          ? 'flex justify-between text-sm text-purple-700'
          : 'flex justify-between text-sm text-purple-300'}>
          <Link href="/signin" className="hover:underline">
            Already have an account?
          </Link>
          <Link href="/" className="hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
