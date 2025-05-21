'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { registerUser } from '@/firebaseService';
import type { UserProfile } from '@/firebaseService';

export default function RegistrationPage() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail]           = useState('');
    const [password, setPassword]     = useState('');
    const [error, setError]           = useState('');

    const handleRegister = async () => {
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            const profile: UserProfile = {
                userId:     user.uid,
                displayName,
                email:      user.email || '',
                createdAt:  new Date().toISOString(),
            };
            await registerUser(profile);
            alert('🎉 Welcome aboard, ' + displayName + '!');
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-4">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-purple-800">🚀 Join Ellie Says!</h1>
                    <p className="mt-2 text-purple-600">Create a fun learning account</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
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
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-red-600 text-center">{error}</p>
                )}

                {/* Register Button */}
                <button
                    onClick={handleRegister}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition"
                >
                    Register
                </button>

                {/* Footer Links */}
                <div className="flex justify-between text-sm text-purple-700">
                    <Link href="/login" className="hover:underline">
                        Already have an account?
                    </Link>
                    <Link href="/" className="hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
