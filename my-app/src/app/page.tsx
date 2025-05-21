import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-4">
        <main className="flex flex-col gap-12 row-start-2 items-center sm:items-start max-w-4xl w-full">
          {/* App Logo */}
          <Image
              className="dark:invert"
              src="/logo.svg"
              alt="Ellie Says logo"
              width={220}
              height={50}
              priority
          />

          {/* Tagline */}
          <h1 className="text-4xl font-extrabold text-center sm:text-left text-indigo-800">
            Welcome to Ellie Says!
          </h1>
          <p className="text-lg text-gray-700 text-center sm:text-left max-w-xl">
            Choose an option to get started on your language journey!
          </p>

          {/* Main Menu Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full mt-8">
            <Link
                href="/profile"
                className="block bg-purple-600 text-white hover:bg-purple-700 transition-all font-bold text-lg py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 text-center"
            >
              My Profile
            </Link>
            <Link
                href="/games"
                className="block bg-yellow-600 text-white hover:bg-yellow-700 transition-all font-bold text-lg py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 text-center"
            >
              Games
            </Link>
            <Link
                href="/translate"
                className="block bg-pink-600 text-white hover:bg-pink-700 transition-all font-bold text-lg py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 text-center"
            >
              Translate
            </Link>
            <Link
                href="/contact"
                className="block bg-gray-600 text-white hover:bg-gray-700 transition-all font-bold text-lg py-6 px-12 rounded-xl shadow-lg hover:scale-105 transform hover:translate-y-1 text-center"
            >
              Contact Us
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-600 mt-16">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
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
