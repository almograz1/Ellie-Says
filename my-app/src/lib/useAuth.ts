'use client'
import { useState, useEffect } from 'react'
import {
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth'
import { auth } from '@/firebase'

export function useAuth() {
    const [user, setUser]       = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                // always reload to get the latest emailVerified flag
                await fbUser.reload()

                if (fbUser.emailVerified) {
                    setUser(fbUser)
                } else {
                    // if not verified, immediately sign out to clear the session
                    await signOut(auth)
                    setUser(null)
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })
        return unsub
    }, [])

    const logout = () => signOut(auth)

    return { user, loading, logout }
}
