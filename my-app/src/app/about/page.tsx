import Image from "next/image";
import Link from "next/link";

export default function About() {
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
            <Link href="/games" className="text-gray-700 hover:text-blue-600 font-medium">Games</Link>
            <Link href="/about" className="text-blue-600 font-bold">About</Link>
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Left column with image */}
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
              <div className="relative h-full flex flex-col justify-center p-8 text-white">
                <h1 className="text-4xl font-bold mb-4">Our Mission</h1>
                <p className="text-lg opacity-90">
                  Making language learning accessible, engaging, and effective for everyone around the world.
                </p>
              </div>
            </div>
            
            {/* Right column with content */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">About LinguaLoop</h2>
              
              <div className="space-y-6">
                <p className="text-gray-600">
                  LinguaLoop was founded in 2023 with a simple yet powerful idea: language learning should be fun, 
                  effective, and accessible to everyone. Our approach combines the best of cognitive science, gamification,
                  and personalized learning paths.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-bold text-indigo-700 mb-2">Research-Backed</h3>
                    <p className="text-gray-600 text-sm">Our methodology is based on proven language acquisition techniques</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-bold text-green-700 mb-2">Personalized</h3>
                    <p className="text-gray-600 text-sm">Adaptive learning paths tailored to your progress and goals</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-700 mb-2">Interactive</h3>
                    <p className="text-gray-600 text-sm">Engaging activities that keep you motivated and learning</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-bold text-yellow-700 mb-2">Community</h3>
                    <p className="text-gray-600 text-sm">Connect with other learners and native speakers</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link href="/">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition-all flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Home
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team members - replace with actual team data */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-center text-gray-800">Sarah Johnson</h3>
                <p className="text-center text-gray-600">Founder & CEO</p>
                <p className="mt-4 text-gray-600 text-sm">
                  Language enthusiast with a passion for making education accessible to all.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-center text-gray-800">David Chen</h3>
                <p className="text-center text-gray-600">Head of Education</p>
                <p className="mt-4 text-gray-600 text-sm">
                  Linguistics PhD with 15 years of experience in language acquisition research.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-center text-gray-800">Maria Rodriguez</h3>
                <p className="text-center text-gray-600">Lead Developer</p>
                <p className="mt-4 text-gray-600 text-sm">
                  Software engineer specialized in creating intuitive educational experiences.
                </p>
              </div>
            </div>
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
}