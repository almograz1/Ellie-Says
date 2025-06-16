// app/games/page.tsx
'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTheme } from '@/lib/ThemeContext'

interface GameOption {
  id: string
  title: string
  description: string
  icon: string
}

const initialGames: GameOption[] = [
  {
    id: 'word-match',
    title: 'Word Match',
    description: 'Match words with their correct meanings',
    icon: '🔤'
  },
  {
    id: 'TriviaGame',
    title: 'Trivia Game',
    description: 'Pick the correct English meaning for Hebrew words',
    icon: '🎮'
  },
  {
    id: 'SentenceGame',
    title: 'Sentence Completion',
    description: 'Fill in the blanks to complete the sentence',
    icon: '📝'
  }
]

export default function GamesPage() {
  const router = useRouter()
  const games = useMemo(() => initialGames, [])
  const { theme } = useTheme()

  return (
    <div
      className={`min-h-screen ${
        theme === 'light'
          ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
          : 'bg-gradient-to-br from-gray-900 via-purple-900 to-black'
      }`}
    >
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1
          className={`text-4xl font-bold mb-4 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}
        >
          Learn Through Play
        </h1>
        <p
          className={`text-lg mb-12 text-center ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}
        >
          Choose from our collection of engaging language games designed to make learning fun and effective.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <div
              key={game.id}
              className={`rounded-xl shadow-md p-6 cursor-pointer transition duration-300 ease-in-out hover:scale-[1.02] ${
                theme === 'light'
                  ? 'bg-white hover:shadow-lg'
                  : 'bg-gray-800 hover:shadow-2xl hover:shadow-purple-500/20'
              }`}
              onClick={() => router.push(`/games/${game.id}`)}
            >
              <div className="text-center mb-4 text-5xl">{game.icon}</div>
              <h3
                className={`text-xl font-bold mb-2 text-center ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}
              >
                {game.title}
              </h3>
              <p
                className={`text-center ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                {game.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}