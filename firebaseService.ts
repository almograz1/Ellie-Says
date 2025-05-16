// firebaseService.ts
import { firestore } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
    const docRef = doc(firestore, 'answers', `${userId}_${quizId}`); // Reference to a document like answers/user123_quiz1
    await setDoc(docRef, {
        userId,
        quizId,
        answers,
        timestamp: new Date(), // Optional: for sorting or tracking submission time
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
    const docRef = doc(firestore, 'users', user.userId); // Creates users/userId document
    await setDoc(docRef, user);
}

/**
 * Get a user's profile by ID (e.g., after login)
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(firestore, 'users', userId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as UserProfile;
}
