// src/app/api/contact/route.ts
import { firestore } from '@/firebase'     // ← from src/firebase.ts :contentReference[oaicite:0]{index=0}
import { NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: Request) {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
        return NextResponse.json(
            { error: 'All fields are required.' },
            { status: 400 }
        )
    }

    try {
        await addDoc(
            collection(firestore, 'contactMessages'),
            { name, email, message, createdAt: serverTimestamp() }
        )
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('Contact error:', err)
        return NextResponse.json(
            { error: 'Failed to save message.' },
            { status: 500 }
        )
    }
}
