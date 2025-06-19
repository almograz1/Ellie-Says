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
import { useTheme } from '@/lib/ThemeContext';
import Image from 'next/image';

/* ---------- server-payload types ---------- */
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

export default function TriviaGamePage() {
  const { theme } = useTheme();

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

  // New state to track answer correctness for Ellie image and animation
  const [answerResult, setAnswerResult] = useState<'Correct' | 'Wrong' | null>(null);

  const auth = getAuth(app);
  const db = getFirestore(app);

  const loadRounds = async () => {
    setIsLoading(true);
    const guest = !auth.currentUser;
    setIsGuest(guest);
    const roundsNeeded = guest ? ROUNDS_FOR_GUEST : ROUNDS_FOR_SIGNED;

    try {
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
      setAnswerResult(null); // reset animation/image state on new game
    } catch (err) {
      console.error('Failed to load trivia rounds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRounds();
  }, []);

  // Reset Ellie image back to default when summary shows
  useEffect(() => {
    if (showSummary) {
      setAnswerResult(null);
    }
  }, [showSummary]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);

    const q = questions[currentIndex];
    const correct = q.options[q.correctIndex];
    const isCorrect = option === correct;
    if (isCorrect) setScore(prev => prev + 1);

    // Set animation/image state based on correctness
    setAnswerResult(isCorrect ? 'Correct' : 'Wrong');

    setAnswers(prev => [
      ...prev,
      { hebrew: q.hebrewWord, correct, selected: option, result: isCorrect ? 'Correct' : 'Wrong' }
    ]);

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setShowSummary(true);
        if (!isGuest) saveResults(score + (isCorrect ? 1 : 0));
      } else {
        setCurrentIndex(i => i + 1);
        setSelected(null);
        setShowSentence(false);
        setShowEmoji(false);
        setAnswerResult(null); // reset animation/image for next question
      }
    }, 1200);
  };

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

  const restart = () => loadRounds();

  if (isLoading) return (
    <div className={`
      min-h-screen flex items-center justify-center text-xl
      ${theme === 'light'
        ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200 text-purple-800'
        : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900 text-purple-200'}
    `}>
      Loading game…
    </div>
  );

  const q = questions[currentIndex];

  // Decide Ellie image based on answerResult
  const ellieImageSrc =
    answerResult === 'Wrong'
      ? '/ellie0003.png'
      : '/ellie0001.png';

  // Shake classes
  const getShakeClass = () => {
    if (answerResult === 'Correct') return 'shake-vertical';
    if (answerResult === 'Wrong') return 'shake-horizontal';
    return '';
  };

  return (
    <>
      {/* Include the CSS animations */}
      <style jsx global>{`
        @keyframes shake-horizontal-ease {
  0% { transform: translateX(0); }
  10% { transform: translateX(-8px); }
  20% { transform: translateX(8px); }
  30% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  50% { transform: translateX(-4px); }
  60% { transform: translateX(4px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(0); }
  100% { transform: translateX(0); }
}

@keyframes shake-vertical-ease {
  0% { transform: translateY(0); }
  10% { transform: translateY(-8px); }
  20% { transform: translateY(8px); }
  30% { transform: translateY(-6px); }
  40% { transform: translateY(6px); }
  50% { transform: translateY(-4px); }
  60% { transform: translateY(4px); }
  70% { transform: translateY(-2px); }
  80% { transform: translateY(2px); }
  90% { transform: translateY(0); }
  100% { transform: translateY(0); }
}

.shake-horizontal {
  animation: shake-horizontal-ease 2.5s ease-out forwards;
}

.shake-vertical {
  animation: shake-vertical-ease 2.5s ease-out forwards;
}

      `}</style>

      <div className={`
        min-h-screen flex flex-row items-center justify-start gap-10 text-xl p-10
        ${theme === 'light'
          ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200 text-purple-800'
          : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900 text-purple-200'}
      `}>
        {/* Ellie image - far left, shaking on answer */}
        <div className={`flex-shrink-0 ml-0 rounded-xl ${getShakeClass()}`}>
          <Image
            src={ellieImageSrc}
            alt="Ellie character"
            width={600}
            height={600}
            className="rounded-xl"
          />
        </div>

        {/* Main game area */}
        <div className="flex-1 max-w-5xl px-6">
          {!showSummary ? (
            <div className={`
              backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full text-center
              ${theme === 'light'
                ? 'bg-white/90 text-purple-800'
                : 'bg-gray-800/90 text-purple-200'}
            `}>
              <p className="text-lg mb-2">Round {currentIndex + 1} / {questions.length}</p>
              <h1 className="text-4xl font-bold mb-2">What does this word mean?</h1>
              <h2 className={`
                text-6xl font-extrabold mb-6
                ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}
              `} dir="rtl">
                {q.hebrewWord}
              </h2>

              <div className="flex justify-center gap-6 mb-6">
                <button
                  onClick={() => setShowSentence(true)}
                  className={`
                    px-6 py-2 rounded shadow text-lg
                    ${theme === 'light'
                      ? 'bg-purple-200 hover:bg-purple-300 text-purple-800'
                      : 'bg-purple-700 hover:bg-purple-600 text-purple-200'}
                  `}
                >
                  Show Sentence 📘
                </button>
                <button
                  onClick={() => setShowEmoji(true)}
                  className={`
                    px-6 py-2 rounded shadow text-lg
                    ${theme === 'light'
                      ? 'bg-yellow-100 hover:bg-yellow-200 text-purple-800'
                      : 'bg-yellow-700 hover:bg-yellow-600 text-yellow-100'}
                  `}
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
                          ? 'bg-green-300 text-green-800'
                          : opt === selected
                            ? 'bg-red-300 text-red-800'
                            : theme === 'light'
                              ? 'bg-white text-purple-800'
                              : 'bg-gray-700 text-purple-200'
                        : theme === 'light'
                          ? 'bg-white hover:bg-purple-100 text-purple-800'
                          : 'bg-gray-700 hover:bg-purple-800 text-purple-200'}`}
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
            isGuest ? (
              <div className={`
                backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full text-center
                ${theme === 'light'
                  ? 'bg-white/90 text-purple-800'
                  : 'bg-gray-800/90 text-purple-200'}
              `}>
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
              <div className={`
                backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full text-center
                ${theme === 'light'
                  ? 'bg-white/90 text-purple-800'
                  : 'bg-gray-800/90 text-purple-200'}
              `}>
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
                  className={`
                    px-6 py-3 rounded shadow text-lg
                    ${theme === 'light'
                      ? 'bg-purple-300 hover:bg-purple-400 text-white'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'}
                  `}
                >
                  New Game
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
