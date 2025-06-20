// src/app/api/save-word/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/firebase';

export async function POST(req: NextRequest) {
    try {
        const { english, hebrew, userUid } = await req.json();

        if (!english || !hebrew || !userUid) {
            return NextResponse.json(
                { error: 'Missing required fields: english, hebrew, userUid' },
                { status: 400 }
            );
        }

        const db = getFirestore(app);

        // Check if word already exists for this user
        const existingQuery = query(
            collection(db, 'saved_words'),
            where('uid', '==', userUid),
            where('english', '==', english),
            where('hebrew', '==', hebrew)
        );

        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            return NextResponse.json(
                { error: 'Word already saved!' },
                { status: 409 }
            );
        }

        // Save the new word
        await addDoc(collection(db, 'saved_words'), {
            uid: userUid,
            english,
            hebrew,
            createdAt: serverTimestamp()
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving word:', error);
        return NextResponse.json(
            { error: 'Failed to save word' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const userUid = searchParams.get('uid');

        if (!userUid) {
            return NextResponse.json(
                { error: 'Missing user ID' },
                { status: 400 }
            );
        }

        const db = getFirestore(app);

        const wordsQuery = query(
            collection(db, 'saved_words'),
            where('uid', '==', userUid)
        );

        const wordsSnapshot = await getDocs(wordsQuery);
        const savedWords = wordsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ savedWords });

    } catch (error) {
        console.error('Error fetching saved words:', error);
        return NextResponse.json(
            { error: 'Failed to fetch saved words' },
            { status: 500 }
        );
    }
}