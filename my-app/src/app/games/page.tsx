import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const Games: FC = () => {
  // Game options with their details
  const gameOptions = [
    {
      id: "word-match",
      title: "Word Match",
      description: "Match words with their correct meanings",
      icon: "🔤",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-300",
      textColor: "text-blue-700",
    },
    {
      id: "pronunciation",
      title: "Pronunciation Practice",
      description: "Perfect your accent with our audio comparison tool",
      icon: "🔊",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-300",
      textColor: "text-purple-700",
    },
    {
      id: "sentence-builder",
      title: "Sentence Builder",
      description: "Create correct sentences from scrambled words",
      icon: "📝",
      bgColor: "bg-green-100",
      borderColor: "border-green-300",
      textColor: "text-green-700",
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description: "Test your vocabulary with interactive flashcards",
      icon: "🃏",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-700",
    },
    {
      id: "listening-challenge",
      title: "Listening Challenge",
      description: "Test your listening comprehension skills",
      icon: "👂",
      bgColor: "bg-red-100",
      borderColor: "border-red-300",
      textColor: "text-red-700",
    },
    {
      id: "daily-challenge",
      title: "Daily Challenge",
      description: "A new language challenge every day",
      icon: "🏆",
      bgColor: "bg-indigo-100",
      borderColor: "border-indigo-300",
      textColor: "text-indigo-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-blue-50 to-green-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Image
                src="/logo.svg"
                alt="LinguaLoop Logo"
                width={140}
                height={32}
                priority
              />
            </div>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/practice" className="text-gray-700 hover:text-blue-600 font-medium">Practice</Link>
            <Link href="/quiz" className="text-gray-700 hover:text-blue-600 font-medium">Quiz</Link>
            <Link href="/games" className="text-blue-600 font-bold">Games</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
          </nav>
          <div className="md:hidden">
            {/* Mobile menu button placeholder */}
            <button className="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Learn Through Play</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our collection of engaging language games designed to make learning fun and effective.
          </p>
        </div>

        {/* Game Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameOptions.map((game) => (
            <Link href={`/games/${game.id}`} key={game.id}>
              <div className={`${game.bgColor} border-2 ${game.borderColor} rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer h-full`}>
                <div className="p-6 flex flex-col h-full">
                  <div className="text-center mb-4">
                    <span className="text-5xl">{game.icon}</span>
                  </div>
                  <h3 className={`text-xl font-bold ${game.textColor} text-center mb-3`}>{game.title}</h3>
                  <p className="text-gray-700 text-center mb-6 flex-grow">{game.description}</p>
                  <button className="mt-auto w-full bg-white border border-gray-300 rounded-lg py-2 font-medium hover:bg-gray-50 transition-colors duration-300">
                    Play Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Track Your Progress</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Create an account to track your game scores, earn achievements, and compete with friends!
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-700 font-bold py-3 px-6 rounded-lg shadow hover:bg-gray-100 transition-colors duration-300">
              Sign Up
            </button>
            <button className="bg-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-blue-900 transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/logo-white.svg"
                alt="LinguaLoop Logo"
                width={160}
                height={40}
                className="mb-4"
              />
              <p className="text-gray-400 text-sm">
                Making language learning fun and effective since 2023.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/practice" className="text-gray-400 hover:text-white">Practice</Link></li>
                <li><Link href="/quiz" className="text-gray-400 hover:text-white">Quiz</Link></li>
                <li><Link href="/games" className="text-gray-400 hover:text-white">Games</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-400 text-sm mb-2">Subscribe to our newsletter</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="px-4 py-2 w-full rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700">
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between">
            <p className="text-gray-400 text-sm">© 2025 LinguaLoop. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Games;