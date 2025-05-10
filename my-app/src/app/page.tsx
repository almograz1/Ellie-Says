import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-r from-indigo-100 via-blue-200 to-green-200">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-4xl w-full">
        {/* App Logo */}
        <Image
          className="dark:invert"
          src="/logo.svg" // Replace with your app logo
          alt="LinguaLoop logo"
          width={220}
          height={50}
          priority
        />

        {/* Tagline */}
        <h1 className="text-4xl font-extrabold text-center sm:text-left text-indigo-800 mb-4">
          Welcome to LinguaLoop
        </h1>
        <p className="text-lg text-gray-700 text-center sm:text-left mb-6 max-w-xl">
          Master new languages through practice, quizzes, games, and interactive features, all in one app.
        </p>


        {/* Main Menu Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full">
          <Link href="/practice">
            <button className="bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-lg sm:text-xl py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 relative overflow-hidden">
            
              Practice
            </button>
          </Link>

          <Link href="/quiz">
            <button className="bg-green-600 text-white hover:bg-green-700 transition-all font-bold text-lg sm:text-xl py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 relative overflow-hidden">

              Quiz
            </button>
          </Link>

          <Link href="/games">
            <button className="bg-yellow-600 text-white hover:bg-yellow-700 transition-all font-bold text-lg sm:text-xl py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 relative overflow-hidden">
              
              Games
            </button>
          </Link>

          <Link href="/about">
            <button className="bg-gray-600 text-white hover:bg-gray-700 transition-all font-bold text-lg sm:text-xl py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 relative overflow-hidden">
              
              About
            </button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-600 mt-16">
        <a className="hover:underline" href="/privacy">Privacy</a>
        <a className="hover:underline" href="/terms">Terms</a>
        <a
          className="flex items-center gap-1 hover:underline"
          href="https://github.com/your-repo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src="/github.svg" alt="GitHub icon" width={16} height={16} />
          GitHub
        </a>
      </footer>
    </div>
  );
}
