// app/translate/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { hasExceededGuestLimit, incrementGuestPlayCount } from '@/utils/guestLimit'

export default function TranslatePage() {
    const { user, loading } = useAuth()
    const [history, setHistory] = useState<{ role: string; content: string }[]>([])
    const [input, setInput] = useState('')
    const [loadingAI, setLoadingAI] = useState(false)
    const [blocked, setBlocked] = useState(false)

    useEffect(() => {
        if (!loading && !user && hasExceededGuestLimit()) {
            setBlocked(true)
        }
    }, [loading, user])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim() || blocked) return

        if (!user) {
            incrementGuestPlayCount()
            if (hasExceededGuestLimit()) {
                setBlocked(true)
                return
            }
        }

        const userMsg = { role: 'user', content: input }
        setHistory((h) => [...h, userMsg])
        setLoadingAI(true)

        const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: input, history })
        })
        const { answer, error } = await res.json()
        setLoadingAI(false)

        if (error) {
            alert('Error: ' + error)
            return
        }

        setHistory((h) => [...h, { role: 'assistant', content: answer }])
        setInput('')
    }

    if (blocked) {
        return (
            <div className="min-h-screen flex items-center justify-center
                bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-4">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-purple-800 mb-4">
                        Oops! You&#39;ve used your 3 free translations!
                    </h2>
                    <p className="text-purple-600 mb-6">
                        Sign in to keep learning with Ellie! 🎉
                    </p>
                    <a
                        href="/signin"
                        className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700
                            text-white font-bold rounded-full shadow-lg transform hover:scale-105
                            transition-all duration-200"
                    >
                        Sign in to Continue
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200
            flex items-center justify-center p-6">
            <div className="flex items-center justify-center gap-12 max-w-7xl w-full">

                {/* Ellie Character */}
                <div className="hidden lg:block flex-shrink-0">
                    <div className="relative">
                        <img
                            src="/ellie-fullbody.png"
                            alt="Ellie the Translator"
                            className={`w-80 h-auto drop-shadow-2xl transition-transform duration-300 ${
                                loadingAI ? 'animate-bounce' : ''
                            }`}
                        />
                        {/* Speech bubble */}
                        <div className={`absolute -top-6 -right-10 bg-white/95 backdrop-blur-sm 
                            rounded-2xl p-4 shadow-lg border-2 border-purple-200 max-w-sm transition-all duration-300 ${
                            loadingAI ? 'animate-pulse scale-105' : ''
                        }`}>
                            <div className="text-purple-700 font-medium text-sm">
                                {history.length === 0
                                    ? "Hi! I'm Ellie! 👋 Type something in English and I'll translate it to Hebrew with vowels!"
                                    : loadingAI
                                        ? "Let me think about that... 🤔✨"
                                        : "What else would you like to translate? 😊"
                                }
                            </div>
                            {/* Speech bubble tail */}
                            <div className="absolute bottom-0 left-10 w-0 h-0 border-l-8 border-r-8
                                border-t-8 border-l-transparent border-r-transparent border-t-white/95
                                transform translate-y-full"></div>
                        </div>

                        {/* Talking animation sparkles */}
                        {loadingAI && (
                            <>
                                <div className="absolute top-20 left-16 text-2xl animate-ping">✨</div>
                                <div className="absolute top-32 right-20 text-xl animate-ping delay-150">🌟</div>
                                <div className="absolute top-40 left-24 text-lg animate-ping delay-300">💫</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Chat Container */}
                <div className="flex-1 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-extrabold text-purple-800 mb-3">
                            🌟 Ellie&#39;s Translation Magic 🌟
                        </h1>
                        <p className="text-xl text-purple-600 font-medium">
                            Let&#39;s learn Hebrew together! 🇮🇱✨
                        </p>
                    </div>

                    {/* Chat Box */}
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl
                        border-2 border-purple-200 overflow-hidden">

                        {/* Chat Messages */}
                        <div className="h-[500px] overflow-auto p-8 space-y-6 bg-gradient-to-b
                            from-purple-50/50 to-pink-50/50">

                            {history.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="text-8xl mb-6">🎭</div>
                                    <p className="text-xl text-purple-600 font-medium">
                                        Start your Hebrew adventure! Type something below.
                                    </p>
                                </div>
                            )}

                            {history.map((m, i) => (
                                <div
                                    key={i}
                                    className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-md lg:max-w-lg p-5 rounded-2xl shadow-lg ${
                                        m.role === 'user'
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            : 'bg-gradient-to-l from-green-400 to-blue-400 text-white'
                                    }`}>
                                        <div className="text-sm font-bold mb-2 opacity-90">
                                            {m.role === 'user' ? '👦 You (English)' : '🤖 Ellie (עברית)'}
                                        </div>
                                        <div className={`text-base leading-relaxed ${
                                            m.role === 'user' ? 'text-left' : 'text-right'
                                        }`} dir={m.role === 'user' ? 'ltr' : 'rtl'}>
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loadingAI && (
                                <div className="flex justify-end">
                                    <div className="bg-gradient-to-l from-yellow-400 to-orange-400
                                        text-white p-5 rounded-2xl shadow-lg animate-pulse">
                                        <div className="flex items-center space-x-3">
                                            <div className="animate-bounce">🤖</div>
                                            <div>Ellie is thinking...</div>
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Form */}
                        <div className="p-8 bg-white/80 backdrop-blur-sm border-t-2 border-purple-200">
                            <form onSubmit={handleSubmit} className="flex space-x-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type in English... 🌟"
                                    className="flex-1 px-6 py-4 rounded-full border-2 border-purple-300
                                        focus:border-purple-500 outline-none transition-all duration-200
                                        text-purple-800 placeholder-purple-400 bg-white/90 backdrop-blur-sm
                                        text-base font-medium"
                                    disabled={loadingAI}
                                />
                                <button
                                    type="submit"
                                    disabled={loadingAI || !input.trim()}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500
                                        hover:from-purple-600 hover:to-pink-600 text-white font-bold
                                        rounded-full shadow-lg transform hover:scale-105
                                        transition-all duration-200 disabled:opacity-50
                                        disabled:cursor-not-allowed disabled:transform-none text-lg"
                                >
                                    {loadingAI ? '✨' : '🚀'}
                                </button>
                            </form>

                            {/* Fun stats */}
                            <div className="mt-4 text-center text-sm text-purple-600">
                                {!user && (
                                    <p>
                                        🎯 Free translations left: {Math.max(0, 3 - (parseInt(localStorage.getItem('guestPlayCount') || '0')))}
                                    </p>
                                )}
                                {history.length > 0 && (
                                    <p className="mt-1">
                                        🎉 You&#39;ve learned {Math.floor(history.length / 2)} Hebrew phrases today!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Ellie (shows on smaller screens) */}
                <div className="lg:hidden fixed bottom-6 right-6 z-10">
                    <img
                        src="/ellie-fullbody.png"
                        alt="Ellie"
                        className={`w-24 h-auto drop-shadow-lg opacity-90 transition-transform duration-300 ${
                            loadingAI ? 'animate-bounce' : ''
                        }`}
                    />
                    {loadingAI && (
                        <>
                            <div className="absolute -top-2 -left-2 text-lg animate-ping">✨</div>
                            <div className="absolute -top-1 -right-1 text-sm animate-ping delay-150">🌟</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}