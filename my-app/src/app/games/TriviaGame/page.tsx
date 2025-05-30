'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { app } from '../../../firebase';

interface WordEntry {
  english: string;
  hebrew: string;
  sentence: string;
  emoji: string;
}

function getRandomEntries(entries: WordEntry[], count: number): WordEntry[] {
  return [...entries].sort(() => 0.5 - Math.random()).slice(0, count);
}

function getOptions(correct: WordEntry, all: WordEntry[]): string[] {
  const others = all.filter(e => e.english !== correct.english);
  const options = getRandomEntries(others, 3).map(e => e.english);
  options.push(correct.english);
  return options.sort(() => 0.5 - Math.random());
}

export default function TriviaGamePage() {
  const [wordPairs, setWordPairs] = useState<WordEntry[]>([]);
  const [questions, setQuestions] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [showSentence, setShowSentence] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchWords = async () => {
      const snapshot = await getDocs(collection(db, 'trivia_words'));
      const words: WordEntry[] = snapshot.docs.map(doc => doc.data() as WordEntry);
      const user = auth.currentUser;
      const guest = !user;
      setIsGuest(guest);

      const selectedQuestions = getRandomEntries(words, guest ? 3 : 5);
      setWordPairs(words);
      setQuestions(selectedQuestions);
      setOptions(getOptions(selectedQuestions[0], words));
      setIsLoading(false);
    };

    fetchWords();
  }, []);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    setShowFeedback(true);
    const correct = questions[currentIndex].english;
    const isCorrect = option === correct;
    if (isCorrect) setScore(prev => prev + 1);
    setAnswers(prev => [...prev, {
      hebrew: questions[currentIndex].hebrew,
      correct,
      selected: option,
      result: isCorrect ? 'Correct' : 'Wrong'
    }]);
    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= questions.length) {
        setShowSummary(true);
        if (!isGuest) saveResults();
      } else {
        setCurrentIndex(next);
        setOptions(getOptions(questions[next], wordPairs));
        setSelected(null);
        setShowFeedback(false);
        setShowSentence(false);
        setShowEmoji(false);
      }
    }, 1200);
  };

  const saveResults = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, 'trivia_results'), {
        uid: user.uid,
        score,
        answers,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const restart = async () => {
    setIsLoading(true);
    const snapshot = await getDocs(collection(db, 'trivia_words'));
    const words: WordEntry[] = snapshot.docs.map(doc => doc.data() as WordEntry);
    const selectedQuestions = getRandomEntries(words, isGuest ? 3 : 5);
    setWordPairs(words);
    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setOptions(getOptions(selectedQuestions[0], words));
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setShowSummary(false);
    setShowFeedback(false);
    setShowSentence(false);
    setShowEmoji(false);
    setIsLoading(false);
  };

  if (isLoading) return <div>Loading game...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-10 text-purple-800 text-xl">
      {!showSummary ? (
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-5xl text-center">
          <p className="text-lg mb-2">Round {currentIndex + 1} / {questions.length}</p>
          <h1 className="text-4xl font-bold mb-2">What does this word mean?</h1>
          <h2 className="text-6xl font-extrabold text-purple-700 mb-6" dir="rtl">
            {questions[currentIndex].hebrew}
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

          {showSentence && <p className="mb-4 italic text-lg">{questions[currentIndex].sentence}</p>}
          {showEmoji && <p className="text-4xl mb-6">{questions[currentIndex].emoji}</p>}

          <div className="grid grid-cols-2 gap-6">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full py-4 rounded-lg shadow-md text-2xl transition-all
                  ${selected
                    ? opt === questions[currentIndex].english
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
              {selected === questions[currentIndex].english ? "You're Right! ✅" : "Oops! That's not it ❌"}
            </p>
          )}

          <p className="mt-4 text-base">Score: {score}</p>
        </div>
      ) : (
        isGuest ? (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 w-full max-w-5xl text-center">
            <h2 className="text-3xl font-bold mb-6">🎮 Want More Games?</h2>
            <p className="text-xl mb-6">
              If you enjoyed this game, sign up for full access to more rounds and all game modes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/signin'}
                className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded shadow text-lg"
              >
                Sign In / Register
              </button>
            </div>
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
