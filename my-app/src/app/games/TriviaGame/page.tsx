// src/app/games/TriviaGame/page.tsx
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

/* ---------- server-payload types ---------- */
interface TriviaRound {
  hebrewWord: string;
  options: string[];       // 4 English words
  correctIndex: number;    // index in options
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
const ROUNDS_FOR_SIGNED = 5;
const ROUNDS_FOR_GUEST  = 3;

// Fisher-Yates shuffle
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
  const db   = getFirestore(app);

  /* state */
  const [questions,    setQuestions]    = useState<TriviaRound[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected,     setSelected]     = useState<string|null>(null);
  const [score,        setScore]        = useState(0);
  const [answers,      setAnswers]      = useState<AnswerLog[]>([]);
  const [showSentence, setShowSentence] = useState(false);
  const [showEmoji,    setShowEmoji]    = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isGuest,      setIsGuest]      = useState(false);
  const [showSummary,  setShowSummary]  = useState(false);
  const [showEllie,    setShowEllie]    = useState(false);
  const [ellieCorrect, setEllieCorrect] = useState(false);

  // wait for Firebase auth to initialize
  const [authReady, setAuthReady] = useState(false);

  /* fetch N fresh rounds without duplicates, shuffle options */
  const loadRounds = async () => {
    setIsLoading(true);
    const guest = !auth.currentUser;
    setIsGuest(guest);
    const roundsNeeded = guest ? ROUNDS_FOR_GUEST : ROUNDS_FOR_SIGNED;

    try {
      const seen = new Set<string>();
      const fetched: TriviaRound[] = [];
      while (fetched.length < roundsNeeded) {
        const res = await fetch('/api/trivia-round');
        const q = await res.json() as TriviaRound;
        if (seen.has(q.hebrewWord)) continue;
        seen.add(q.hebrewWord);
        // shuffle options and adjust correctIndex
        const correctAns = q.options[q.correctIndex];
        const newOptions = shuffleArray(q.options);
        const newIndex = newOptions.findIndex(o => o === correctAns);
        fetched.push({
          ...q,
          options: newOptions,
          correctIndex: newIndex
        });
      }
      setQuestions(fetched);
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
  };

  /* wait for auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {
      setAuthReady(true);
    });
    return unsub;
  }, [auth]);

  /* load once ready */
  useEffect(() => {
    if (authReady) loadRounds();
  }, [authReady]);

  /* answer selection */
  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);

    const q = questions[currentIndex];
    const correct = q.options[q.correctIndex];
    const isCorrect = option === correct;
    if (isCorrect) setScore(s => s + 1);

    setAnswers(a => [...a, {
      hebrew: q.hebrewWord,
      correct,
      selected: option,
      result: isCorrect ? 'Correct' : 'Wrong'
    }]);

    setEllieCorrect(isCorrect);
    setShowEllie(true);

    setTimeout(() => {
      setShowEllie(false);
      if (currentIndex + 1 >= questions.length) {
        setShowSummary(true);
        if (!isGuest) saveResults(score + (isCorrect ? 1 : 0));
      } else {
        setCurrentIndex(i => i + 1);
        setSelected(null);
        setShowSentence(false);
        setShowEmoji(false);
      }
    }, 1200);
  };

  /* save signed-in */
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

  /* restart */
  const restart = () => loadRounds();

  /* loading */
  if (isLoading) return (
      <div className={
        `min-h-screen flex items-center justify-center
      ${theme==='light'
            ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200'
            : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`
      }>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🌟</div>
          <div className={`text-xl font-bold ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}>
            Loading game...
          </div>
        </div>
      </div>
  );

  const q = questions[currentIndex];

  return (
    <div className={
      `min-h-screen flex items-center justify-center p-6
      ${theme==='light'
        ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200'
        : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`
    }>
      <div className="flex items-start justify-center gap-8 max-w-none w-full">

        {/* Ellie Character - positioned on the left with zoom-fixed sizing */}
        <div className="hidden lg:block flex-shrink-0 w-[600px] mt-28 -ml-92">
          <div className="relative">
            <img
              src={showEllie
                ? (ellieCorrect ? "/ellie0001.png" : "/ellie0003.png")
                : "/ellie0001.png"}
              alt="Ellie"
              className={`w-[600px] h-auto drop-shadow-2xl transition-all duration-300 ${
                showEllie
                  ? ellieCorrect
                    ? "animate-[shake-vertical_0.8s_ease-in-out]"
                    : "animate-[shake-horizontal_0.8s_ease-in-out]"
                  : ""
              }`}
            />
            {/* Speech bubble */}
            <div className={`absolute -top-6 -right-10 backdrop-blur-sm 
                rounded-2xl p-4 shadow-lg border-2 max-w-sm transition-all duration-300 ${
                showEllie ? 'animate-pulse scale-105' : ''
            } ${theme === 'light'
                ? 'bg-white/95 border-purple-200'
                : 'bg-gray-800/95 border-purple-400'}`}
            >
              <div className={`font-medium text-sm
                  ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
              >
                {!showSummary ? (
                  showEllie ? (
                    ellieCorrect ? 
                      "Awesome! You got it right! 🎉✨" : 
                      "Oops! Better luck next time! 💪"
                  ) : (
                    currentIndex === 0 ? 
                      "Let's test your Hebrew knowledge! Pick the right answer! 🧠🎯" :
                      "Keep going! You're doing great! 🌟"
                  )
                ) : (
                  isGuest ? 
                    "Great job! Sign in to play more games! 🎮" :
                    `Fantastic! You scored ${score} out of ${questions.length}! 🏆`
                )}
              </div>
              {/* Speech bubble tail */}
              <div className={`absolute bottom-0 left-10 w-0 h-0 border-l-8 border-r-8
                  border-t-8 border-l-transparent border-r-transparent transform translate-y-full
                  ${theme === 'light'
                    ? 'border-t-white/95'
                    : 'border-t-gray-800/95'}`}
              ></div>
            </div>

            {/* Reaction sparkles */}
            {showEllie && (
              <>
                <div className={`absolute top-20 left-16 text-2xl animate-ping ${
                  ellieCorrect ? 'text-green-500' : 'text-red-500'
                }`}>
                  {ellieCorrect ? '✨' : '💫'}
                </div>
                <div className={`absolute top-32 right-20 text-xl animate-ping delay-150 ${
                  ellieCorrect ? 'text-yellow-500' : 'text-orange-500'
                }`}>
                  {ellieCorrect ? '🌟' : '🔥'}
                </div>
                <div className={`absolute top-40 left-24 text-lg animate-ping delay-300 ${
                  ellieCorrect ? 'text-blue-500' : 'text-purple-500'
                }`}>
                  {ellieCorrect ? '🎉' : '💪'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Game Container */}
        <div className="flex-1 min-w-0 max-w-4xl">
          {!showSummary ? (
            <div className={
              `backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full text-center
              ${theme==='light'?'bg-white/90 text-purple-800':'bg-gray-800/90 text-purple-200'}`
            }>
              <p className="text-lg mb-2">
                Round {currentIndex+1} / {questions.length}
              </p>
              <h1 className="text-4xl font-bold mb-2">
                What does this word mean?
              </h1>
              <h2 className={`text-6xl font-extrabold mb-6 ${theme==='light'?'text-purple-700':'text-purple-300'}`} dir="rtl">
                {q.hebrewWord}
              </h2>

              <div className="flex justify-center gap-6 mb-6">
                <button onClick={()=>setShowSentence(true)} className={`px-6 py-2 rounded shadow text-lg ${theme==='light'?'bg-purple-200 hover:bg-purple-300 text-purple-800':'bg-purple-700 hover:bg-purple-600 text-purple-200'}`}>Show Sentence 📘</button>
                <button onClick={()=>setShowEmoji(true)} className={`px-6 py-2 rounded shadow text-lg ${theme==='light'?'bg-yellow-100 hover:bg-yellow-200 text-purple-800':'bg-yellow-700 hover:bg-yellow-600 text-yellow-100'}`}>Show Emoji 😃</button>
              </div>

              {showSentence && <p className="mb-4 italic text-lg">{q.clueSentence}</p>}
              {showEmoji    && <p className="text-4xl mb-6">{q.clueEmoji}</p>}

              <div className="grid grid-cols-2 gap-6">
                {q.options.map(opt => (
                  <button key={opt} onClick={()=>handleSelect(opt)} className={
                    `w-full py-4 rounded-lg shadow-md text-2xl transition-all
                    ${selected
                      ? opt===q.options[q.correctIndex]
                        ? 'bg-green-300 text-green-800'
                        : opt===selected
                          ? 'bg-red-300 text-red-800'
                          : theme==='light'?'bg-white text-purple-800':'bg-gray-700 text-purple-200'
                      : theme==='light'?'bg-white hover:bg-purple-100 text-purple-800':'bg-gray-700 hover:bg-purple-800 text-purple-200'}`
                  }>{opt}</button>
                ))}
              </div>

              {selected && (
                <p className="mt-6 text-2xl font-semibold">
                  {selected===q.options[q.correctIndex] ? "You're Right! ✅" : "Oops! That's not it ❌"}
                </p>
              )}

              <p className="mt-4 text-base">Score: {score}</p>
            </div>
          ) : (
            isGuest ? (
              <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full text-center ${theme==='light'?'bg-white/90 text-purple-800':'bg-gray-800/90 text-purple-200'}`}>
                <h2 className="text-3xl font-bold mb-6">🎮 Want More Games?</h2>
                <p className="text-xl mb-6">If you enjoyed this game, sign up for full access!</p>
                <button onClick={()=>window.location.href='/signin'} className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded shadow text-lg">Sign In / Register</button>
              </div>
            ) : (
              <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full text-center ${theme==='light'?'bg-white/90 text-purple-800':'bg-gray-800/90 text-purple-200'}`}>
                <h2 className="text-4xl font-bold mb-6">🎉 Game Over!</h2>
                <p className="text-2xl mb-6">Your Score: {score} / {questions.length}</p>
                <ul className="text-left text-lg mb-6">
                  {answers.map((a,i)=> (
                    <li key={i} className="flex items-center gap-2 mb-2">
                      {a.result==='Correct' ? <span className="text-green-500 text-2xl">✅</span> : <span className="text-red-500 text-2xl">❌</span>}
                      <span>You chose {a.selected} - {a.hebrew}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={restart} className={`px-6 py-3 rounded shadow text-lg ${theme==='light'?'bg-purple-300 hover:bg-purple-400 text-white':'bg-purple-600 hover:bg-purple-500 text-white'}`}>New Game</button>
              </div>
            )
          )}
        </div>

        {/* Mobile Ellie (shows on smaller screens) */}
        <div className="lg:hidden fixed bottom-6 right-6 z-10">
          <img
            src={showEllie
              ? (ellieCorrect ? "/ellie0001.png" : "/ellie0003.png")
              : "/ellie0001.png"}
            alt="Ellie"
            className={`w-80 h-auto drop-shadow-lg opacity-90 transition-all duration-300 ${
              showEllie
                ? ellieCorrect
                  ? "animate-[shake-vertical_0.8s_ease-in-out]"
                  : "animate-[shake-horizontal_0.8s_ease-in-out]"
                : ""
            }`}
          />
          {showEllie && (
            <>
              <div className={`absolute -top-2 -left-2 text-lg animate-ping ${
                ellieCorrect ? 'text-green-500' : 'text-red-500'
              }`}>
                {ellieCorrect ? '✅' : '❌'}
              </div>
              <div className={`absolute -top-1 -right-1 text-sm animate-ping delay-150 ${
                ellieCorrect ? 'text-yellow-500' : 'text-orange-500'
              }`}>
                {ellieCorrect ? '🌟' : '💫'}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`@keyframes shake-vertical { 0%,100%{transform:translateY(0)}10%,30%,50%,70%,90%{transform:translateY(-10px)}20%,40%,60%,80%{transform:translateY(10px)}}@keyframes shake-horizontal {0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-10px)}20%,40%,60%,80%{transform:translateX(10px)}}`}</style>
    </div>
  );
}