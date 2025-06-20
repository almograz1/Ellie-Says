// app/translate/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/lib/ThemeContext'
import { hasExceededGuestLimit, incrementGuestPlayCount } from '@/utils/guestLimit'

export default function TranslatePage() {
    const { user, loading } = useAuth()
    const { theme } = useTheme()
    const [history, setHistory] = useState<{ role: string; content: string }[]>([])
    const [input, setInput] = useState('')
    const [loadingAI, setLoadingAI] = useState(false)
    const [blocked, setBlocked] = useState(false)
    const [currentEllieImage, setCurrentEllieImage] = useState('/ellie_talking0001.png')
    const [isTalking, setIsTalking] = useState(false)


    const talkingImages = [
        '/ellie_talking0001.png',
        '/ellie_talking0002.png',
        '/ellie_talking0003.png',
        '/ellie_talking0004.png',
        '/ellie_talking0005.png'
    ]
    const [savingWord, setSavingWord] = useState<string | null>(null)

    useEffect(() => {
        if (!loading && !user && hasExceededGuestLimit()) {
            setBlocked(true)
        }
    }, [loading, user])

    // Animation effect for talking
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        let timeout: NodeJS.Timeout | null = null

        if (isTalking) {
            // Start cycling through talking images
            interval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * talkingImages.length)
                setCurrentEllieImage(talkingImages[randomIndex])
            }, 150) // Change image every 150ms for smooth animation

            // Stop after 2 seconds
            timeout = setTimeout(() => {
                setIsTalking(false)
                setCurrentEllieImage('/ellie_talking0001.png')
                if (interval) clearInterval(interval)
            }, 2000)
        }

        return () => {
            if (interval) clearInterval(interval)
            if (timeout) clearTimeout(timeout)
        }
    }, [isTalking])

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
        setIsTalking(true) // Start talking animation

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

    const saveWord = async (english: string, hebrew: string) => {
        if (!user) {
            alert('Please sign in to save words! 💾')
            return
        }

        const saveKey = `${english}-${hebrew}`
        setSavingWord(saveKey)

        try {
            const response = await fetch('/api/save-word', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    english: english.trim(),
                    hebrew: hebrew.trim(),
                    userUid: user.uid
                })
            })

            const result = await response.json()

            if (response.ok) {
                // Success notification
                const notification = document.createElement('div')
                notification.className = `fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg transform transition-all duration-300`
                notification.innerHTML = '✅ Word saved successfully!'
                document.body.appendChild(notification)

                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)'
                    setTimeout(() => document.body.removeChild(notification), 300)
                }, 2000)
            } else if (response.status === 409) {
                // Already saved
                const notification = document.createElement('div')
                notification.className = `fixed top-4 right-4 z-50 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg`
                notification.innerHTML = '⚠️ Word already saved!'
                document.body.appendChild(notification)

                setTimeout(() => {
                    document.body.removeChild(notification)
                }, 2000)
            } else {
                throw new Error(result.error || 'Failed to save word')
            }
        } catch (error) {
            console.error('Error saving word:', error)
            alert('Failed to save word. Please try again.')
        } finally {
            setSavingWord(null)
        }
    }

    // Helper function to extract English and Hebrew from messages
    const extractTranslationPair = (userContent: string, assistantContent: string) => {
        const english = userContent.trim()
        const hebrew = assistantContent.trim()
        return { english, hebrew }
    }

    if (blocked) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4
                ${theme === 'light'
                ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
                : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}
            >
                <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center
                    ${theme === 'light'
                    ? 'bg-white/90'
                    : 'bg-gray-800/90'}`}
                >
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className={`text-2xl font-bold mb-4
                        ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                    >
                        Oops! You&#39;ve used your 3 free translations!
                    </h2>
                    <p className={`mb-6
                        ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                    >
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
        <div className={`min-h-screen flex items-center justify-center p-6
            ${theme === 'light'
            ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
            : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}
        >
            <div className="flex items-start justify-center gap-8 max-w-none w-full">

                {/* Ellie Character - positioned on the left */}
                <div className="hidden lg:block flex-shrink-0 w-[600px] mt-48 -ml-32">
                    <div className="relative">
                        <img
                            src={currentEllieImage}
                            alt="Ellie the Translator"
                            className={`w-[600px] h-auto drop-shadow-2xl transition-transform duration-300 ${
                                isTalking ? '' : ''
                            }`}
                        />
                        {/* Speech bubble */}
                        <div className={`absolute -top-6 -right-10 backdrop-blur-sm 
                            rounded-2xl p-4 shadow-lg border-2 max-w-sm transition-all duration-300 ${
                            loadingAI ? 'animate-pulse scale-105' : ''
                        } ${theme === 'light'
                            ? 'bg-white/95 border-purple-200'
                            : 'bg-gray-800/95 border-purple-400'}`}
                        >
                            <div className={`font-medium text-sm
                                ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                            >
                                {history.length === 0
                                    ? "Hi! I'm Ellie! 👋 Type something in English and I'll translate it to Hebrew with vowels!"
                                    : loadingAI
                                        ? "Let me think about that... 🤔✨"
                                        : "What else would you like to translate? 😊"
                                }
                            </div>
                            {/* Speech bubble tail */}
                            <div className={`absolute bottom-0 left-10 w-0 h-0 border-l-8 border-r-8
                                border-t-8 border-l-transparent border-r-transparent transform translate-y-full
                                ${theme === 'light'
                                ? 'border-t-white/95'
                                : 'border-t-gray-800/95'}`}
                            ></div>
                        </div>

                        {/* Talking animation sparkles */}
                        {(loadingAI || isTalking) && (
                            <>
                                <div className="absolute top-20 left-16 text-2xl animate-ping">✨</div>
                                <div className="absolute top-32 right-20 text-xl animate-ping delay-150">🌟</div>
                                <div className="absolute top-40 left-24 text-lg animate-ping delay-300">💫</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Chat Container */}
                <div className="flex-1 min-w-0 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className={`text-5xl font-extrabold mb-3
                            ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                        >
                            🌟 Ellie&#39;s Translation Magic 🌟
                        </h1>
                        <p className={`text-xl font-medium
                            ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                        >
                            Let&#39;s learn Hebrew together! 🇮🇱✨
                        </p>
                    </div>

                    {/* Chat Box */}
                    <div className={`backdrop-blur-md rounded-3xl shadow-2xl border-2 overflow-hidden
                        ${theme === 'light'
                        ? 'bg-white/90 border-purple-200'
                        : 'bg-gray-800/90 border-purple-400'}`}
                    >

                        {/* Chat Messages */}
                        <div className={`h-[500px] overflow-auto p-8 space-y-6
                            ${theme === 'light'
                            ? 'bg-gradient-to-b from-purple-50/50 to-pink-50/50'
                            : 'bg-gradient-to-b from-gray-700/50 to-gray-600/50'}`}
                        >

                            {history.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="text-8xl mb-6">🎭</div>
                                    <p className={`text-xl font-medium
                                        ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                                    >
                                        Start your Hebrew adventure! Type something below.
                                    </p>
                                </div>
                            )}

                            {history.map((m, i) => {
                                const isUser = m.role === 'user'
                                const isTranslationPair = !isUser && i > 0 && history[i-1].role === 'user'
                                const userMessage = isTranslationPair ? history[i-1].content : ''
                                const { english, hebrew } = isTranslationPair ?
                                    extractTranslationPair(userMessage, m.content) :
                                    { english: '', hebrew: '' }
                                const saveKey = `${english}-${hebrew}`

                                return (
                                    <div
                                        key={i}
                                        className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-md lg:max-w-lg p-5 rounded-2xl shadow-lg ${
                                            isUser
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-gradient-to-l from-green-400 to-blue-400 text-white'
                                        }`}>
                                            <div className="text-sm font-bold mb-2 opacity-90">
                                                {isUser ? '👦 You (English)' : '🤖 Ellie (עברית)'}
                                            </div>
                                            <div className={`text-base leading-relaxed mb-3 ${
                                                isUser ? 'text-left' : 'text-right'
                                            }`} dir={isUser ? 'ltr' : 'rtl'}>
                                                {m.content}
                                            </div>

                                            {/* Save Button for Hebrew translations */}
                                            {!isUser && isTranslationPair && (
                                                <div className="flex justify-center mt-3">
                                                    <button
                                                        onClick={() => saveWord(english, hebrew)}
                                                        disabled={!user || savingWord === saveKey}
                                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                                                            savingWord === saveKey
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : 'bg-white/20 hover:bg-white/30 hover:scale-105 active:scale-95'
                                                        }`}
                                                        title={user ? 'Save this word to your collection' : 'Sign in to save words'}
                                                    >
                                                        {savingWord === saveKey ? (
                                                            <>
                                                                <span className="animate-spin inline-block mr-1">⏳</span>
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                💾 Save Word
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

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
                        <div className={`p-8 backdrop-blur-sm border-t-2
                            ${theme === 'light'
                            ? 'bg-white/80 border-purple-200'
                            : 'bg-gray-700/80 border-purple-400'}`}
                        >
                            <form onSubmit={handleSubmit} className="flex space-x-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type in English... 🌟"
                                    className={`flex-1 px-6 py-4 rounded-full border-2 
                                        focus:border-purple-500 outline-none transition-all duration-200
                                        text-base font-medium backdrop-blur-sm
                                        ${theme === 'light'
                                        ? 'border-purple-300 text-purple-800 placeholder-purple-400 bg-white/90'
                                        : 'border-purple-400 text-purple-200 placeholder-purple-300 bg-gray-800/90'}`}
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
                            <div className={`mt-4 text-center text-sm
                                ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                            >
                                {!user && (
                                    <p>
                                        🎯 Free translations left: {Math.max(0, 3 - (parseInt(localStorage.getItem('guestPlayCount') || '0')))}
                                        <span className="mx-2">•</span>
                                        <span className="text-yellow-600 font-bold">💾 Sign in to save words!</span>
                                    </p>
                                )}
                                {user && history.length > 0 && (
                                    <p>
                                        🎉 You&#39;ve learned {Math.floor(history.length / 2)} Hebrew phrases today!
                                        <span className="mx-2">•</span>
                                        <span className="text-green-600 font-bold">💾 Click "Save Word" to build your collection!</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Ellie (shows on smaller screens) */}
                <div className="lg:hidden fixed bottom-6 right-6 z-10">
                    <img
                        src={currentEllieImage}
                        alt="Ellie"
                        className={`w-80 h-auto drop-shadow-lg opacity-90 transition-transform duration-300 ${
                            isTalking ? '' : ''
                        }`}
                    />
                    {(loadingAI || isTalking) && (
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