// Word Match Game Page
// - Fetches word pairs from API and shuffles them
// - Lets users match English and Hebrew words
// - Tracks correct/incorrect matches and logs feedback
// - Saves results to Firestore for signed-in users
// - Handles guest vs. signed-in logic, loading state, and theme

'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { app } from '../../../firebase';
import { useTheme } from '@/lib/ThemeContext';

interface WordEntry {
  english: string;
  hebrew: string;
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

export default function WordMatchPage() {
  const [wordPairs, setWordPairs] = useState<WordEntry[]>([]);
  const [englishOptions, setEnglishOptions] = useState<WordEntry[]>([]);
  const [hebrewOptions, setHebrewOptions] = useState<WordEntry[]>([]);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedHebrew, setSelectedHebrew] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<[string, string][]>([]);
  const [feedbackLog, setFeedbackLog] = useState<{english: string; hebrew: string; result: string;}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [errorPair, setErrorPair] = useState<[string, string] | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const [showEllie, setShowEllie] = useState(false);
  const [ellieCorrect, setEllieCorrect] = useState(false);

  const { theme } = useTheme();
  const db = getFirestore(app);

  const initializeGame = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/word-match-round');
      if (!res.ok) throw new Error('API returned ' + res.status);
      const pairs: WordEntry[] = await res.json();

      setWordPairs(pairs);
      setEnglishOptions(shuffleArray(pairs));
      setHebrewOptions(shuffleArray(pairs));
      setMatchedPairs([]);
      setFeedbackLog([]);
      setGameOver(false);
    } catch (err) {
      console.error('Failed to fetch word pairs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const returnToGames = () => {
    window.location.href = '/games';
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const unsubscribe = onAuthStateChanged(getAuth(app), user => {
      setIsGuest(!user);
      initializeGame();
    });
    return () => unsubscribe();
  }, [hydrated]);

  useEffect(() => {
    if (selectedEnglish && selectedHebrew) {
      const match = wordPairs.find(
          p => p.english === selectedEnglish && p.hebrew === selectedHebrew
      );
      const isCorrect = Boolean(match);

      setMatchedPairs(prev => isCorrect ? [...prev, [selectedEnglish, selectedHebrew]] : prev);
      setFeedbackLog(prev => [...prev, {
        english: selectedEnglish,
        hebrew: selectedHebrew,
        result: isCorrect ? 'Correct' : 'Wrong'
      }]);

      setEllieCorrect(isCorrect);
      setShowEllie(true);
      setTimeout(() => setShowEllie(false), 1200);

      if (!isCorrect) {
        setErrorPair([selectedEnglish, selectedHebrew]);
        setTimeout(() => setErrorPair(null), 600);
      }

      setSelectedEnglish(null);
      setSelectedHebrew(null);
    }
  }, [selectedEnglish, selectedHebrew, wordPairs]);

  useEffect(() => {
    if (wordPairs.length && matchedPairs.length === wordPairs.length) {
      setGameOver(true);
      const user = getAuth(app).currentUser;
      if (user) {
        addDoc(collection(db, 'word_match_results'), {
          uid: user.uid,
          results: feedbackLog,
          createdAt: serverTimestamp()
        });
      }
    }
  }, [matchedPairs, wordPairs, feedbackLog, db]);

  if (!hydrated || isLoading) {
    return (
        <div className={`min-h-screen flex items-center justify-center
      ${theme === 'light'
            ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
            : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}>
          <div className="text-center">
            <div className="text-6xl mb-4 animate-spin">🌟</div>
            <div className={`text-xl font-bold ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}>
              Loading game…
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className={`min-h-screen flex flex-col items-center justify-center text-lg sm:text-xl lg:text-2xl p-2 sm:p-4 lg:p-0 relative
      ${theme === 'light'
          ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 text-purple-800'
          : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900 text-purple-200'}`}>

        {/* Layout container: board + ellie */}
        <div className="relative flex w-full max-w-7xl justify-center items-start">
          {/* Ellie - responsive positioning */}
          <div className="absolute -left-32 sm:-left-40 md:-left-60 lg:-left-140 top-20 sm:top-40 md:top-50 lg:top-60 hidden sm:block">
            <img
                src={showEllie ? (ellieCorrect ? "/ellie0001.png" : "/ellie0003.png") : "/ellie0001.png"}
                alt="Ellie"
                className={`w-[200px] sm:w-[300px] md:w-[500px] lg:w-[900px] h-auto drop-shadow-2xl transition-all duration-300 ${
                    showEllie
                        ? ellieCorrect
                            ? "animate-[shake-vertical_0.8s_ease-in-out]"
                            : "animate-[shake-horizontal_0.8s_ease-in-out]"
                        : "opacity-80"
                }`}
            />
          </div>

          {/* Mobile Ellie - positioned at bottom with higher z-index and pointer-events-none */}
          <div className="fixed bottom-0 left-0 sm:hidden z-50 pointer-events-none">
            <img
                src={showEllie ? (ellieCorrect ? "/ellie0001.png" : "/ellie0003.png") : "/ellie0001.png"}
                alt="Ellie"
                className={`w-[150px] h-auto drop-shadow-2xl transition-all duration-300 ${
                    showEllie
                        ? ellieCorrect
                            ? "animate-[shake-vertical_0.8s_ease-in-out]"
                            : "animate-[shake-horizontal_0.8s_ease-in-out]"
                        : "opacity-80"
                }`}
            />
          </div>

          {/* Game board - added bottom padding for mobile to prevent overlap with Ellie */}
          <div className="max-w-5xl w-full mt-4 sm:mt-10 lg:mt-20 z-10 pb-32 sm:pb-0">
            {gameOver ? (
                isGuest ? (
                    <div className={`text-center backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10
                ${theme === 'light'
                        ? 'bg-white/90 text-purple-800'
                        : 'bg-gray-800/90 text-purple-200'}`}>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">🎮 Want More Games?</h2>
                      <p className="text-lg sm:text-xl mb-4 sm:mb-6">
                        If you enjoyed this game, sign up for full access to more rounds and all game modes!
                      </p>
                      <button onClick={() => (window.location.href = '/signin')}
                              className="bg-purple-400 hover:bg-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded shadow text-base sm:text-lg">
                        Sign In / Register
                      </button>
                    </div>
                ) : (
                    <div className={`text-center backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10
                ${theme === 'light'
                        ? 'bg-white/90 text-purple-800'
                        : 'bg-gray-800/90 text-purple-200'}`}>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">🎉 You did it!</h2>
                      <p className="text-lg sm:text-xl mb-4">You matched all the pairs!</p>
                      <ul className="text-left text-base sm:text-lg mb-4 sm:mb-6">
                        {feedbackLog.map((e, i) => (
                            <li key={i} className="flex items-center gap-2 mb-1">
                              {e.result === 'Correct'
                                  ? <span className="text-green-500 text-lg sm:text-2xl">✅</span>
                                  : <span className="text-red-500 text-lg sm:text-2xl">❌</span>}
                              <span className="break-words">{e.english} → {e.hebrew}</span>
                            </li>
                        ))}
                      </ul>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <button onClick={initializeGame}
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded shadow text-base sm:text-lg ${
                                    theme === 'light'
                                        ? 'bg-yellow-400 hover:bg-yellow-500 text-purple-900'
                                        : 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'}`}>
                          Play Again
                        </button>
                        <button onClick={returnToGames}
                                className={`px-4 sm:px-6 py-2 sm:py-3 rounded shadow text-base sm:text-lg ${
                                    theme === 'light'
                                        ? 'bg-purple-400 hover:bg-purple-500 text-white'
                                        : 'bg-purple-500 hover:bg-purple-600 text-white'}`}>
                          Return to Games
                        </button>
                      </div>
                    </div>
                )
            ) : (
                <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-10
              ${theme === 'light' ? 'bg-white/90' : 'bg-gray-800/90'}`}>
                  <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-10 text-center ${
                      theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}>
                    Match the words!
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
                    <div className="flex flex-col items-center sm:items-end gap-3 sm:gap-4 lg:gap-6">
                      <h3 className="text-lg sm:text-xl font-semibold sm:hidden mb-2">English</h3>
                      {englishOptions.map(pair => {
                        const matched = matchedPairs.some(p => p[0] === pair.english);
                        const selected = selectedEnglish === pair.english;
                        const isError = errorPair?.[0] === pair.english;
                        return (
                            <button
                                key={pair.english}
                                className={`w-full sm:w-48 md:w-56 lg:w-60 h-16 sm:h-20 lg:h-24 rounded-xl shadow text-base sm:text-xl lg:text-2xl font-bold transition-colors duration-200
                          ${matched
                                    ? 'bg-green-300'
                                    : isError
                                        ? 'bg-red-400 text-white'
                                        : selected
                                            ? 'bg-purple-600 text-white'
                                            : theme === 'light'
                                                ? 'bg-white hover:bg-purple-100 text-purple-800'
                                                : 'bg-gray-700 hover:bg-purple-800 text-purple-200'}`}
                                disabled={matched}
                                onClick={() => setSelectedEnglish(pair.english)}>
                              {pair.english}
                            </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-4 lg:gap-6">
                      <h3 className="text-lg sm:text-xl font-semibold sm:hidden mb-2">Hebrew</h3>
                      {hebrewOptions.map(pair => {
                        const matched = matchedPairs.some(p => p[1] === pair.hebrew);
                        const selected = selectedHebrew === pair.hebrew;
                        const isError = errorPair?.[1] === pair.hebrew;
                        return (
                            <button
                                key={pair.hebrew}
                                className={`w-full sm:w-48 md:w-56 lg:w-60 h-16 sm:h-20 lg:h-24 rounded-xl shadow text-base sm:text-xl lg:text-2xl font-bold transition-colors duration-200
                          ${matched
                                    ? 'bg-green-300'
                                    : isError
                                        ? 'bg-red-400 text-white'
                                        : selected
                                            ? 'bg-yellow-500 text-white'
                                            : theme === 'light'
                                                ? 'bg-white hover:bg-yellow-100 text-purple-800'
                                                : 'bg-gray-700 hover:bg-yellow-800 text-purple-200'}`}
                                disabled={matched}
                                onClick={() => setSelectedHebrew(pair.hebrew)}>
                              {pair.hebrew}
                            </button>
                        );
                      })}
                    </div>
                  </div>
                  {!isGuest && feedbackLog.length > 0 && (
                      <div className={`mt-6 sm:mt-8 lg:mt-10 p-4 sm:p-6 rounded-xl shadow text-sm sm:text-base lg:text-lg
                  ${theme === 'light' ? 'bg-white/80 text-purple-800' : 'bg-gray-700/80 text-purple-200'}`}>
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Your Answers</h3>
                        <ul className="list-disc pl-4 sm:pl-6">
                          {feedbackLog.map((e, i) => (
                              <li key={i} className="flex items-center gap-2 mb-1">
                                {e.result === 'Correct'
                                    ? <span className="text-green-300 text-lg sm:text-2xl">✅</span>
                                    : <span className="text-red-500 text-lg sm:text-2xl">❌</span>}
                                <span className="break-words">{e.english} → {e.hebrew}</span>
                              </li>
                          ))}
                        </ul>
                      </div>
                  )}
                </div>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes shake-vertical {
            0%, 100% { transform: translateY(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateY(-10px); }
            20%, 40%, 60%, 80% { transform: translateY(10px); }
          }

          @keyframes shake-horizontal {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
        `}</style>
      </div>
  );
}