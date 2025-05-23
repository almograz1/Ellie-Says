// src/app/registration/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signOut
} from 'firebase/auth'
import { auth } from '@/firebase'
import { registerUser, UserProfile } from '@/firebaseService'

export default function RegistrationPage() {
    const [displayName, setDisplayName] = useState('')
    const [email, setEmail]             = useState('')
    const [password, setPassword]       = useState('')
    const [error, setError]             = useState<string | null>(null)
    const [pending, setPending]         = useState(false)

    const handleRegister = async () => {
        setError(null)
        try {
            // 1. Create the user in Firebase Auth
            const { user } = await createUserWithEmailAndPassword(auth, email, password)

            // 2. Send them a verification email
            await sendEmailVerification(user)

            // 3. Save user profile in Firestore (with a `verified` flag)
            const profile: UserProfile = {
                userId:      user.uid,
                displayName,
                email:       user.email || '',
                createdAt:   new Date().toISOString(),
                verified:    false
            }
            await registerUser(profile)

            // 4. Sign them out until they verify
            await signOut(auth)

            // 5. Show the "verification pending" UI
            setPending(true)
        } catch (err: unknown) {
            if(err instanceof Error){
                setError(err.message)
            }
            else{
                setError('An unexpected error occurred')
            }
        }
    }

    // If we're waiting for the user to verify their email
    if (pending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-4">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-4">Almost there!</h2>
                    <p className="mb-4">
                        We’ve sent a verification link to <strong>{email}</strong>.<br/>
                        Please check your inbox (and spam folder), then{' '}
                        <Link href="/signin" className="text-purple-600 hover:underline">
                            sign in
                        </Link>.
                    </p>
                </div>
            </div>
        )
    }

    // Registration form UI
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-purple-800">🚀 Join Ellie Says!</h1>
                    <p className="mt-2 text-purple-600">Create a fun learning account</p>
                </div>
                <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 outline-none transition text-black placeholder-purple-200 placeholder-opacity-100"
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 outline-none transition text-black placeholder-purple-200 placeholder-opacity-100"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-purple-300 focus:border-purple-500 outline-none transition text-black placeholder-purple-200 placeholder-opacity-100"
                />
                {error && <p className="text-red-600 text-center">{error}</p>}
                <button
                    onClick={handleRegister}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition"
                >
                    Register
                </button>
                <div className="flex justify-between text-sm text-purple-700">
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
