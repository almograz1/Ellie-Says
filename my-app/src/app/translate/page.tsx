// app/translate/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/useAuth'
import { useTheme } from '@/lib/ThemeContext'
import { hasExceededGuestLimit, incrementGuestPlayCount } from '@/utils/guestLimit'

// Move talkingImages outside the component to prevent re-creation on every render
const talkingImages = [
    '/ellie_talking0001.png',
    '/ellie_talking0002.png',
    '/ellie_talking0003.png',
    '/ellie_talking0004.png',
    '/ellie_talking0005.png'
]

export default function TranslatePage() {
    // Functional variables (hooks)
    const { user, loading } = useAuth()
    const { theme } = useTheme()
    const [history, setHistory] = useState<{ role: string; content: string }[]>([]) // setHistory used for handleSubmit or for fetch Gemini response
    const [input, setInput] = useState('')
    const [loadingAI, setLoadingAI] = useState(false)
    const [blocked, setBlocked] = useState(false)
    const [currentEllieImage, setCurrentEllieImage] = useState('/ellie_talking0001.png')
    const [isTalking, setIsTalking] = useState(false)
    const [savingWord, setSavingWord] = useState<string | null>(null)
    const [guestPlayCount, setGuestPlayCount] = useState(0)
    const [isClient, setIsClient] = useState(false)

    // Add client-side check
    useEffect(() => {
        setIsClient(true)
        // Only access localStorage after component mounts on client
        const count = parseInt(localStorage.getItem('guestPlayCount') || '0')
        setGuestPlayCount(count)
    }, [])

    useEffect(() => {
        if (!loading && !user && hasExceededGuestLimit()) {
            setBlocked(true)
        }
    }, [loading, user])

    // Fixed animation effect - removed talkingImages from dependency array
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
    }, [isTalking]) // Only depend on isTalking

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || blocked) return

        if (!user) {
            incrementGuestPlayCount()
            if (hasExceededGuestLimit()) {
                setBlocked(true)
                return
            }
            // Update local state
            const newCount = parseInt(localStorage.getItem('guestPlayCount') || '0')
            setGuestPlayCount(newCount)
        }

        const userMsg = { role: 'user', content: input }
        setHistory((h) => [...h, userMsg])
        setLoadingAI(true)
        setIsTalking(true) // Start talking animation

        try {
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
        } catch (error) {
            setLoadingAI(false)
            console.error('Translation error:', error)
            alert('Failed to translate. Please try again.')
        }
    }, [input, blocked, user, history])

    // Helper function to check if a string is a short phrase (1-4 words)
    const isShortPhrase = (text: string): boolean => {
        const trimmed = text.trim()
        // Remove common Hebrew vowel marks (nikud) for word counting
        const withoutVowels = trimmed.replace(/[\u0591-\u05C7]/g, '')
        // Split by whitespace and filter out empty strings
        const words = withoutVowels.split(/\s+/).filter(word => word.length > 0)
        return words.length >= 1 && words.length <= 4
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
                notification.className = 'fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg transform transition-all duration-300'
                notification.innerHTML = '✅ Word saved successfully!'
                document.body.appendChild(notification)

                setTimeout(() => {
                    notification.style.transform = 'translateX(100%)'
                    setTimeout(() => document.body.removeChild(notification), 300)
                }, 2000)
            } else if (response.status === 409) {
                // Already saved
                const notification = document.createElement('div')
                notification.className = 'fixed top-4 right-4 z-50 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-lg'
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

    // Helper function to check if both input and output are short phrases (not conversations)
    const canSaveWord = (userContent: string, assistantContent: string): boolean => {
        return isShortPhrase(userContent) && isShortPhrase(assistantContent)
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
        <div className={`min-h-screen flex items-center justify-center p-6 lg:p-6
            ${theme === 'light'
            ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
            : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}
        >
            <div className="flex items-start justify-center gap-8 max-w-none w-full">

                {/* Ellie Character - positioned on the left (desktop only) */}
                <div className="hidden lg:block flex-shrink-0 w-[600px] mt-48 -ml-32">
                    <div className="relative">
                        <Image
                            src={currentEllieImage}
                            alt="Ellie the Translator"
                            width={600}
                            height={600}
                            className={`w-[600px] h-auto drop-shadow-2xl transition-transform duration-300 ${
                                isTalking ? '' : ''
                            }`}
                            priority
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
                        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3
                            ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                        >
                            🌟 Ellie&#39;s Translation Magic 🌟
                        </h1>
                        <p className={`text-lg sm:text-xl font-medium
                            ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                        >
                            Let&#39;s learn Hebrew together! 🇮🇱✨
                        </p>
                    </div>

                    {/* Mobile Ellie - positioned above chat box */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="relative">
                            <Image
                                src={currentEllieImage}
                                alt="Ellie the Translator"
                                width={200}
                                height={200}
                                className={`w-48 h-auto drop-shadow-lg transition-transform duration-300 ${
                                    isTalking ? '' : ''
                                }`}
                                priority
                            />
                            {/* Mobile speech bubble */}
                            <div className={`absolute -top-4 -right-2 backdrop-blur-sm 
                                rounded-xl p-2 shadow-lg border-2 max-w-xs text-xs transition-all duration-300 ${
                                loadingAI ? 'animate-pulse scale-105' : ''
                            } ${theme === 'light'
                                ? 'bg-white/95 border-purple-200'
                                : 'bg-gray-800/95 border-purple-400'}`}
                            >
                                <div className={`font-medium
                                    ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                                >
                                    {history.length === 0
                                        ? "Hi! I'm Ellie! 👋"
                                        : loadingAI
                                            ? "Thinking... 🤔✨"
                                            : "Ready! 😊"
                                    }
                                </div>
                                {/* Mobile speech bubble tail */}
                                <div className={`absolute bottom-0 left-6 w-0 h-0 border-l-4 border-r-4
                                    border-t-4 border-l-transparent border-r-transparent transform translate-y-full
                                    ${theme === 'light'
                                    ? 'border-t-white/95'
                                    : 'border-t-gray-800/95'}`}
                                ></div>
                            </div>

                            {/* Mobile talking animation sparkles */}
                            {(loadingAI || isTalking) && (
                                <>
                                    <div className="absolute top-4 left-4 text-lg animate-ping">✨</div>
                                    <div className="absolute top-8 right-4 text-sm animate-ping delay-150">🌟</div>
                                    <div className="absolute top-12 left-8 text-xs animate-ping delay-300">💫</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chat Box */}
                    <div className={`backdrop-blur-md rounded-3xl shadow-2xl border-2 overflow-hidden
                        ${theme === 'light'
                        ? 'bg-white/90 border-purple-200'
                        : 'bg-gray-800/90 border-purple-400'}`}
                    >

                        {/* Chat Messages */}
                        <div className={`h-[400px] sm:h-[500px] overflow-auto p-4 sm:p-8 space-y-6
                            ${theme === 'light'
                            ? 'bg-gradient-to-b from-purple-50/50 to-pink-50/50'
                            : 'bg-gradient-to-b from-gray-700/50 to-gray-600/50'}`}
                        >

                            {history.length === 0 && (
                                <div className="text-center py-8 sm:py-16">
                                    <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">🎭</div>
                                    <p className={`text-lg sm:text-xl font-medium
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
                                const canSave = isTranslationPair && canSaveWord(userMessage, m.content)

                                return (
                                    <div
                                        key={i}
                                        className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-sm sm:max-w-md lg:max-w-lg p-4 sm:p-5 rounded-2xl shadow-lg ${
                                            isUser
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-gradient-to-l from-green-400 to-blue-400 text-white'
                                        }`}>
                                            <div className="text-xs sm:text-sm font-bold mb-2 opacity-90">
                                                {isUser ? '👦 You (English)' : '🤖 Ellie (עברית)'}
                                            </div>
                                            <div className={`text-sm sm:text-base leading-relaxed mb-3 ${
                                                isUser ? 'text-left' : 'text-right'
                                            }`} dir={isUser ? 'ltr' : 'rtl'}>
                                                {m.content}
                                            </div>

                                            {/* Save Button for Hebrew translations - only show for single words */}
                                            {!isUser && isTranslationPair && canSave && (
                                                <div className="flex justify-center mt-3">
                                                    <button
                                                        onClick={() => saveWord(english, hebrew)}
                                                        disabled={!user || savingWord === saveKey}
                                                        className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 ${
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

                                            {/* Info message when save button is not shown */}
                                            {!isUser && isTranslationPair && !canSave && (
                                                <div className="flex justify-center mt-3">
                                                    <div className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm opacity-70 bg-white/10">
                                                        💡 Only short phrases (1-4 words) can be saved
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            {loadingAI && (
                                <div className="flex justify-end">
                                    <div className="bg-gradient-to-l from-yellow-400 to-orange-400
                                        text-white p-4 sm:p-5 rounded-2xl shadow-lg animate-pulse">
                                        <div className="flex items-center space-x-3">
                                            <div className="animate-bounce">🤖</div>
                                            <div className="text-sm sm:text-base">Ellie is thinking...</div>
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
                        <div className={`p-4 sm:p-8 backdrop-blur-sm border-t-2
                            ${theme === 'light'
                            ? 'bg-white/80 border-purple-200'
                            : 'bg-gray-700/80 border-purple-400'}`}
                        >
                            <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-4">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type in English... 🌟"
                                    className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-full border-2 
                                        focus:border-purple-500 outline-none transition-all duration-200
                                        text-sm sm:text-base font-medium backdrop-blur-sm
                                        ${theme === 'light'
                                        ? 'border-purple-300 text-purple-800 placeholder-purple-400 bg-white/90'
                                        : 'border-purple-400 text-purple-200 placeholder-purple-300 bg-gray-800/90'}`}
                                    disabled={loadingAI}
                                />
                                <button
                                    type="submit"
                                    disabled={loadingAI || !input.trim()}
                                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500
                                        hover:from-purple-600 hover:to-pink-600 text-white font-bold
                                        rounded-full shadow-lg transform hover:scale-105
                                        transition-all duration-200 disabled:opacity-50
                                        disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
                                >
                                    {loadingAI ? '✨' : '🚀'}
                                </button>
                            </form>

                            {/* Fun stats */}
                            <div className={`mt-4 text-center text-xs sm:text-sm
                                ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                            >
                                {!user && isClient && (
                                    <p>
                                        🎯 Free translations left: {Math.max(0, 3 - guestPlayCount)}
                                        <span className="mx-2">•</span>
                                        <span className="text-yellow-600 font-bold">💾 Sign in to save words!</span>
                                    </p>
                                )}
                                {user && history.length > 0 && (
                                    <p>
                                        🎉 You&#39;ve learned {Math.floor(history.length / 2)} Hebrew phrases!
                                        <span className="mx-2">•</span>
                                        <span className="text-green-600 font-bold">💾 Short phrases (1-4 words) can be saved to your collection!</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}