const { firestore } = require('./src/firebase');
const { collection, doc, setDoc } = require('firebase/firestore');
const wordData = require('./public/data/wordData.json');
const sentenceData = require('./public/data/sentenceData.json');

async function uploadWordMatch() {
  const wordMatchRef = collection(firestore, 'word_match');

  for (const pair of wordData) {
    const id = `${pair.english}_${pair.hebrew}`.replace(/\s+/g, '_');
    await setDoc(doc(wordMatchRef, id), {
      english: pair.english,
      hebrew: pair.hebrew
    });
    console.log(`🔤 Uploaded Word Match: ${pair.english} ↔ ${pair.hebrew}`);
  }
}

async function uploadSentenceGame() {
  const sentenceRef = collection(firestore, 'sentenceGame');

  for (const sentence of sentenceData) {
    const id = sentence.sentence.slice(0, 20).replace(/\s+/g, '_');
    await setDoc(doc(sentenceRef, id), {
      sentence: sentence.sentence,
      missingWords: sentence.missingWords,
      distractors: sentence.distractors
    });
    console.log(`📝 Uploaded Sentence: ${sentence.sentence}`);
  }
}

async function runAllUploads() {
  console.log('🚀 Starting game data upload...');
  await uploadWordMatch();
  await uploadSentenceGame();
  console.log('✅ All game data uploaded!');
}

runAllUploads().catch(console.error);
