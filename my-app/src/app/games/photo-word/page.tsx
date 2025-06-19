// src/app/games/photo-word/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend }        from 'react-dnd-html5-backend';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { app }       from '../../../firebase';
import { useTheme }  from '@/lib/ThemeContext';

const ItemType = { LETTER: 'letter' } as const;
const GUEST_ROUNDS = 3, USER_ROUNDS = 5;

/* strip niqqud and split into consonants */
const stripNikud = (s: string) => s.replace(/[֑-\u05C7]/g, '');
const splitCons  = (s: string) => stripNikud(s).split('');

/* types */
interface Round   { imageUrl: string; hebrew: string; pool: string[] }
interface Letter  { id: string; char: string }
interface Summary { imageUrl: string; hebrew: string; correct: boolean }

export default function PhotoWordGame() {
  const { theme } = useTheme();
  const router    = useRouter();

  /* auth state */
  const [isGuest, setIsGuest] = useState<boolean|null>(null);
  useEffect(() => onAuthStateChanged(getAuth(app), u => setIsGuest(!u)), []);

  /* game state */
  const [round,         setRound]      = useState(1);
  const [data,          setData]       = useState<Round|null>(null);
  const [pool,          setPool]       = useState<Letter[]>([]);
  const [filled,        setFilled]     = useState<(Letter|null)[]>([]);
  const [submitted,     setSubmitted]  = useState(false);
  const [correct,       setCorrect]    = useState(false);
  const [summary,       setSummary]    = useState<Summary[]>([]);
  const [trialEnd,      setTrialEnd]   = useState(false);
  const [sessionEnd,    setSessionEnd] = useState(false);
  const [error,         setError]      = useState<string>();
  const [showWord,      setShowWord]   = useState(false);
  const [loadingRound,  setLoadingRound] = useState(false);  // lock Next button

  /* fetch one round */
  const loadRound = async () => {
    setLoadingRound(true);
    try {
      const res = await fetch('/api/photo-word-round');
      if (!res.ok) throw new Error('API ' + res.status);
      const j: Round = await res.json();
      setData(j);

      const letters = splitCons(j.hebrew);
      setFilled(Array(letters.length).fill(null));
      setPool(j.pool.map(c => ({ id: crypto.randomUUID(), char: c })));
      setSubmitted(false);
      setCorrect(false);
      setShowWord(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingRound(false);
    }
  };
  useEffect(() => { if (isGuest !== null) loadRound(); }, [isGuest]);

  /* drag & drop handlers */
  const dropToBlank = (i:number, tile:Letter) => {
    if (submitted) return;
    setFilled(f => { const n = [...f]; n[i] = tile; return n; });
    setPool(p => p.filter(l => l.id !== tile.id));
  };
  const returnToPool = (tile:Letter) => {
    if (submitted) return;
    setPool(p => p.some(l => l.id===tile.id) ? p : [...p, tile]);
    setFilled(f => f.map(l => (l?.id===tile.id?null:l)));
  };

  /* reset current round */
  const resetRound = () => {
    if (!data) return;
    const letters = splitCons(data.hebrew);
    setFilled(Array(letters.length).fill(null));
    setPool(data.pool.map(c => ({ id: crypto.randomUUID(), char: c })));
  };

  /* submit answer */
  const handleSubmit = () => {
    if (!data) return;
    const answer = filled.map(l => l?.char || '').join('');
    const isCorrect = answer === splitCons(data.hebrew).join('');
    setCorrect(isCorrect);
    setSubmitted(true);
    setShowWord(true);
  };

  /* next round or finish */
  const handleNext = () => {
    if (data) {
      setSummary(s => [...s, { imageUrl: data.imageUrl, hebrew: data.hebrew, correct }]);
    }
    const max = isGuest ? GUEST_ROUNDS : USER_ROUNDS;
    if (round < max) {
      setRound(r => r + 1);
      loadRound();
    } else {
      isGuest ? setTrialEnd(true) : setSessionEnd(true);
    }
  };

  /* early guards */
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!data || isGuest===null) return <div className="p-6">Loading…</div>;

  /* trial finished */
  if (trialEnd) {
    return (
      <Screen theme={theme}>
        <h2 className="text-3xl font-bold mb-4">Trial Over</h2>
        <button onClick={()=>router.push('/signin')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl shadow">
          Sign Up to Continue
        </button>
      </Screen>
    );
  }

  /* session summary */
  if (sessionEnd) {
    return (
      <Screen theme={theme}>
        <h2 className="text-4xl font-bold mb-6">Session Summary</h2>
        {summary.map((s,i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <span className={s.correct ? 'text-green-500' : 'text-red-500'}>
              {s.correct ? '✅' : '❌'}
            </span>
            <img src={s.imageUrl} alt="" className="w-16 h-16 object-contain rounded"/>
            <span className="text-2xl">{s.hebrew}</span>
          </div>
        ))}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl shadow"
        >
          Play Again
        </button>
      </Screen>
    );
  }


  /* active round UI */
  const letters = splitCons(data.hebrew);
  const allFilled = filled.every(Boolean);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`
        min-h-screen flex flex-col items-center justify-center gap-8 p-6
        ${theme==='light'
          ?'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200'
          :'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}
      `}>
        <h2 className="text-xl font-bold">
          Round {round} / {isGuest?GUEST_ROUNDS:USER_ROUNDS}
        </h2>

        <img src={data.imageUrl} alt="" className="w-64 h-64 object-contain rounded-xl shadow"/>

        {/* blanks */}
        <div dir="rtl" className="flex gap-2">
          {letters.map((_,i)=>(
            <Blank key={i} index={i} letter={filled[i]} onDrop={dropToBlank} theme={theme} correct={submitted? filled[i]?.char===letters[i]:undefined} />
          ))}
        </div>

        {/* pool */}
        <Pool letters={pool} onDropBack={returnToPool} theme={theme}/>

        {/* controls */}
        {!submitted ? (
          <div className="flex gap-4">
            <button onClick={handleSubmit} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl shadow">Submit</button>
            {!allFilled && <button onClick={resetRound} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl shadow">Reset</button>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xl">{correct?'✅ Correct!':'❌ Incorrect.'}</p>
            {showWord && <p className="italic">The word was: {stripNikud(data.hebrew)}</p>}
            {(correct||allFilled) ? (
              <button onClick={handleNext} disabled={loadingRound} className={`px-6 py-3 rounded-xl shadow text-white ${loadingRound?'bg-gray-400 cursor-not-allowed':'bg-green-500 hover:bg-green-600'}`}>
                {round < (isGuest?GUEST_ROUNDS:USER_ROUNDS)?'Next':'Finish'}
              </button>
            ) : (
              <button onClick={resetRound} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl shadow">Retry</button>
            )}
          </div>
        )}
      </div>
    </DndProvider>
  );
}

/* full-screen modal */
function Screen({ children, theme }: { children: React.ReactNode; theme: string }) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 text-center ${theme==='light'?'bg-gradient-to-br from-pink-200 via-purple-200 to-yellow-200':'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}>
      <div className={`backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-xl w-full ${theme==='light'?'bg-white/90 text-purple-800':'bg-gray-800/90 text-purple-200'}`}>{children}</div>
    </div>
  );
}

function Draggable({ char, id, theme }: Letter & { theme: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({ type: ItemType.LETTER, item: { id, char }, collect: m => ({ isDragging: !!m.isDragging() }) }));
  return <div ref={drag} className={`w-12 h-12 flex items-center justify-center rounded-lg border shadow text-xl font-bold ${isDragging?'opacity-30':'opacity-100'} ${theme==='light'?'bg-white border-purple-300 text-purple-800':'bg-gray-700 border-purple-500 text-purple-200'}`}>{char}</div>;
}

function Blank({ index, letter, onDrop, theme, correct }: { index:number; letter: Letter|null; onDrop:(i:number,l:Letter)=>void; theme:string; correct?:boolean }) {
  const [{ isOver }, drop] = useDrop(() => ({ accept: ItemType.LETTER, drop: (it:Letter)=>onDrop(index,it), collect: m=>({isOver:!!m.isOver()}) }));
  const [{ isDragging }, drag] = useDrag(() => ({ type: ItemType.LETTER, item: letter!, canDrag: !!letter, collect: m=>({isDragging:!!m.isDragging()}) }));
  let bg = theme==='light'?'bg-white':'bg-gray-700';
  if(isOver) bg = theme==='light'?'bg-purple-100':'bg-purple-800';
  if(correct!==undefined) bg = correct?'bg-green-300':'bg-red-300';
  return <div ref={drop} className={`w-12 h-12 border-b-2 rounded-md flex items-center justify-center ${bg} ${theme==='light'?'border-purple-400':'border-purple-500'}`}>{letter && <div ref={drag} className={isDragging?'opacity-30 cursor-move':'cursor-move'}>{letter.char}</div>}</div>;
}

function Pool({ letters, onDropBack, theme }: { letters: Letter[]; onDropBack:(l:Letter)=>void; theme:string }) {
  const [, drop] = useDrop(() => ({ accept: ItemType.LETTER, drop: onDropBack }));
  return <div ref={drop} className="flex flex-wrap justify-center gap-3">{letters.map(l => <Draggable key={l.id} {...l} theme={theme}/> )}</div>;
}
