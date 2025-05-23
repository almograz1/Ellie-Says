'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

export default function SignInPage() {
    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [error, setError]       = useState<string | null>(null)
    const router = useRouter()

    const handleSignIn = async () => {
        setError(null)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push('/profile')
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message)
            else setError('Unknown error')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl
                      max-w-md w-full p-8 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-purple-800">
                        🔑 Welcome Back!
                    </h1>
                    <p className="mt-2 text-purple-600">Sign in to your account</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 text-black placeholder-purple-200 placeholder-opacity-100
                       focus:border-purple-500 outline-none transition"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-purple-300
                       focus:border-purple-500 outline-none transition text-black placeholder-purple-200 placeholder-opacity-100"
                    />
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-600 text-center">{error}</p>
                )}

                {/* Sign In Button */}
                <button
                    onClick={handleSignIn}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700
                     text-white font-bold rounded-lg shadow-md transition"
                >
                    Sign In
                </button>

                {/* Footer Links */}
                <div className="flex justify-between text-sm text-purple-700">
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
