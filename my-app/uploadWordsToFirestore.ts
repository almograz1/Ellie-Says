import { firestore } from './src/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import words from './public/data/wordData.json'; // ✅ points to your real JSON file

async function uploadWords() {
  const wordsRef = collection(firestore, 'words');

  for (const pair of words) {
    const docId = `${pair.english}_${pair.hebrew}`.replace(/\s+/g, '_');
    await setDoc(doc(wordsRef, docId), {
      english: pair.english,
      hebrew: pair.hebrew,
    });
    console.log(`✅ Uploaded: ${pair.english} ↔ ${pair.hebrew}`);
  }

  console.log('🎉 All words uploaded to Firestore!');
}

uploadWords().catch(console.error);
