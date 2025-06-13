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

interface WordEntry {
  english: string;
  hebrew: string;
  // extra keys (sentence, emoji) are fine if the API ever supplies them
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
  const [feedbackLog, setFeedbackLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [errorPair, setErrorPair] = useState<[string, string] | null>(null);

  const db = getFirestore(app);

  /** fetch 4 fresh word pairs from /api/word-match-round */
  const initializeGame = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/word-match-round');
      if (!res.ok) throw new Error('API returned ' + res.status);
      const pairs: WordEntry[] = await res.json();

      if (pairs.length !== 4) {
        console.error('API did not return exactly 4 pairs, falling back to static shuffle.');
        return;
      }

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

  /* ---- hydration & auth ---- */
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    const unsubscribe = onAuthStateChanged(getAuth(app), user => {
      setIsGuest(!user);
      initializeGame();
    });
    return () => unsubscribe();
  }, [hydrated]);

  /* ---- match checking ---- */
  useEffect(() => {
    if (selectedEnglish && selectedHebrew) {
      const match = wordPairs.find(
        p => p.english === selectedEnglish && p.hebrew === selectedHebrew
      );
      if (match) {
        setMatchedPairs(prev => [...prev, [selectedEnglish, selectedHebrew]]);
        setFeedbackLog(prev => [...prev, { english: selectedEnglish, hebrew: selectedHebrew, result: 'Correct' }]);
        setSelectedEnglish(null);
        setSelectedHebrew(null);
        setErrorPair(null);
      } else {
        setFeedbackLog(prev => [...prev, { english: selectedEnglish, hebrew: selectedHebrew, result: 'Wrong' }]);
        setErrorPair([selectedEnglish, selectedHebrew]);
        setTimeout(() => {
          setSelectedEnglish(null);
          setSelectedHebrew(null);
          setErrorPair(null);
        }, 600);
      }
    }
  }, [selectedEnglish, selectedHebrew, wordPairs]);

  /* ---- game over & result save ---- */
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

  if (!hydrated || isLoading) return <div>Loading game...</div>;

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-10 text-purple-800 text-2xl">
      <div className="max-w-5xl w-full">
        {gameOver ? (
          isGuest ? (
            /* ---------- guest modal ---------- */
            <div className="text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10">
              <h2 className="text-3xl font-bold mb-6">🎮 Want More Games?</h2>
              <p className="text-xl mb-6">
                If you enjoyed this game, sign up for full access to more rounds and all game modes!
              </p>
              <button
                onClick={() => (window.location.href = '/signin')}
                className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded shadow text-lg"
              >
                Sign In / Register
              </button>
            </div>
          ) : (
            /* ---------- victory modal ---------- */
            <div className="text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10">
              <h2 className="text-3xl font-bold mb-6">🎉 You did it!</h2>
              <p className="text-xl mb-4">You matched all the pairs correctly!</p>
              <ul className="text-left text-lg mb-6">
                {feedbackLog.map((e, i) => (
                  <li key={i} className={e.result === 'Correct' ? 'text-green-700' : 'text-red-600'}>
                    {e.english} → {e.hebrew}: {e.result}
                  </li>
                ))}
              </ul>
              <button
                onClick={initializeGame}
                className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 px-6 py-3 rounded shadow text-lg"
              >
                Play Again
              </button>
            </div>
          )
        ) : (
          /* ---------- active round ---------- */
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10">
            <h2 className="text-4xl font-bold mb-10 text-center">Match the words!</h2>
            <div className="grid grid-cols-2 gap-16">
              {/* English buttons */}
              <div className="flex flex-col items-end gap-6">
                {englishOptions.map(pair => {
                  const matched = matchedPairs.some(p => p[0] === pair.english);
                  const selected = selectedEnglish === pair.english;
                  const isError = errorPair?.[0] === pair.english;
                  return (
                    <button
                      key={pair.english}
                      className={`w-60 h-24 rounded-xl shadow text-2xl font-bold transition-colors duration-200
                        ${matched
                          ? 'bg-green-300'
                          : isError
                          ? 'bg-red-400 text-white'
                          : selected
                          ? 'bg-purple-600 text-white'
                          : 'bg-white hover:bg-purple-100'}`}
                      onClick={() => setSelectedEnglish(pair.english)}
                      disabled={matched}
                    >
                      {pair.english}
                    </button>
                  );
                })}
              </div>

              {/* Hebrew buttons */}
              <div className="flex flex-col items-start gap-6">
                {hebrewOptions.map(pair => {
                  const matched = matchedPairs.some(p => p[1] === pair.hebrew);
                  const selected = selectedHebrew === pair.hebrew;
                  const isError = errorPair?.[1] === pair.hebrew;
                  return (
                    <button
                      key={pair.hebrew}
                      className={`w-60 h-24 rounded-xl shadow text-2xl font-bold transition-colors duration-200
                        ${matched
                          ? 'bg-green-300'
                          : isError
                          ? 'bg-red-400 text-white'
                          : selected
                          ? 'bg-yellow-500 text-white'
                          : 'bg-white hover:bg-yellow-100'}`}
                      onClick={() => setSelectedHebrew(pair.hebrew)}
                      disabled={matched}
                    >
                      {pair.hebrew}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* live feedback for signed-in users */}
            {!isGuest && feedbackLog.length > 0 && (
              <div className="mt-10 bg-white/80 p-6 rounded-xl shadow text-lg">
                <h3 className="text-2xl font-semibold mb-4">Your Answers</h3>
                <ul className="list-disc pl-6">
                  {feedbackLog.map((e, i) => (
                    <li key={i} className={e.result === 'Correct' ? 'text-green-700' : 'text-red-600'}>
                      {e.english} → {e.hebrew}: {e.result}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
