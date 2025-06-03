'use client';

import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import sentenceData from '@/data/sentenceData.json';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { app } from '../../../firebase';

/* ────────── Types & constants ────────── */
const TRIAL_LIMIT = 3;
const STORAGE_KEY = 'sentenceGameTrials';
const ItemType = { WORD: 'word' } as const;

interface SentenceEntry {
  sentence: string;
  missingWords: string[];
  distractors: string[];
}
interface WordItem {
  id: string;
  word: string;
}
interface RoundResult {
  round: number;
  chosen: string[];
  correct: boolean;
  correctSentence: string;
}

/* ────────── Main component ────────── */
export default function SentenceGamePage() {
  const router = useRouter();

  /* auth / guest */
  const [hydrated, setHydrated] = useState(false);
  const [isGuest,  setIsGuest]  = useState<boolean | null>(null); // null until auth ready

  /* trial-limit modal */
  const [limitReached, setLimitReached] = useState(false);

  /* in-game state (works only while !limitReached) */
  const [round, setRound]         = useState(1);
  const [results, setResults]     = useState<RoundResult[]>([]);
  const [usedSent, setUsed]       = useState<string[]>([]);
  const [showSum, setShowSum]     = useState(false);

  const [entry, setEntry]         = useState<SentenceEntry | null>(null);
  const [filled, setFilled]       = useState<(WordItem | null)[]>([null, null, null]);
  const [pool, setPool]           = useState<WordItem[]>([]);
  const [feedback, setFB]         = useState<string | null>(null);
  const [submitted, setSub]       = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);

  /* ────────── Auth & trial counter ────────── */
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const unsub = onAuthStateChanged(getAuth(app), user => {
      const guest = !user;
      setIsGuest(guest);

      const played = Number(localStorage.getItem(STORAGE_KEY) || '0');
      if (guest && played >= TRIAL_LIMIT) {
        setLimitReached(true);
      }
    });
    return () => unsub();
  }, [hydrated]);

  /* ────────── Game logic (only if not limit-reached) ────────── */

  /* pick a sentence */
  const loadRound = useCallback((prevUsed: string[]) => {
    let pick: SentenceEntry;
    const total = sentenceData.length;
    do {
      pick = sentenceData[Math.floor(Math.random() * total)];
    } while (prevUsed.includes(pick.sentence) && prevUsed.length < total);

    const shuffled = [...pick.missingWords, ...pick.distractors]
      .sort(() => 0.5 - Math.random())
      .map((w, i) => ({ id: `${w}-${i}`, word: w }));

    setEntry(pick);
    setPool(shuffled);
    setFilled([null, null, null]);
    setFB(null);
    setSub(false);
    setShowCorrect(false);
    setUsed([...prevUsed, pick.sentence]);
  }, []);

  /* start first round when allowed */
  useEffect(() => {
    if (isGuest === null || limitReached) return;
    loadRound([]);
  }, [isGuest, limitReached, loadRound]);

  /* helper */
  const buildSentence = (e: SentenceEntry) =>
    e.missingWords.reduce((s, w) => s.replace('___', w), e.sentence);

  /* drag handlers */
  const dropIntoBlank = (idx: number, item: WordItem) => {
    if (submitted) return;
    setFilled(cur => {
      const cleared = cur.map(w => (w?.id === item.id ? null : w));
      cleared[idx] = item;
      return cleared;
    });
  };
  const returnToPool = (item: WordItem) =>
    setFilled(cur => cur.map(w => (w?.id === item.id ? null : w)));

  /* submit a round */
  const submit = () => {
    if (!entry) return;
    const correct = filled.every((w, i) => w?.word === entry.missingWords[i]);

    setFB(correct ? '✅ Great job!' : '❌ Some words are incorrect.');
    setShowCorrect(!correct);
    setSub(true);

    setResults(prev => [
      ...prev,
      {
        round,
        chosen: filled.map(w => w?.word || '(blank)'),
        correct,
        correctSentence: buildSentence(entry),
      },
    ]);
  };

  /* next-step / summary */
  const nextStep = () => {
    if (round < 5) {
      setRound(r => r + 1);
      loadRound(usedSent);
    } else {
      setShowSum(true);
      /* after finishing 5 rounds, count 1 trial for guests */
      if (isGuest) {
        const played = Number(localStorage.getItem(STORAGE_KEY) || '0') + 1;
        localStorage.setItem(STORAGE_KEY, played.toString());
        if (played >= TRIAL_LIMIT) setLimitReached(true);
      }
    }
  };

  const newSession = () => {
    setRound(1);
    setResults([]);
    setUsed([]);
    setShowSum(false);
    loadRound([]);
  };

  /* ────────── Render branches ────────── */

  /* loading auth */
  if (!hydrated || isGuest === null)
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading…</div>;

  /* guest limit modal */
  if (limitReached)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-6">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-10 max-w-xl w-full text-purple-800 text-center">
          <h2 className="text-3xl font-bold mb-6">🎮 Want More Games?</h2>
          <p className="text-xl mb-6">
            You’ve used your {TRIAL_LIMIT} free rounds. Sign up to keep playing all game modes!
          </p>
          <button
            onClick={() => router.push('/signin')}
            className="bg-purple-400 hover:bg-purple-500 text-white px-6 py-3 rounded shadow text-lg"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );

  /* summary page (after 5 rounds) */
  if (showSum)
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200 p-4">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-6xl w-full text-purple-800">
            <h2 className="text-4xl font-bold mb-6 text-center">Session Summary</h2>
            {results.map(r => (
              <div key={r.round} className="mb-6">
                <h3 className="font-semibold">
                  Round {r.round} — {r.correct ? '✅ Correct' : '❌ Wrong'}
                </h3>
                <p>Your answer: {r.chosen.join(' • ')}</p>
                <p className="italic">Correct sentence: {r.correctSentence}</p>
              </div>
            ))}
            <button
              onClick={newSession}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-5 rounded-xl shadow w-full text-xl"
            >
              Play Another 5-Round Session
            </button>
          </div>
        </div>
      </DndProvider>
    );

  /* loading a sentence */
  if (!entry)
    return (
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen flex items-center justify-center text-xl">Loading…</div>
      </DndProvider>
    );

  /* ────────── In-game UI ────────── */
  const parts = entry.sentence.split('___');
  const usedIds = filled.filter(Boolean).map(w => w!.id);
  const avail = pool.filter(w => !usedIds.includes(w.id));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-6xl w-full text-purple-800">
          <h2 className="text-3xl font-bold mb-6 text-center">Round {round} / 5</h2>

          <p dir="rtl" className="text-2xl mb-8 text-center">
            {parts.map((part, i) => (
              <span key={i}>
                {part}
                {i < 3 && (
                  <Blank index={i} word={filled[i]} onDrop={dropIntoBlank} />
                )}
              </span>
            ))}
          </p>

          <WordPool words={avail} onDropBack={returnToPool} />

          {!submitted ? (
            <>
              <button
                onClick={submit}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow text-lg"
              >
                Submit
              </button>
              <button
                onClick={() => setFilled([null, null, null])}
                className="mt-3 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow text-lg"
              >
                Reset Sentence
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-2xl font-semibold mb-3">{feedback}</p>
              {showCorrect && (
                <p className="italic text-lg mb-3">
                  Correct sentence: {buildSentence(entry)}
                </p>
              )}
              <button
                onClick={nextStep}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow text-lg"
              >
                {round < 5 ? 'Next Round' : 'Finish Session'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

/* ────────── Child components ────────── */

function DraggableWord({ word, id }: WordItem) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.WORD,
    item: { id, word },
    collect: m => ({ isDragging: !!m.isDragging() }),
  }));
  return (
    <div
      ref={drag}
      className={`w-36 h-14 flex items-center justify-center rounded-xl shadow bg-white border border-purple-300 text-xl font-medium cursor-move transition-opacity ${
        isDragging ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {word}
    </div>
  );
}

function Blank({
  index,
  word,
  onDrop,
}: {
  index: number;
  word: WordItem | null;
  onDrop: (i: number, it: WordItem) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType.WORD,
    drop: (it: WordItem) => onDrop(index, it),
    collect: m => ({ isOver: !!m.isOver() }),
  }));
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.WORD,
    item: word!,
    canDrag: !!word,
    collect: m => ({ isDragging: !!m.isDragging() }),
  }));
  return (
    <span
      ref={drop}
      className={`inline-block w-32 h-10 mx-2 rounded-md border-b-2 border-purple-400 text-center ${
        isOver ? 'bg-purple-100' : 'bg-white'
      }`}
    >
      {word ? (
        <span
          ref={drag}
          className={`inline-block cursor-move ${isDragging ? 'opacity-30' : ''}`}
        >
          {word.word}
        </span>
      ) : '‎'}
    </span>
  );
}

function WordPool({
  words,
  onDropBack,
}: {
  words: WordItem[];
  onDropBack: (it: WordItem) => void;
}) {
  const [, drop] = useDrop(
    () => ({ accept: ItemType.WORD, drop: onDropBack }),
    [onDropBack]
  );
  return (
    <div ref={drop} className="flex flex-wrap justify-center gap-4 mb-8 min-h-16">
      {words.map(({ id, word }) => (
        <DraggableWord key={id} id={id} word={word} />
      ))}
    </div>
  );
}
