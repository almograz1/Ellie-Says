'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'
import Navbar from '@/components/Navbar'
import { app } from '@/firebase'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function ContactPage() {
    const { theme } = useTheme()
    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const db = getFirestore(app)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')
        try {
            await addDoc(collection(db, 'contacts'), {
                ...formData,
                createdAt: serverTimestamp(),
            })
            setStatus('success')
            setFormData({ name: '', email: '', message: '' })
        } catch (error) {
            console.error(error)
            setStatus('error')
        }
    }

    return (
        <div className={`min-h-screen
            ${theme === 'light'
            ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
            : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}
        >
            <Navbar />

            <main className="max-w-7xl mx-auto p-6 pt-24">
                <div className="flex items-start justify-center gap-8 relative">

                    {/* Ellie Character - Pushed to Left Side */}
                    <div className="hidden lg:block absolute left-0 top-0">
                        <div className="relative">
                            <img
                                src="/ellie-fullbody.png"
                                alt="Ellie wants to hear from you!"
                                className={`w-60 h-auto drop-shadow-2xl transition-transform duration-300 ${
                                    status === 'sending' ? 'animate-bounce' : ''
                                }`}
                            />

                            {/* Speech bubble */}
                            <div className={`absolute -top-6 -right-8 backdrop-blur-sm 
                                rounded-2xl p-3 shadow-lg border-2 max-w-xs transition-all duration-300 ${
                                status === 'sending' ? 'animate-pulse scale-105' : ''
                            } ${theme === 'light'
                                ? 'bg-white/95 border-purple-200'
                                : 'bg-gray-800/95 border-purple-400'}`}
                            >
                                <div className={`font-medium text-xs
                                    ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                                >
                                    {status === 'idle' && "Hi there! I'd love to hear from you! Tell me what's on your mind!"}
                                    {status === 'sending' && "Sending your message through my magic mailbox..."}
                                    {status === 'success' && "Yay! Got your message! I'll get back to you super soon!"}
                                    {status === 'error' && "Oops! My mailbox got a little confused. Can you try again?"}
                                </div>
                                {/* Speech bubble tail */}
                                <div className={`absolute bottom-0 left-8 w-0 h-0 border-l-6 border-r-6
                                    border-t-6 border-l-transparent border-r-transparent transform translate-y-full
                                    ${theme === 'light'
                                    ? 'border-t-white/95'
                                    : 'border-t-gray-800/95'}`}
                                ></div>
                            </div>

                            {/* Animation sparkles */}
                            {status === 'sending' && (
                                <>
                                    <div className="absolute top-20 left-12 text-xl animate-ping">•</div>
                                    <div className="absolute top-32 right-16 text-lg animate-ping delay-150">•</div>
                                    <div className="absolute top-40 left-16 text-base animate-ping delay-300">•</div>
                                </>
                            )}

                            {status === 'success' && (
                                <>
                                    <div className="absolute top-16 left-8 text-2xl animate-bounce">•</div>
                                    <div className="absolute top-28 right-12 text-xl animate-bounce delay-150">•</div>
                                    <div className="absolute top-44 left-12 text-xl animate-bounce delay-300">•</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main Contact Form Container - Centered */}
                    <div className="w-full max-w-2xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className={`text-5xl font-extrabold mb-3
                                ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                            >
                                Let's Chat with Ellie!
                            </h1>
                            <p className={`text-xl font-medium
                                ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                            >
                                Questions? Ideas? Just want to say hi? I'm all ears!
                            </p>
                        </div>

                        {/* Contact Form Card */}
                        <div className={`backdrop-blur-md rounded-3xl shadow-2xl border-2 overflow-hidden
                            ${theme === 'light'
                            ? 'bg-white/90 border-purple-200'
                            : 'bg-gray-800/90 border-purple-400'}`}
                        >

                            {status === 'success' ? (
                                /* Success Message */
                                <div className={`p-12 text-center
                                    ${theme === 'light'
                                    ? 'bg-gradient-to-b from-green-50/50 to-blue-50/50'
                                    : 'bg-gradient-to-b from-green-900/30 to-blue-900/30'}`}
                                >
                                    <div className="text-8xl mb-6 animate-bounce">🎉</div>
                                    <h2 className={`text-3xl font-bold mb-4
                                        ${theme === 'light' ? 'text-green-700' : 'text-green-300'}`}
                                    >
                                        Message Sent Successfully!
                                    </h2>
                                    <p className={`text-xl mb-6
                                        ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}
                                    >
                                        Thanks for reaching out! Ellie received your message and will get back to you soon! 🚀
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500
                                            hover:from-purple-600 hover:to-pink-600 text-white font-bold
                                            rounded-full shadow-lg transform hover:scale-105
                                            transition-all duration-200"
                                    >
                                        Send Another Message 📝
                                    </button>
                                </div>
                            ) : (
                                /* Contact Form */
                                <form onSubmit={handleSubmit} className={`p-8
                                    ${theme === 'light'
                                    ? 'bg-gradient-to-b from-purple-50/50 to-pink-50/50'
                                    : 'bg-gradient-to-b from-gray-700/50 to-gray-600/50'}`}
                                >
                                    <div className="space-y-6">

                                        {/* Name Field */}
                                        <div>
                                            <label htmlFor="name" className={`block font-bold text-lg mb-2
                                                ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                                            >
                                                🌟 What's your name, friend?
                                            </label>
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Your awesome name here! ✨"
                                                className={`w-full px-6 py-4 rounded-2xl border-2 
                                                    focus:border-purple-500 outline-none transition-all duration-200
                                                    text-base font-medium backdrop-blur-sm
                                                    ${theme === 'light'
                                                    ? 'border-purple-300 text-purple-800 placeholder-purple-400 bg-white/90'
                                                    : 'border-purple-400 text-purple-200 placeholder-purple-300 bg-gray-800/90'}`}
                                                disabled={status === 'sending'}
                                            />
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label htmlFor="email" className={`block font-bold text-lg mb-2
                                                ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                                            >
                                                📧 Your email address
                                            </label>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="your.email@example.com 📬"
                                                className={`w-full px-6 py-4 rounded-2xl border-2 
                                                    focus:border-purple-500 outline-none transition-all duration-200
                                                    text-base font-medium backdrop-blur-sm
                                                    ${theme === 'light'
                                                    ? 'border-purple-300 text-purple-800 placeholder-purple-400 bg-white/90'
                                                    : 'border-purple-400 text-purple-200 placeholder-purple-300 bg-gray-800/90'}`}
                                                disabled={status === 'sending'}
                                            />
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label htmlFor="message" className={`block font-bold text-lg mb-2
                                                ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                                            >
                                                💭 Tell Ellie what's on your mind!
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={6}
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                placeholder="Share your thoughts, questions, feedback, or just say hello! Ellie loves hearing from you! 🌈"
                                                className={`w-full px-6 py-4 rounded-2xl border-2 
                                                    focus:border-purple-500 outline-none transition-all duration-200
                                                    text-base font-medium backdrop-blur-sm resize-none
                                                    ${theme === 'light'
                                                    ? 'border-purple-300 text-purple-800 placeholder-purple-400 bg-white/90'
                                                    : 'border-purple-400 text-purple-200 placeholder-purple-300 bg-gray-800/90'}`}
                                                disabled={status === 'sending'}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <div className="text-center pt-4">
                                            <button
                                                type="submit"
                                                disabled={status === 'sending'}
                                                className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500
                                                    hover:from-purple-600 hover:to-pink-600 text-white font-bold
                                                    rounded-full shadow-lg transform hover:scale-105
                                                    transition-all duration-200 disabled:opacity-50
                                                    disabled:cursor-not-allowed disabled:transform-none text-xl"
                                            >
                                                {status === 'sending' ? (
                                                    <span className="flex items-center space-x-2">
                                                        <span>Sending Magic Message</span>
                                                        <div className="flex space-x-1">
                                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                                                        </div>
                                                    </span>
                                                ) : (
                                                    '🚀 Send to Ellie! 💌'
                                                )}
                                            </button>
                                        </div>

                                        {/* Error Message */}
                                        {status === 'error' && (
                                            <div className={`text-center p-4 rounded-2xl
                                                ${theme === 'light'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-red-900/50 text-red-300'}`}
                                            >
                                                <div className="text-3xl mb-2">😅</div>
                                                <p className="font-medium">
                                                    Oops! Something went wrong with the magic mailbox.
                                                    Can you try sending your message again?
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Fun Footer Info */}
                        <div className={`mt-8 text-center text-lg font-medium
                            ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                        >
                            <p className="mb-2">🎯 Ellie usually replies within 24 hours!</p>
                            <p>📚 Questions about Hebrew learning? Technical issues? Just want to chat? All welcome! 🌟</p>
                        </div>
                    </div>

                    {/* Mobile Ellie (shows on smaller screens) */}
                    <div className="lg:hidden fixed bottom-6 right-6 z-10">
                        <img
                            src="/ellie-fullbody.png"
                            alt="Ellie"
                            className={`w-24 h-auto drop-shadow-lg opacity-90 transition-transform duration-300 ${
                                status === 'sending' ? 'animate-bounce' : ''
                            }`}
                        />
                        {status === 'sending' && (
                            <>
                                <div className="absolute -top-2 -left-2 text-lg animate-ping">📮</div>
                                <div className="absolute -top-1 -right-1 text-sm animate-ping delay-150">💌</div>
                            </>
                        )}
                        {status === 'success' && (
                            <>
                                <div className="absolute -top-2 -left-2 text-lg animate-bounce">🎉</div>
                                <div className="absolute -top-1 -right-1 text-sm animate-bounce delay-150">🌟</div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}