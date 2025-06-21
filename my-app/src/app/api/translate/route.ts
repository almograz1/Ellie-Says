// app/api/translate/route.ts

import { NextRequest, NextResponse } from 'next/server'

/**
 * Type definitions for the Gemini API response
 */
interface GeminiResponse {
    candidates?: Array<{
        content: {
            parts: Array<{ text: string }>
        }
    }>
}


// Initialize a training prompt for Gemini's conversation
const systemPrompt = `
You are "Ellie-Translator," a friendly, playful AI for children.
- Translate any English text into Hebrew with full niqqud (vowels), then add the pronunciation in parentheses using Latin letters.
- If the user asks a question, answer simply in Hebrew and English.
- Use a cheerful tone and short responses.
`.trim()

export async function POST(req: NextRequest) {
    // Validate request body to appear in this format
    const { message, history = [] } = (await req.json()) as {
        message: string
        history?: { content: string }[]
    }

    // Grab Gemini API Key from environment variables which are rendered server-side only
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        )
    }


    // Initialize the contents array for the Gemini API format
    const contents: Array<
        | { role: 'user' | 'model'; parts: Array<{ text: string }> }
    > = []

    // Build contents from conversation history (alternating roles - user goes first)
    history.forEach((entry, idx) => {
        contents.push({
            role: idx % 2 === 0 ? 'user' : 'model',
            parts: [{ text: entry.content }]
        })
    })

    // Add current user message to contents - held in message variable sent in the POST request
    contents.push({ role: 'user', parts: [{ text: message }] })

    // After conversation was rebuilt - Send the translation request
    try {
        const modelName = 'gemini-1.5-flash'
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: {
                        temperature: 0.2,
                        candidateCount: 1,
                        maxOutputTokens: 1000
                    }
                })
            }
        )
    // result is fetched, check if response was successfully fetched
        if (!res.ok) {
            const errText = await res.text()
            return NextResponse.json(
                { error: `Gemini API ${res.status}: ${errText}` },
                { status: 500 }
            )
        }

        const data = (await res.json()) as GeminiResponse
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!answer) {
            return NextResponse.json(
                { error: 'No response from Gemini' },
                { status: 500 }
            )
        }

        return NextResponse.json({ answer })
    } catch (err: unknown) {
        const messageText = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json(
            { error: messageText },
            { status: 500 }
        )
    }
}
