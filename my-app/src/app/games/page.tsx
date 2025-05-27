// app/games/page.tsx
'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface GameOption {
  id: string
  title: string
  description: string
  icon: string
}

const initialGames: GameOption[] = [
  { id: 'word-match',      title: 'Word Match',       description: 'Match words with their correct meanings', icon: '🔤' },
  { id: 'pronunciation',   title: 'Pronunciation Practice', description: 'Perfect your accent with our audio tool', icon: '🔊' },
  { id: 'sentence-builder',title: 'Sentence Builder', description: 'Create correct sentences from scrambled words', icon: '📝' },
  { id: 'TriviaGame',      title: 'Trivia Game',       description: 'Pick the correct English meaning for Hebrew words', icon: '🎮' }, // 🔄 Changed from flashcards
  { id: 'listening-challenge', title: 'Listening Challenge', description: 'Test your listening comprehension skills', icon: '👂' },
  { id: 'daily-challenge',  title: 'Daily Challenge',  description: 'A new language challenge every day', icon: '🏆' }
]

export default function GamesPage() {
  const router = useRouter()
  const games = useMemo(() => initialGames, [])

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-blue-50 to-green-50">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Learn Through Play</h1>
        <p className="text-lg text-gray-600 mb-12 text-center">Choose from our collection of engaging language games designed to make learning fun and effective.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <div
              key={game.id}
              className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition duration-300 ease-in-out hover:scale-[1.02]"
              onClick={() => router.push(`/games/${game.id}`)}
            >
              <div className="text-center mb-4 text-5xl">{game.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{game.title}</h3>
              <p className="text-gray-600 text-center">{game.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
