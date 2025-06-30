'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { app } from '@/firebase';
import { useTheme } from '@/lib/ThemeContext';

interface TriviaRound {
  hebrewWord: string;
  options: string[];
  correctIndex: number;
  clueSentence: string;
  clueEmoji: string;
}

interface AnswerLog {
  hebrew: string;
  correct: string;
  selected: string;
  result: 'Correct' | 'Wrong';
}

const ROUNDS_FOR_SIGNED = 5;
const ROUNDS_FOR_GUEST = 3;

// Fisher–Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TriviaGamePage() {
  const { theme } = useTheme();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [questions, setQuestions] = useState<TriviaRound[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnswerLog[]>([]);
  const [showSentence, setShowSentence] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showEllie, setShowEllie] = useState(false);
  const [ellieCorrect, setEllieCorrect] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  // 1) Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setIsGuest(!user);
      setAuthReady(true);
    });
  }, [auth]);

  // 2) Load rounds on auth ready
  useEffect(() => {
    if (authReady) loadRounds();
  }, [authReady]);

  async function loadRounds() {
    setIsLoading(true);
    const guest = !auth.currentUser;
    setIsGuest(guest);
    const needed = guest ? ROUNDS_FOR_GUEST : ROUNDS_FOR_SIGNED;

    try {
      const seen = new Set<string>();
      const fetched: TriviaRound[] = [];
      while (fetched.length < needed) {
        const res = await fetch('/api/trivia-round');
        const q = (await res.json()) as TriviaRound;
        if (seen.has(q.hebrewWord)) continue;
        seen.add(q.hebrewWord);

        const correctAns = q.options[q.correctIndex];
        const opts = shuffleArray(q.options);
        const idx = opts.findIndex(o => o === correctAns);
        fetched.push({ ...q, options: opts, correctIndex: idx });
      }
      setQuestions(fetched);
      // reset state
      setCurrentIndex(0);
      setSelected(null);
      setScore(0);
      setAnswers([]);
      setShowSentence(false);
      setShowEmoji(false);
      setShowSummary(false);
      setShowEllie(false);
    } catch (err) {
      console.error('Failed to load trivia rounds:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // 3) Handle answer selection
  const handleSelect = (choice: string) => {
    if (selected) return;
    const q = questions[currentIndex];
    const correct = q.options[q.correctIndex];
    const isCorrect = choice === correct;
    if (isCorrect) setScore(s => s + 1);

    const entry: AnswerLog = {
      hebrew: q.hebrewWord,
      correct,
      selected: choice,
      result: isCorrect ? 'Correct' : 'Wrong'
    };
    setAnswers(prev => {
      const next = [...prev, entry];
      console.log('📥 Appended answer:', entry, '→ answers length:', next.length);
      return next;
    });

    setSelected(choice);
    setEllieCorrect(isCorrect);
    setShowEllie(true);

    setTimeout(() => {
      setShowEllie(false);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        setSelected(null);
        setShowSentence(false);
        setShowEmoji(false);
      }
      // otherwise let the save-effect below run
    }, 1200);
  };

  // 4) Save when answers array is complete
  useEffect(() => {
    if (
      answers.length > 0 &&
      questions.length > 0 &&
      answers.length === questions.length &&
      !isGuest &&
      auth.currentUser
    ) {
      console.log('📤 Saving all answers to Firestore:', answers);
      setShowSummary(true);

      const uid = auth.currentUser.uid;
      addDoc(
        collection(db, 'trivia_results'),
        {
          uid,
          score,
          answers,
          createdAt: serverTimestamp()
        }
      )
        .then(docRef => console.log('✅ Trivia saved:', docRef.id))
        .catch(err => console.error('❌ Save failed:', err));
    }
  }, [answers, questions.length, isGuest, auth.currentUser, score, db]);

  const restart = () => loadRounds();

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme==='light'
          ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200'
          : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'
      }`}>
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4">🌟</div>
          <div className={`text-xl font-bold ${
            theme==='light'? 'rgba(255,255,255,0.9)':'rgba(31,41,55,0.9)'
          }`}>Loading game...</div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${
      theme==='light'
        ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200'
        : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'
    }`}>
      <div className="max-w-4xl w-full backdrop-blur-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-10 text-center">
        {!showSummary ? (
          <>
            <p className="text-lg mb-2">
              Round {currentIndex + 1} / {questions.length}
            </p>
            <h1 className="text-4xl font-bold mb-2">
              What does this word mean?
            </h1>
            <h2 className="text-6xl font-extrabold mb-6 text-purple-700 dark:text-purple-300" dir="rtl">
              {q.hebrewWord}
            </h2>
            <div className="flex justify-center gap-6 mb-6">
              <button
                onClick={() => setShowSentence(true)}
                className="px-6 py-2 rounded shadow bg-purple-200 hover:bg-purple-300 text-purple-800"
              >
                Show Sentence 📘
              </button>
              <button
                onClick={() => setShowEmoji(true)}
                className="px-6 py-2 rounded shadow bg-yellow-100 hover:bg-yellow-200 text-purple-800"
              >
                Show Emoji 😃
              </button>
            </div>
            {showSentence && <p className="mb-4 italic text-lg">{q.clueSentence}</p>}
            {showEmoji && <p className="text-4xl mb-6">{q.clueEmoji}</p>}
            <div className="grid grid-cols-2 gap-6">
              {q.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`w-full py-4 rounded-lg shadow-md text-2xl transition-all ${
                    selected
                      ? opt === q.options[q.correctIndex]
                        ? 'bg-green-300 text-green-800'
                        : opt === selected
                          ? 'bg-red-300 text-red-800'
                          : 'bg-white dark:bg-gray-700 text-purple-800 dark:text-purple-200'
                      : 'bg-white hover:bg-purple-100 dark:bg-gray-700 hover:bg-gray-600 text-purple-800 dark:text-purple-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {selected && (
              <>
                <p className="mt-6 text-2xl font-semibold">
                  {selected === q.options[q.correctIndex]
                    ? "You're Right! ✅"
                    : "Oops! That's not it ❌"}
                </p>
                {showEllie && (
                  <p className="mt-2 text-xl font-medium">
                    {ellieCorrect
                      ? "Ellie thinks that was correct! 🎉"
                      : "Ellie thinks that was wrong. 😢"}
                  </p>
                )}
              </>
            )}
            <p className="mt-4 text-base">Score: {score}</p>
          </>
        ) : (
          <div>
            <h2 className="text-4xl font-bold mb-6">🎉 Game Over!</h2>
            <p className="text-2xl mb-6">
              Your Score: {score} / {questions.length}
            </p>
            <ul className="text-left text-lg mb-6">
              {answers.map((a, i) => (
                <li key={i} className="flex items-center gap-2 mb-2">
                  {a.result === 'Correct'
                    ? <span className="text-green-500 text-2xl">✅</span>
                    : <span className="text-red-500 text-2xl">❌</span>}
                  <span>You chose {a.selected} – {a.hebrew}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 justify-center">
              <button
                onClick={restart}
                className="bg-purple-300 hover:bg-purple-400 text-white px-6 py-3 rounded shadow"
              >
                Play Again
              </button>
              <button
                onClick={() => (window.location.href = '/games')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded shadow"
              >
                Back to Games
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
