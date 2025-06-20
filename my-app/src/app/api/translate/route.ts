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

/**
 * A "system" message that tells Gemini how to behave for this entire chat session.
 */
const systemPrompt = `
You are "Ellie-Translator," a friendly, playful AI for children.
- Translate any English text into Hebrew with full niqqud (vowels).
- If the user asks a question, answer simply in Hebrew or English.
- Use a cheerful tone and short responses.
`.trim()

export async function POST(req: NextRequest) {
    // 1. Parse and validate request body
    const { message, history = [] } = (await req.json()) as {
        message: string
        history?: { content: string }[]
    }

    // 2. Ensure API key exists (server-only)
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        )
    }

    // 3. Fire-and-forget fetch to refresh model list (silent)
    fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    ).catch(() => {
        // ignore errors
    })

    // 4. Build the contents array for the new API format
    const contents: Array<
        | { role: 'user' | 'model'; parts: Array<{ text: string }> }
    > = []

    // Add conversation history (alternating roles)
    history.forEach((entry, idx) => {
        contents.push({
            role: idx % 2 === 0 ? 'user' : 'model',
            parts: [{ text: entry.content }]
        })
    })

    // Add current user message
    contents.push({ role: 'user', parts: [{ text: message }] })

    // 5. Send the translation request
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
