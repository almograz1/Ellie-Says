import { firestore } from './src/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import words from './public/data/wordData.json'; // includes sentence + emoji

async function uploadWords() {
  const wordsRef = collection(firestore, 'trivia_words'); // FIXED: correct collection

  for (const pair of words) {
    const docId = `${pair.english}_${pair.hebrew}`.replace(/\s+/g, '_');
    await setDoc(doc(wordsRef, docId), {
      english: pair.english,
      hebrew: pair.hebrew,
      sentence: pair.sentence, // ✅ Add sentence
      emoji: pair.emoji        // ✅ Add emoji
    });
    console.log(`✅ Uploaded: ${pair.english} ↔ ${pair.hebrew}`);
  }

  console.log('🎉 All trivia words uploaded to Firestore!');
}

uploadWords().catch(console.error);
