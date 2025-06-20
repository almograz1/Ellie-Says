// firebaseService.ts

import { firestore } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * QuizAnswers interface defines the structure of answers submitted by the user.
 * The key is the question ID, and the value is the selected answer.
 */
export interface QuizAnswers {
  [questionId: string]: string;
}

/**
 * UserProfile represents a registered user.
 */
export interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  createdAt: string;
  verified: boolean;
}

/**
 * Save a user's quiz answers to Firestore.
 * This creates a document under the "answers" collection with ID "userId_quizId"
 */
export async function saveAnswers(
  userId: string,
  quizId: string,
  answers: QuizAnswers
): Promise<void> {
  const docRef = doc(firestore, 'answers', `${userId}_${quizId}`); 
  await setDoc(docRef, {
    userId,
    quizId,
    answers,
    timestamp: new Date(),
  });
}

/**
 * Get previously submitted answers for a given user and quiz.
 * Returns the "answers" field from the document if it exists.
 */
export async function getAnswers(
  userId: string,
  quizId: string
): Promise<QuizAnswers | null> {
  const docRef = doc(firestore, 'answers', `${userId}_${quizId}`);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return snapshot.data().answers as QuizAnswers;
}

/**
 * Register a new user profile in the "users" collection.
 * Only needs to be called once per user after signup.
 */
export async function registerUser(user: UserProfile): Promise<void> {
  const docRef = doc(firestore, 'users', user.userId);
  await setDoc(docRef, user);
}

/**
 * Get a user's profile by ID (e.g., after login)
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const docRef = doc(firestore, 'users', userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

/**
 * PhotoWordSummary represents one round's outcome in the PhotoWord game.
 */
export interface PhotoWordSummary {
  imageUrl: string;
  hebrew: string;
  correct: boolean;
}

/**
 * Save photo-word game session summary to Firestore.
 * Logs the payload before writing to help debug nested-entity errors.
 */
export async function savePhotoWordResults(
  userId: string,
  summary: PhotoWordSummary[]
): Promise<void> {
  const docRef = doc(firestore, 'photo_word_results', `${userId}_photoWord`);
  console.log('[firebaseService] writing to', docRef.path, 'payload:', summary);
  await setDoc(docRef, {
    userId,
    summary,
    createdAt: serverTimestamp(),
  });
  console.log('[firebaseService] write complete');
}
