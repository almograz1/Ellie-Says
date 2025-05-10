// app/quiz/page.tsx
'use client'
import { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface QuizCategory {
  id: string
  title: string
  description: string
  icon: string
  difficulty: string
}

const initialCategories: QuizCategory[] = [
  { id: 'vocabulary', title: 'Vocabulary Builder', description: 'Test and expand your vocabulary knowledge', icon: '📚', difficulty: 'Beginner' },
  { id: 'grammar',     title: 'Grammar Challenge',     description: 'Master the rules of grammar and sentence structure', icon: '📝', difficulty: 'Intermediate' },
  { id: 'pronunciation', title: 'Pronunciation Test',   description: 'Challenge your pronunciation and listening skills', icon: '🔊', difficulty: 'All Levels' },
  { id: 'idioms',       title: 'Idioms & Expressions',  description: 'Learn common phrases and idiomatic expressions', icon: '💬', difficulty: 'Advanced' },
  { id: 'culture',      title: 'Cultural Knowledge',    description: 'Test your understanding of cultural contexts', icon: '🌍', difficulty: 'Intermediate' },
  { id: 'daily',        title: 'Daily Quiz',            description: 'A new mixed quiz every day to keep your skills sharp', icon: '🏆', difficulty: 'Mixed' }
]

export default function QuizPage() {
  const router = useRouter()
  const quizCategories = useMemo(() => initialCategories, [])
  const handleRandom = useCallback(() => {
    const random = quizCategories[Math.floor(Math.random() * quizCategories.length)]
    router.push(`/quiz/${random.id}`)
  }, [quizCategories, router])

  return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-blue-50 to-green-50">
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Test Your Knowledge</h1>
            <p className="text-lg text-gray-600 mb-6">Challenge yourself with our interactive quizzes designed to test and improve your language skills.</p>
            <div className="flex gap-4">
              <button onClick={handleRandom} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg">Start Random Quiz</button>
              <button onClick={() => router.push('/leaderboard')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg">View Leaderboard</button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizCategories.map(cat => (
                <div key={cat.id} onClick={() => router.push(`/quiz/${cat.id}`)} className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-4xl">{cat.icon}</span>
                    <span className="text-xs font-semibold px-3 py-1 bg-gray-100 rounded-full">{cat.difficulty}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{cat.title}</h3>
                  <p className="text-gray-600">{cat.description}</p>
                </div>
            ))}
          </div>
        </main>
      </div>
  )
}