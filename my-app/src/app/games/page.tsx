// Games hub page
// - Lists all available games with icons, descriptions, and difficulty
// - Uses theme context for dynamic styling
// - Clicking a game navigates to its page

'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { useTheme } from '@/lib/ThemeContext'

// GameOption describes the structure for each game in the list
interface GameOption {
  id: string
  title: string
  description: string
  icon: string
  color: string
  difficulty: string
}

/* ── update the list ── */
const initialGames: GameOption[] = [
  {
    id: 'word-match',
    title: 'Word Match Magic',
    description: 'Match Hebrew words with their English meanings! Like a super fun puzzle! 🧩',
    icon: '🔤',
    color: 'from-blue-400 to-cyan-400',
    difficulty: 'Easy'
  },
  {
    id: 'TriviaGame',
    title: 'Hebrew Trivia Challenge',
    description: 'Answer trivia questions about Hebrew words and meanings! Test your knowledge! 🧠',
    icon: '🎮',
    color: 'from-green-400 to-emerald-400',
    difficulty: 'Medium'
  },
  {
    id: 'photo-word',                                // 👈 new slug
    title: 'Image Word',
    description: 'Drag letters to spell the Hebrew word that matches the picture! 🖼️',
    icon: '🖼️',
    color: 'from-orange-400 to-red-400',
    difficulty: 'Medium'
  }
]

export default function GamesPage() {
  const router = useRouter()
  // Memoize games list
  const games  = useMemo(() => initialGames, [])
  const { theme } = useTheme()
  const [hoveredGame, setHoveredGame] = useState<string | null>(null)

  // Returns color classes for difficulty badge
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':   return theme === 'light'
          ? 'text-green-600 bg-green-100'
          : 'text-green-300 bg-green-900/30'
      case 'Medium': return theme === 'light'
          ? 'text-yellow-600 bg-yellow-100'
          : 'text-yellow-300 bg-yellow-900/30'
      case 'Hard':   return theme === 'light'
          ? 'text-red-600 bg-red-100'
          : 'text-red-300 bg-red-900/30'
      default:       return theme === 'light'
          ? 'text-gray-600 bg-gray-100'
          : 'text-gray-300 bg-gray-900/30'
    }
  }

  return (
      <div
          className={`min-h-screen ${
              theme === 'light'
                  ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
                  : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'
          }`}
      >
        <Navbar />

        <div className="flex items-start justify-center gap-0 max-w-none w-full pt-24">
          {/* Ellie Character - positioned on the left with zoom-fixed sizing like translate page */}
          <div className="hidden lg:block flex-shrink-0 w-[600px] mt-60 -ml-142">
            <div className="relative">
              <img
                  src="/ellie0002.png"
                  alt="Ellie the Game Master"
                  className="w-[600px] h-auto drop-shadow-2xl transition-transform duration-300"
              />
              {/* Speech bubble */}
              <div className={`absolute -top-28 -right-40 backdrop-blur-sm 
                rounded-2xl p-4 shadow-lg border-2 max-w-sm transition-all duration-300 ${
                  theme === 'light'
                      ? 'bg-white/95 border-purple-200'
                      : 'bg-gray-800/95 border-purple-400'
              }`}
              >
                <div className={`font-medium text-sm
                  ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                >
                  {!hoveredGame &&
                      "Ready to play some awesome Hebrew games? Pick your favorite and let's start learning! 🎮✨"}
                  {hoveredGame === 'word-match' &&
                      'Word Match is perfect for beginners! Match Hebrew words with English meanings! 🔤💫'}
                  {hoveredGame === 'TriviaGame' &&
                      'Trivia Challenge will test your Hebrew knowledge! Answer fun questions and learn! 🧠🎯'}
                  {hoveredGame === 'photo-word' &&
                      'Image Word lets you drag letters to spell the Hebrew word for the picture! 🖼️✏️'}
                </div>
                {/* Speech bubble tail */}
                <div className={`absolute bottom-0 left-10 w-0 h-0 border-l-8 border-r-8
                  border-t-8 border-l-transparent border-r-transparent transform translate-y-full
                  ${theme === 'light'
                    ? 'border-t-white/95'
                    : 'border-t-gray-800/95'}`}
                ></div>
              </div>
            </div>
          </div>

          {/* Main Content Container */}
          <div className="flex-1 min-w-0 max-w-4xl px-6 py-12 lg:pb-12 pb-32">
            {/* Centered Header */}
            <div className="text-center mb-12">
              <h1
                  className={`text-5xl font-extrabold mb-4 ${
                      theme === 'light' ? 'text-purple-800' : 'text-purple-200'
                  }`}
              >
                🎮 Ellie&apos;s Game Zone! 🎮
              </h1>
              <p
                  className={`text-xl font-medium mb-2 ${
                      theme === 'light' ? 'text-purple-600' : 'text-purple-300'
                  }`}
              >
                Learn Hebrew through super fun games! 🚀
              </p>
              <p
                  className={`text-lg ${
                      theme === 'light' ? 'text-purple-500' : 'text-purple-400'
                  }`}
              >
                Pick a game and let&apos;s make learning an adventure! ✨
              </p>
            </div>

            {/* Games grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {games.map((game) => (
                  <div
                      key={game.id}
                      className={`backdrop-blur-md rounded-3xl shadow-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${
                          theme === 'light'
                              ? 'bg-white/90 border-purple-200 hover:shadow-purple-300/50'
                              : 'bg-gray-800/90 border-purple-400 hover:shadow-purple-500/30'
                      }`}
                      onClick={() => router.push(`/games/${game.id}`)}
                      onMouseEnter={() => setHoveredGame(game.id)}
                      onMouseLeave={() => setHoveredGame(null)}
                  >
                    {/* Header */}
                    <div
                        className={`bg-gradient-to-r ${game.color} p-6 text-center relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                      <div className="relative z-10">
                        <div className="text-6xl mb-3">{game.icon}</div>
                        <div
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(
                                game.difficulty
                            )}`}
                        >
                          {game.difficulty}
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 text-xl animate-pulse">
                        ✨
                      </div>
                      <div className="absolute bottom-2 left-2 text-lg animate-pulse delay-150">
                        🌟
                      </div>
                    </div>

                    {/* Body */}
                    <div
                        className={`p-6 ${
                            theme === 'light'
                                ? 'bg-gradient-to-b from-purple-50/50 to-pink-50/50'
                                : 'bg-gradient-to-b from-gray-700/50 to-gray-600/50'
                        }`}
                    >
                      <h3
                          className={`text-2xl font-bold mb-3 text-center ${
                              theme === 'light' ? 'text-purple-800' : 'text-purple-200'
                          }`}
                      >
                        {game.title}
                      </h3>
                      <p
                          className={`text-center leading-relaxed ${
                              theme === 'light'
                                  ? 'text-purple-600'
                                  : 'text-purple-300'
                          }`}
                      >
                        {game.description}
                      </p>

                      {/* Play button */}
                      <div className="mt-6 text-center">
                        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200">
                          <span>Let&apos;s Play!</span>
                          <span className="text-lg">🚀</span>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* Mobile Ellie - repositioned to avoid overlap */}
          <div className="lg:hidden">
            {/* Mobile Ellie with speech bubble */}
            <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
              <div className="relative flex justify-center items-end">
                {/* Speech bubble for mobile */}
                {hoveredGame && (
                    <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 backdrop-blur-sm 
                    rounded-2xl p-3 shadow-lg border-2 max-w-xs transition-all duration-300 pointer-events-none ${
                        theme === 'light'
                            ? 'bg-white/95 border-purple-200'
                            : 'bg-gray-800/95 border-purple-400'
                    }`}
                    >
                      <div className={`font-medium text-xs text-center
                      ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                      >
                        {hoveredGame === 'word-match' &&
                            'Word Match is perfect for beginners! 🔤💫'}
                        {hoveredGame === 'TriviaGame' &&
                            'Test your Hebrew knowledge with trivia! 🧠🎯'}
                        {hoveredGame === 'photo-word' &&
                            'Drag letters to spell the Hebrew word! 🖼️✏️'}
                      </div>
                      {/* Speech bubble tail */}
                      <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6
                      border-t-6 border-l-transparent border-r-transparent translate-y-full
                      ${theme === 'light'
                          ? 'border-t-white/95'
                          : 'border-t-gray-800/95'}`}
                      ></div>
                    </div>
                )}

                {/* Ellie character */}
                <img
                    src="/ellie0002.png"
                    alt="Ellie"
                    className={`w-24 h-auto drop-shadow-lg transition-transform duration-300 ${
                        hoveredGame ? 'animate-bounce' : ''
                    }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}