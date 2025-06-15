// app/api/translate/route.ts

import { NextRequest, NextResponse } from 'next/server'

/**
 * Type definitions for the Gemini API response
 */
interface GeminiModel {
    name: string
    displayName?: string
    description?: string
}

interface ListModelsResponse {
    models?: GeminiModel[]
}

interface GeminiResponse {
    candidates?: Array<{
        content: {
            parts: Array<{
                text: string
            }>
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
    const body = (await req.json()) as {
        message: string
        history?: { content: string }[]
    }
    const { message, history = [] } = body

    // 2. Ensure API key exists (server-only)
    const apiKey = process.env.GEMINI_API_KEY
    console.log('GEMINI_API_KEY prefix:', apiKey?.slice(0, 8))
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        )
    }

    // 3. Fetch and print available models with proper typing
    try {
        const listRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        )
        if (listRes.ok) {
            const listData = (await listRes.json()) as ListModelsResponse
            const names = Array.isArray(listData.models)
                ? listData.models.map((m) => m.name)
                : []
            console.log('Available Gemini models:', names)
        } else {
            console.warn(
                'Could not fetch models list:',
                await listRes.text()
            )
        }
    } catch (err) {
        console.warn('Error fetching models list:', err)
    }

    // 4. Build the contents array for the new API format
    const contents = []

    // Add conversation history (assuming it alternates user/model)
    for (let i = 0; i < history.length; i++) {
        contents.push({
            role: i % 2 === 0 ? "user" : "model",
            parts: [{ text: history[i].content }]
        })
    }

    // Add current user message
    contents.push({
        role: "user",
        parts: [{ text: message }]
    })

    // 5. Send the translation request using the new API
    try {
        const modelName = 'gemini-1.5-flash' // Remove 'models/' prefix
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    temperature: 0.2,
                    candidateCount: 1,
                    maxOutputTokens: 1000,
                }
            })
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('Gemini API Error:', errText)
            return NextResponse.json(
                { error: `Gemini API ${res.status}: ${errText}` },
                { status: 500 }
            )
        }

        const data = (await res.json()) as GeminiResponse
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!answer) {
            console.error('No response from Gemini:', data)
            return NextResponse.json(
                { error: 'No response from Gemini' },
                { status: 500 }
            )
        }

        return NextResponse.json({ answer })
    } catch (err: unknown) {
        console.error('Request error:', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}