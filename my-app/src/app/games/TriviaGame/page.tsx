'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { app } from '../../../firebase';

/* ---------- server-payload types ---------- */
interface TriviaRound {
  hebrewWord: string;
  options: string[];       // 4 English words
  correctIndex: number;    // 0-3
  clueSentence: string;
  clueEmoji: string;
}

interface AnswerLog {
  hebrew: string;
  correct: string;
  selected: string;
  result: 'Correct' | 'Wrong';
}

/* ---------- helpers ---------- */
const ROUNDS_FOR_SIGNED   = 5;
const ROUNDS_FOR_GUEST    = 3;

export default function TriviaGamePage() {
  /* ---------- state ---------- */
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

  const auth = getAuth(app);
  const db   = getFirestore(app);

  /* ---------- fetch N fresh rounds ---------- */
  const loadRounds = async () => {
    setIsLoading(true);
    const guest = !auth.currentUser;
    setIsGuest(guest);
    const roundsNeeded = guest ? ROUNDS_FOR_GUEST : ROUNDS_FOR_SIGNED;

    try {
      /* call our API N times in parallel */
      const resArr = await Promise.all(
        Array.from({ length: roundsNeeded }, () =>
          fetch('/api/trivia-round').then(r => r.json())
        )
      );
      setQuestions(resArr as TriviaRound[]);
      setCurrentIndex(0);
      setSelected(null);
      setScore(0);
      setAnswers([]);
      setShowSentence(false);
      setShowEmoji(false);
      setShowSummary(false);
    } catch (err) {
      console.error('Failed to load trivia rounds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- initial load ---------- */
  useEffect(() => { loadRounds(); }, []);

  /* ---------- answer selection ---------- */
  const handleSelect = (option: string) => {
    if (selected) return;                 // already answered
    setSelected(option);

    const q = questions[currentIndex];
    const correct = q.options[q.correctIndex];
    const isCorrect = option === correct;
    if (isCorrect) setScore(prev => prev + 1);

    setAnswers(prev => [
      ...prev,
      { hebrew: q.hebrewWord, correct, selected: option, result: isCorrect ? 'Correct' : 'Wrong' }
    ]);

    /* short delay then next question or summary */
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setShowSummary(true);
        if (!isGuest) saveResults(score + (isCorrect ? 1 : 0));  // final score
      } else {
        setCurrentIndex(i => i + 1);
        setSelected(null);
        setShowSentence(false);
        setShowEmoji(false);
      }
    }, 1200);
  };

  /* ---------- save signed-in results ---------- */
  const saveResults = async (finalScore: number) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, 'trivia_results'), {
        uid: user.uid,
        score: finalScore,
        answers,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error saving results:', e);
    }
  };

  /* ---------- restart ---------- */
  const restart = () => loadRounds();

  /* ---------- loading ---------- */
  if (isLoading) return <div>Loading game...</div>;

  const q = questions[currentIndex];

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-10 text-purple-800 text-xl">
      {!showSummary ? (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-5xl text-center">
          <p className="text-lg mb-2">Round {currentIndex + 1} / {questions.length}</p>
          <h1 className="text-4xl font-bold mb-2">What does this word mean?</h1>
          <h2 className="text-6xl font-extrabold text-purple-700 mb-6" dir="rtl">
            {q.hebrewWord}
          </h2>

          <div className="flex justify-center gap-6 mb-6">
            <button
              onClick={() => setShowSentence(true)}
              className="bg-purple-200 hover:bg-purple-300 px-6 py-2 rounded shadow text-lg"
            >
              Show Sentence 📘
            </button>
            <button
              onClick={() => setShowEmoji(true)}
              className="bg-yellow-100 hover:bg-yellow-200 px-6 py-2 rounded shadow text-lg"
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
                className={`w-full py-4 rounded-lg shadow-md text-2xl transition-all
                  ${selected
                    ? opt === q.options[q.correctIndex]
                      ? 'bg-green-300'
                      : opt === selected
                        ? 'bg-red-300'
                        : 'bg-white'
                    : 'bg-white hover:bg-purple-100'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {selected && (
            <p className="mt-6 text-2xl font-semibold">
              {selected === q.options[q.correctIndex] ? "You're Right! ✅" : "Oops! That's not it ❌"}
            </p>
          )}

          <p className="mt-4 text-base">Score: {score}</p>
        </div>
      ) : (
        /* ---------- summary modals ---------- */
        isGuest ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-5xl text-center">
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
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-5xl text-center">
            <h2 className="text-4xl font-bold mb-6">🎉 Game Over!</h2>
            <p className="text-2xl mb-6">Your Score: {score} / {questions.length}</p>
            <ul className="text-left text-lg mb-6">
              {answers.map((a, i) => (
                <li key={i} className={`mb-2 ${a.result === 'Correct' ? 'text-green-600' : 'text-red-600'}`}>
                  <strong>{a.hebrew}</strong>: You chose <em>{a.selected}</em> – {a.result}
                </li>
              ))}
            </ul>
            <button
              onClick={restart}
              className="bg-purple-300 hover:bg-purple-400 text-white px-6 py-3 rounded shadow text-lg"
            >
              New Game
            </button>
          </div>
        )
      )}
    </div>
  );
}
