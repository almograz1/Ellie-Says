'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  setDoc
} from 'firebase/firestore';
import { app } from '../../../firebase';
import {
  getGuestPlayCount,
  incrementGuestPlayCount,
  hasExceededGuestLimit
} from '../../../utils/guestLimit';

interface WordPair {
  english: string;
  hebrew: string;
}

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function WordMatchPage() {
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [shuffledHebrew, setShuffledHebrew] = useState<string[]>([]);
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedHebrew, setSelectedHebrew] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ [key: string]: boolean }>({});
  const [gameFinished, setGameFinished] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestBlocked, setGuestBlocked] = useState(false);
  const [showGuestPromo, setShowGuestPromo] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  const loadRound = async () => {
    const snapshot = await getDocs(collection(db, 'words'));
    const allWords = snapshot.docs.map(doc => doc.data() as WordPair);
    const chosen = shuffleArray(allWords).slice(0, 4);
    setWordPairs(chosen);
    setShuffledHebrew(shuffleArray(chosen.map(pair => pair.hebrew)));
    setMatches({});
    setSelectedEnglish(null);
    setSelectedHebrew(null);
    setGameFinished(false);
  };

  useEffect(() => {
    const user = auth.currentUser;
    const guest = !user;
    setIsGuest(guest);
    if (guest && hasExceededGuestLimit()) {
      setGuestPromo(true);
      setGuestBlocked(true);
    } else {
      loadRound();
    }
  }, []);

  const handleMatch = async () => {
    if (!selectedEnglish || !selectedHebrew) return;

    const correctPair = wordPairs.find(
      pair => pair.english === selectedEnglish && pair.hebrew === selectedHebrew
    );

    const matchKey = `${selectedEnglish}-${selectedHebrew}`;
    const isCorrect = !!correctPair;

    if (isCorrect) {
      setMatches(prev => {
        const updated = { ...prev, [selectedEnglish]: true };
        const correctMatches = Object.values(updated).filter(Boolean).length;
        if (correctMatches === 4) {
          setTimeout(() => {
            setGameFinished(true);
            if (isGuest) {
              if (hasExceededGuestLimit()) {
                setGuestBlocked(true);
              } else {
                incrementGuestPlayCount();
                if (hasExceededGuestLimit()) {
                  setShowGuestPromo(true);
                }
              }
            }
          }, 500);
        }
        return updated;
      });

      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {}, { merge: true });
        await updateDoc(userRef, {
          wordMatchScore: increment(1)
        });
      }

      setSelectedEnglish(null);
      setSelectedHebrew(null);
    } else {
      setMatches(prev => ({ ...prev, [matchKey]: false }));
      setSelectedEnglish(null);
      setSelectedHebrew(null);
    }
  };

  useEffect(() => {
    if (selectedEnglish && selectedHebrew) {
      handleMatch();
    }
  }, [selectedEnglish, selectedHebrew]);

  if (guestBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-10 text-purple-800">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">🚫 Guest Trial Limit Reached</h2>
          <p className="text-xl mb-6">
            You've reached your free game limit. Sign up to unlock full access to Ellie Says!
          </p>
          <button
            onClick={() => window.location.href = '/signin'}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded shadow text-lg"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-4xl w-full text-purple-800">
        <h1 className="text-3xl font-bold text-center mb-6">🧠 Word Match</h1>

        {gameFinished ? (
          showGuestPromo ? (
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-purple-800">Want more games?</h2>
              <p className="text-xl">Register now to unlock unlimited rounds and all features!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/signin'}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded shadow text-lg"
                >
                  Sign In / Register
                </button>
                <button
                  onClick={() => window.location.href = '/games/trivia'}
                  className="bg-yellow-300 hover:bg-yellow-400 text-purple-800 px-6 py-3 rounded shadow text-lg"
                >
                  Try Another Game
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-green-700">🎉 Victory!</h2>
              <p className="text-xl text-green-600">You matched all words correctly!</p>

              <div className="mt-6 text-left">
                <h3 className="text-2xl font-semibold mb-3">✅ Summary of Translations</h3>
                <ul className="space-y-2 text-xl">
                  {wordPairs.map((pair, index) => (
                    <li key={index}>
                      <span className="font-bold">{pair.english}</span> — <span className="text-right rtl">{pair.hebrew}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-2 text-left">
                <h3 className="text-2xl font-semibold mb-3">🧪 Your Match Attempts:</h3>
                {Object.entries(matches).map(([key, result], i) => (
                  <div
                    key={i}
                    className={`text-lg px-4 py-2 rounded-md ${
                      result ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {key.replace('-', ' ↔ ')} — {result ? 'Correct!' : 'Try again'}
                  </div>
                ))}
              </div>

              <button
                onClick={loadRound}
                className="mt-6 px-6 py-3 bg-purple-500 text-white text-lg rounded-xl hover:bg-purple-600 transition"
              >
                Next Round 🔁
              </button>
            </div>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 justify-items-center">
              <div>
                <h2 className="text-xl font-semibold mb-4">English</h2>
                {wordPairs.map(({ english }) => (
                  <button
                    key={english}
                    onClick={() => setSelectedEnglish(english)}
                    disabled={matches[english] === true}
                    className={`w-40 h-40 flex items-center justify-center mb-3 rounded-md border text-4xl font-bold ${
                      selectedEnglish === english ? 'bg-purple-300 text-white' : 'bg-white'
                    } ${matches[english] === true ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-100'}`}
                  >
                    {english}
                  </button>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-right">Hebrew</h2>
                {shuffledHebrew.map(hebrew => {
                  const isUsed = Object.values(matches).includes(true) &&
                    Object.entries(matches).some(
                      ([k, v]) => v === true && wordPairs.find(w => w.english === k)?.hebrew === hebrew
                    );
                  return (
                    <button
                      key={hebrew}
                      onClick={() => setSelectedHebrew(hebrew)}
                      disabled={isUsed}
                      className={`w-40 h-40 flex items-center justify-center mb-3 rounded-md border text-4xl font-bold rtl text-right pr-2 ${
                        selectedHebrew === hebrew ? 'bg-yellow-300 text-white' : 'bg-white'
                      } ${isUsed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-100'}`}
                    >
                      {hebrew}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {Object.entries(matches).map(([key, result], i) => (
                <div
                  key={i}
                  className={`text-lg px-4 py-2 rounded-md ${
                    result ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {key.replace('-', ' ↔ ')} — {result ? 'Correct!' : 'Try again'}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
