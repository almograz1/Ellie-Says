'use client';

import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/ThemeContext';

const GUEST_ROUNDS = 3;
const USER_ROUNDS = 5;

// strip niqqud and split Hebrew into consonants
const stripNikud = (s: string) => s.replace(/[֑-\u05C7]/g, '');
const splitCons = (s: string) => stripNikud(s).split('');

interface Round { imageUrl: string; hebrew: string; pool: string[] }
interface Letter { id: string; char: string }
interface Summary { imageUrl: string; hebrew: string; correct: boolean }

export default function PhotoWordGame() {
  const { theme } = useTheme();
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [authReady, setAuthReady] = useState(false);
  const [isGuest, setIsGuest] = useState<boolean | null>(null);
  const [round, setRound] = useState(1);
  const [data, setData] = useState<Round | null>(null);
  const [pool, setPool] = useState<Letter[]>([]);
  const [filled, setFilled] = useState<(Letter | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [summary, setSummary] = useState<Summary[]>([]);
  const [sessionEnd, setSessionEnd] = useState(false);
  const [trialEnd, setTrialEnd] = useState(false);
  const [error, setError] = useState<string>();
  const [showWord, setShowWord] = useState(false);
  const [loading, setLoading] = useState(false);

  // auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setIsGuest(!user);
      setAuthReady(true);
    });
    return unsub;
  }, [auth]);

  // load first round
  useEffect(() => {
    if (authReady && isGuest !== null) loadRound();
  }, [authReady, isGuest]);

  const loadRound = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/photo-word-round');
      if (!res.ok) throw new Error('API ' + res.status);
      const payload = (await res.json()) as Round;
      setData(payload);

      const letters = splitCons(payload.hebrew);
      setFilled(Array(letters.length).fill(null));
      setPool(payload.pool.map(c => ({ id: crypto.randomUUID(), char: c })));
      setSubmitted(false);
      setCorrect(false);
      setShowWord(false);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    } finally {
      setLoading(false);
    }
  };

  // select by clicking
  const selectLetter = (tile: Letter) => {
    if (submitted) return;
    const idx = filled.findIndex(l => l === null);
    if (idx === -1) return;
    setFilled(f => { const a = [...f]; a[idx] = tile; return a; });
    setPool(p => p.filter(l => l.id !== tile.id));
  };

  // return by clicking blank
  const removeLetter = (index: number) => {
    if (submitted) return;
    const tile = filled[index];
    if (!tile) return;
    setFilled(f => { const a = [...f]; a[index] = null; return a; });
    setPool(p => [...p, tile]);
  };

  const resetRound = () => {
    if (!data) return;
    const letters = splitCons(data.hebrew);
    setFilled(Array(letters.length).fill(null));
    setPool(data.pool.map(c => ({ id: crypto.randomUUID(), char: c })));
  };

  const handleSubmit = () => {
    if (!data) return;
    const attempt = filled.map(l => l?.char || '').join('');
    setCorrect(attempt === splitCons(data.hebrew).join(''));
    setSubmitted(true);
    setShowWord(true);
  };

  const handleNext = () => {
    if (!data) return;
    setSummary(s => [...s, { imageUrl: data.imageUrl, hebrew: data.hebrew, correct }]);
    const max = isGuest ? GUEST_ROUNDS : USER_ROUNDS;
    if (round < max) {
      setRound(r => r + 1);
      loadRound();
    } else {
      setSessionEnd(true);
      if (isGuest) setTrialEnd(true);
    }
  };

  // save at end
  useEffect(() => {
    if (authReady && sessionEnd && !isGuest && auth.currentUser) {
      const uid = auth.currentUser.uid;
      const dbSummary = summary.map(e => ({ hebrew: e.hebrew, correct: e.correct }));
      addDoc(
          collection(db, 'photo_word_results'),
          { uid, summary: dbSummary, createdAt: serverTimestamp() }
      );
    }
  }, [authReady, sessionEnd, isGuest, summary, db, auth]);

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!data || isGuest === null) return (
      <div className={`min-h-screen flex items-center justify-center ${theme==='light' ? 'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200' : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">🌟</div>
          <div className={`text-xl font-bold ${theme==='light'?'text-purple-800':'text-purple-200'}`}>Loading game…</div>
        </div>
      </div>
  );

  if (trialEnd) return (
      <Screen theme={theme}>
        <h2 className="text-3xl font-bold mb-4">Trial Over</h2>
        <button onClick={() => router.push('/signin')} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl shadow">Sign Up</button>
      </Screen>
  );

  if (sessionEnd) return (
      <Screen theme={theme}>
        <h2 className="text-4xl font-bold mb-6">Session Summary</h2>
        {summary.map((s,i) => (
            <div key={i} className="flex items-center gap-3 mb-2">
              <img src={s.imageUrl} alt="" className="w-12 h-12 object-contain rounded" />
              <span className={s.correct ? 'text-green-500' : 'text-red-500'}>{s.correct ? '✅' : '❌'}</span>
              <span className="text-2xl">{s.hebrew}</span>
            </div>
        ))}
        <button onClick={() => window.location.reload()} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl shadow">Play Again</button>
      </Screen>
  );

  const letters = splitCons(data.hebrew);

  return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-8 p-6 ${theme==='light'?'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200':'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}>
        <h2 className="text-xl font-bold">Round {round} / {isGuest ? GUEST_ROUNDS : USER_ROUNDS}</h2>
        <img src={data.imageUrl} alt="" className="w-64 h-64 object-contain rounded-xl shadow" />
        <div dir="rtl" className="flex gap-2">
          {letters.map((_,i) => <Blank key={i} letter={filled[i]} onRemove={() => removeLetter(i)} theme={theme} correct={submitted ? filled[i]?.char === letters[i] : undefined} />)}
        </div>
        <Pool letters={pool} onSelect={selectLetter} theme={theme} />
        {!submitted ? (
            <div className="flex gap-4">
              <button onClick={handleSubmit} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl shadow">Submit</button>
              <button onClick={resetRound} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl shadow">Reset</button>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xl">{correct ? '✅ Correct!' : '❌ Incorrect.'}</p>
              {showWord && <p className="italic">The word was: {stripNikud(data.hebrew)}</p>}
              {(correct || filled.every(Boolean)) ? (
                  <button onClick={handleNext} disabled={loading} className={`px-6 py-3 rounded-xl shadow text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>{round < (isGuest ? GUEST_ROUNDS : USER_ROUNDS) ? 'Next' : 'Finish'}</button>
              ) : (
                  <button onClick={resetRound} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow">Retry</button>
              )}
            </div>
        )}
      </div>
  );
}

function Screen({ children, theme }: { children: React.ReactNode; theme: string }) {
  return (
      <div className={`min-h-screen flex items-center justify-center p-6 text-center ${theme==='light'?'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200':'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}>
        <div className={`backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-xl w-full ${theme==='light'?'bg-white/90 text-purple-800':'bg-gray-800/90 text-purple-200'}`}>{children}</div>
      </div>
  );
}

function Blank({ letter, onRemove, theme, correct }: { letter: Letter | null; onRemove: () => void; theme: string; correct?: boolean }) {
  let bg = theme==='light' ? 'bg-white' : 'bg-gray-700';
  if (correct !== undefined) bg = correct ? 'bg-green-300' : 'bg-red-300';
  return (
      <div onClick={() => letter && onRemove()} className={`w-12 h-12 border-b-2 rounded-md flex items-center justify-center ${bg} ${theme==='light'?'border-purple-400':'border-purple-500'} cursor-pointer`}>
        {letter?.char}
      </div>
  );
}

function Pool({ letters, onSelect, theme }: { letters: Letter[]; onSelect: (l: Letter) => void; theme: string }) {
  return (
      <div className="flex flex-wrap justify-center gap-3">
        {letters.map(l => (
            <div key={l.id} onClick={() => onSelect(l)} className={`w-12 h-12 flex items-center justify-center rounded-lg border shadow text-xl font-bold cursor-pointer ${theme==='light'?'bg-white border-purple-300 text-purple-800':'bg-gray-700 border-purple-500 text-purple-200'}`}>
              {l.char}
            </div>
        ))}
      </div>
  );
}
