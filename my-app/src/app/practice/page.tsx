'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface PracticeTopic {
  id: string
  title: string
  description: string
  icon: string
}

// Replace these with your real practice exercises
const initialTopics: PracticeTopic[] = [
  { id: 'speaking',   title: 'Speaking Drill',     description: 'Record yourself and compare pronunciation', icon: '🎤' },
  { id: 'listening',  title: 'Listening Comprehension', description: 'Listen and answer questions', icon: '🎧' },
  { id: 'writing',    title: 'Writing Practice',   description: 'Compose short answers or essays', icon: '✍️' },
  { id: 'reading',    title: 'Reading Passage',    description: 'Read a paragraph and answer quizzes', icon: '📖' },
  { id: 'flashcards', title: 'Flashcard Review',   description: 'Quickly review key vocabulary', icon: '🃏' },
]

export default function PracticePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const topics = useMemo(
      () =>
          initialTopics.filter(t =>
              t.title.toLowerCase().includes(searchTerm.toLowerCase())
          ),
      [searchTerm]
  )

  const handleSelect = useCallback(
      (id: string) => {
        router.push(`/practice/${id}`)
      },
      [router]
  )

  return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-blue-50 to-green-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            Practice Exercises
          </h1>
          <div className="mb-8">
            <input
                type="text"
                placeholder="Search exercises…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {topics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topics.map(topic => (
                    <div
                        key={topic.id}
                        onClick={() => handleSelect(topic.id)}
                        className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg flex flex-col"
                    >
                      <div className="text-5xl mb-4">{topic.icon}</div>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        {topic.title}
                      </h3>
                      <p className="text-gray-600 flex-grow">{topic.description}</p>
                      <button className="mt-4 self-end text-blue-600 font-medium hover:underline">
                        Start
                      </button>
                    </div>
                ))}
              </div>
          ) : (
              <p className="text-center text-gray-500">No exercises found.</p>
          )}
        </main>
      </div>
  )
}