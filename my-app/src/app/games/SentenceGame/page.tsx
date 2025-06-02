'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { app } from '../../../firebase';
import sentenceData from '@/data/sentenceData.json';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider, useDrag, useDrop } from 'react-dnd';

const ItemType = {
  WORD: 'word',
};

interface SentenceEntry {
  sentence: string;
  missingWords: string[];
  distractors: string[];
}

interface WordItem {
  id: string;
  word: string;
}

export default function SentenceGamePage() {
  const router = useRouter();
  const [entry, setEntry] = useState<SentenceEntry | null>(null);
  const [filledWords, setFilledWords] = useState<(WordItem | null)[]>([null, null, null]);
  const [words, setWords] = useState<WordItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    const limitKey = 'sentenceGameTrial';
    const playCount = Number(localStorage.getItem(limitKey) || '0');
    if (!user && playCount >= 1) {
      router.push('/games/TrialLimit');
    }
  }, []);

  useEffect(() => {
    const random = sentenceData[Math.floor(Math.random() * sentenceData.length)];
    const combined = [...random.missingWords, ...random.distractors]
      .sort(() => 0.5 - Math.random())
      .map((word, i) => ({ id: `${word}-${i}`, word }));
    setEntry(random);
    setWords(combined);
  }, []);

  const handleDrop = (index: number, item: WordItem) => {
    if (submitted) return;
    const updated = [...filledWords];
    updated[index] = item;
    setFilledWords(updated);
  };

  const checkAnswers = () => {
    if (!entry) return;
    const correct = filledWords.every((item, i) => item?.word === entry.missingWords[i]);
    setFeedback(correct ? '✅ Great job! Sentence completed correctly.' : '❌ Some words are incorrect.');
    setSubmitted(true);

    if (!user) {
      const key = 'sentenceGameTrial';
      const count = Number(localStorage.getItem(key) || '0');
      localStorage.setItem(key, (count + 1).toString());
    }
  };

  const resetGame = () => {
    window.location.reload();
  };

  if (!entry) return <div className="text-center p-4">Loading...</div>;

  const parts = entry.sentence.split('___');
  const usedIds = filledWords.filter(Boolean).map(item => item!.id);
  const availableWords = words.filter(w => !usedIds.includes(w.id));

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200">
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-2xl w-full text-purple-800">
          <h2 className="text-2xl font-bold mb-4 text-center">Complete the Sentence</h2>

          <p className="text-xl mb-6 text-center">
            {parts.map((part, idx) => (
              <span key={idx}>
                {part}
                {idx < 3 && (
                  <DropZone index={idx} word={filledWords[idx]} onDrop={handleDrop} />
                )}
              </span>
            ))}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {availableWords.map(({ id, word }) => (
              <DraggableWord key={id} id={id} word={word} />
            ))}
          </div>

          {!submitted ? (
            <button
              onClick={checkAnswers}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-xl shadow"
            >
              Submit
            </button>
          ) : (
            <div className="text-center">
              <p className="text-lg font-semibold mb-4">{feedback}</p>
              <button
                onClick={resetGame}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

function DraggableWord({ word, id }: { word: string; id: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.WORD,
    item: { id, word },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      className={`w-32 h-12 flex items-center justify-center rounded-xl shadow bg-white border border-purple-300 text-lg font-medium cursor-move transition-opacity ${isDragging ? 'opacity-30' : 'opacity-100'}`}
    >
      {word}
    </div>
  );
}

function DropZone({ index, word, onDrop }: { index: number; word: WordItem | null; onDrop: (i: number, word: WordItem) => void }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType.WORD,
    drop: (item: WordItem) => onDrop(index, item),
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  return (
    <span
      ref={drop}
      className={`inline-block w-24 h-8 mx-1 rounded-md border-b-2 border-purple-400 text-center ${isOver ? 'bg-purple-100' : 'bg-white'}`}
    >
      {word?.word || '⬜'}
    </span>
  );
}
