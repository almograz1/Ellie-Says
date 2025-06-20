'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useTheme } from '@/lib/ThemeContext';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    deleteDoc,
    doc, Timestamp,
} from 'firebase/firestore';
import { app } from '../../firebase';

interface SavedWord {
    id: string;
    english: string;
    hebrew: string;
    createdAt: Timestamp;
}

interface TriviaResult {
    score: number;
    answers: Array<{
        hebrew: string;
        correct: string;
        selected: string;
        result: 'Correct' | 'Wrong';
    }>;
    createdAt: Timestamp;
}

interface WordMatchResult {
    results: Array<{
        english: string;
        hebrew: string;
        result: 'Correct' | 'Wrong';
    }>;
    createdAt: Timestamp;
}

interface PhotoWordResult {
    summary: Array<{
        hebrew: string;
        correct: boolean;
    }>;
    createdAt: Timestamp;
}

interface UserStats {
    totalTranslations: number;
    savedWords: number;
    triviaGamesPlayed: number;
    triviaCorrectAnswers: number;
    triviaTotalAnswers: number;
    wordMatchGamesPlayed: number;
    wordMatchCorrectAnswers: number;
    wordMatchTotalAnswers: number;
    photoWordGamesPlayed: number;
    photoWordCorrectAnswers: number;
    photoWordTotalAnswers: number;
    level: number;
    totalPoints: number;
}

type TabType = 'overview' | 'words' | 'achievements';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const { theme } = useTheme();
    const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    const db = getFirestore(app);

    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Load saved words
            const savedWordsQuery = query(
                collection(db, 'saved_words'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const savedWordsSnapshot = await getDocs(savedWordsQuery);
            const words = savedWordsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SavedWord[];
            setSavedWords(words);

            // Load trivia results
            const triviaQuery = query(
                collection(db, 'trivia_results'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const triviaSnapshot = await getDocs(triviaQuery);
            const triviaResults = triviaSnapshot.docs.map(doc => doc.data()) as TriviaResult[];

            // Load word match results
            const wordMatchQuery = query(
                collection(db, 'word_match_results'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const wordMatchSnapshot = await getDocs(wordMatchQuery);
            const wordMatchResults = wordMatchSnapshot.docs.map(doc => doc.data()) as WordMatchResult[];

            // Load photo word results
            const photoWordQuery = query(
                collection(db, 'photo_word_results'),
                where('uid', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const photoWordSnapshot = await getDocs(photoWordQuery);
            const photoWordResults = photoWordSnapshot.docs.map(doc => doc.data()) as PhotoWordResult[];

            // Calculate stats
            const triviaCorrect = triviaResults.reduce((sum, result) =>
                sum + result.answers.filter(a => a.result === 'Correct').length, 0
            );
            const triviaTotal = triviaResults.reduce((sum, result) => sum + result.answers.length, 0);

            const wordMatchCorrect = wordMatchResults.reduce((sum, result) =>
                sum + result.results.filter(r => r.result === 'Correct').length, 0
            );
            const wordMatchTotal = wordMatchResults.reduce((sum, result) => sum + result.results.length, 0);

            const photoWordCorrect = photoWordResults.reduce((sum, result) =>
                sum + result.summary.filter(s => s.correct).length, 0
            );
            const photoWordTotal = photoWordResults.reduce((sum, result) => sum + result.summary.length, 0);

            const totalPoints = triviaCorrect * 10 + wordMatchCorrect * 15 + photoWordCorrect * 12 + words.length * 5;
            const level = Math.floor(totalPoints / 100) + 1;

            setStats({
                totalTranslations: words.length,
                savedWords: words.length,
                triviaGamesPlayed: triviaResults.length,
                triviaCorrectAnswers: triviaCorrect,
                triviaTotalAnswers: triviaTotal,
                wordMatchGamesPlayed: wordMatchResults.length,
                wordMatchCorrectAnswers: wordMatchCorrect,
                wordMatchTotalAnswers: wordMatchTotal,
                photoWordGamesPlayed: photoWordResults.length,
                photoWordCorrectAnswers: photoWordCorrect,
                photoWordTotalAnswers: photoWordTotal,
                level,
                totalPoints
            });

        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeWord = async (wordId: string) => {
        try {
            await deleteDoc(doc(db, 'saved_words', wordId));
            setSavedWords(prev => prev.filter(w => w.id !== wordId));
        } catch (error) {
            console.error('Error removing word:', error);
        }
    };

    const getLevelEmoji = (level: number) => {
        if (level >= 20) return '🏆';
        if (level >= 15) return '🥇';
        if (level >= 10) return '🥈';
        if (level >= 5) return '🥉';
        return '🌟';
    };

    const getEncouragementMessage = (level: number) => {
        if (level >= 20) return "You're a Hebrew Champion! 🎉";
        if (level >= 15) return "Amazing progress, superstar! ✨";
        if (level >= 10) return "You're doing great, keep it up! 🚀";
        if (level >= 5) return "Nice work, Hebrew explorer! 🗺️";
        return "Welcome to your Hebrew journey! 🌈";
    };

    if (loading || isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center
        ${theme === 'light'
                ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
                : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}
            >
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">🌟</div>
                    <div className={`text-xl font-bold ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}>
                        Loading your amazing progress...
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-4
        ${theme === 'light'
                ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
                : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}
            >
                <div className={`backdrop-blur-md rounded-2xl shadow-2xl p-8 text-center
          ${theme === 'light'
                    ? 'bg-white/90'
                    : 'bg-gray-800/90'}`}
                >
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className={`text-2xl font-bold mb-4
            ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                    >
                        Please sign in to see your profile!
                    </h2>
                    <a
                        href="/signin"
                        className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700
              text-white font-bold rounded-full shadow-lg transform hover:scale-105
              transition-all duration-200"
                    >
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6
      ${theme === 'light'
            ? 'bg-gradient-to-br from-purple-300 via-pink-200 to-yellow-200'
            : 'bg-gradient-to-br from-indigo-900 via-pink-900 to-yellow-900'}`}
        >
            <div className="max-w-6xl mx-auto">

                {/* Header with User Info */}
                <div className={`backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 text-center
          ${theme === 'light'
                    ? 'bg-white/90'
                    : 'bg-gray-800/90'}`}
                >
                    <div className="flex items-center justify-center gap-8">
                        <div className="text-8xl animate-pulse">
                            {getLevelEmoji(stats?.level || 1)}
                        </div>
                        <div>
                            <h1 className={`text-4xl font-extrabold mb-2
                ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                            >
                                Hello, {user?.displayName ?? 'Adventurer'}! 👋
                            </h1>
                            <p className={`text-xl font-medium mb-4
                ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                            >
                                {getEncouragementMessage(stats?.level || 1)}
                            </p>
                            <div className={`text-lg font-bold
                ${theme === 'light' ? 'text-purple-700' : 'text-purple-200'}`}
                            >
                                Level {stats?.level || 1} • {stats?.totalPoints || 0} Points ⭐
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-8">
                    <div className={`backdrop-blur-md rounded-2xl shadow-lg p-2 flex gap-2
            ${theme === 'light'
                        ? 'bg-white/90'
                        : 'bg-gray-800/90'}`}
                    >
                        {[
                            { id: 'overview', label: 'Overview', emoji: '📊' },
                            { id: 'words', label: 'My Words', emoji: '📚' },
                            { id: 'achievements', label: 'Achievements', emoji: '🏆' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                                        : theme === 'light'
                                            ? 'text-purple-700 hover:bg-purple-100'
                                            : 'text-purple-300 hover:bg-gray-700'
                                }`}
                            >
                                {tab.emoji} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Based on Active Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* Stats Cards */}
                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white'
                            : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">🎯</div>
                            <div className="text-3xl font-bold mb-2">{stats?.triviaGamesPlayed || 0}</div>
                            <div className="text-lg font-medium">Trivia Games Played</div>
                        </div>

                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-green-400 to-blue-400 text-white'
                            : 'bg-gradient-to-br from-green-600 to-blue-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">🎮</div>
                            <div className="text-3xl font-bold mb-2">{stats?.wordMatchGamesPlayed || 0}</div>
                            <div className="text-lg font-medium">Word Match Games</div>
                        </div>

                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-orange-400 to-red-400 text-white'
                            : 'bg-gradient-to-br from-orange-600 to-red-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">📸</div>
                            <div className="text-3xl font-bold mb-2">{stats?.photoWordGamesPlayed || 0}</div>
                            <div className="text-lg font-medium">Photo Word Games</div>
                        </div>

                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white'
                            : 'bg-gradient-to-br from-yellow-600 to-orange-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">💾</div>
                            <div className="text-3xl font-bold mb-2">{stats?.savedWords || 0}</div>
                            <div className="text-lg font-medium">Words Saved</div>
                        </div>

                        {/* Accuracy Stats */}
                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-indigo-400 to-purple-400 text-white'
                            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">📈</div>
                            <div className="text-3xl font-bold mb-2">
                                {stats?.triviaTotalAnswers ? Math.round((stats.triviaCorrectAnswers / stats.triviaTotalAnswers) * 100) : 0}%
                            </div>
                            <div className="text-lg font-medium">Trivia Accuracy</div>
                        </div>

                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-pink-400 to-red-400 text-white'
                            : 'bg-gradient-to-br from-pink-600 to-red-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">🎯</div>
                            <div className="text-3xl font-bold mb-2">
                                {stats?.wordMatchTotalAnswers ? Math.round((stats.wordMatchCorrectAnswers / stats.wordMatchTotalAnswers) * 100) : 0}%
                            </div>
                            <div className="text-lg font-medium">Word Match Accuracy</div>
                        </div>

                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-400 text-white'
                            : 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">📷</div>
                            <div className="text-3xl font-bold mb-2">
                                {stats?.photoWordTotalAnswers ? Math.round((stats.photoWordCorrectAnswers / stats.photoWordTotalAnswers) * 100) : 0}%
                            </div>
                            <div className="text-lg font-medium">Photo Word Accuracy</div>
                        </div>

                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-teal-400 to-cyan-400 text-white'
                            : 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">🔥</div>
                            <div className="text-3xl font-bold mb-2">
                                {(stats?.triviaCorrectAnswers || 0) + (stats?.wordMatchCorrectAnswers || 0) + (stats?.photoWordCorrectAnswers || 0)}
                            </div>
                            <div className="text-lg font-medium">Total Correct Answers</div>
                        </div>

                        <div className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center
              ${theme === 'light'
                            ? 'bg-gradient-to-br from-emerald-400 to-green-400 text-white'
                            : 'bg-gradient-to-br from-emerald-600 to-green-600 text-white'}`}
                        >
                            <div className="text-4xl mb-3">🎲</div>
                            <div className="text-3xl font-bold mb-2">
                                {(stats?.triviaGamesPlayed || 0) + (stats?.wordMatchGamesPlayed || 0) + (stats?.photoWordGamesPlayed || 0)}
                            </div>
                            <div className="text-lg font-medium">Total Games Played</div>
                        </div>
                    </div>
                )}

                {activeTab === 'words' && (
                    <div className={`backdrop-blur-md rounded-2xl shadow-xl p-8
            ${theme === 'light'
                        ? 'bg-white/90'
                        : 'bg-gray-800/90'}`}
                    >
                        <h2 className={`text-3xl font-bold mb-6 text-center
              ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                        >
                            📚 Your Saved Hebrew Words
                        </h2>

                        {savedWords.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📖</div>
                                <p className={`text-xl
                  ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                                >
                                    No saved words yet! Start translating to build your collection.
                                </p>
                                <a
                                    href="/translate"
                                    className="inline-block mt-4 px-6 py-3 bg-purple-600 hover:bg-purple-700
                    text-white font-bold rounded-full shadow-lg transform hover:scale-105
                    transition-all duration-200"
                                >
                                    Start Learning 🚀
                                </a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedWords.map((word) => (
                                    <div
                                        key={word.id}
                                        className={`rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200
                      ${theme === 'light'
                                            ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                                            : 'bg-gradient-to-br from-gray-700 to-gray-600'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className={`text-lg font-bold
                          ${theme === 'light' ? 'text-purple-800' : 'text-purple-200'}`}
                                                >
                                                    {word.english}
                                                </div>
                                                <div className={`text-xl font-bold
                          ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}
                                                     dir="rtl"
                                                >
                                                    {word.hebrew}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeWord(word.id)}
                                                className="text-red-500 hover:text-red-700 text-xl transition-colors duration-200"
                                                title="Remove word"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className={`text-sm opacity-75
                      ${theme === 'light' ? 'text-purple-600' : 'text-purple-300'}`}
                                        >
                                            Saved: {word.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'achievements' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Achievement Badges */}
                        {[
                            {
                                title: "First Steps",
                                description: "Played your first game!",
                                emoji: "👶",
                                unlocked: (stats?.triviaGamesPlayed || 0) + (stats?.wordMatchGamesPlayed || 0) + (stats?.photoWordGamesPlayed || 0) >= 1,
                                color: "from-green-400 to-emerald-400"
                            },
                            {
                                title: "Word Collector",
                                description: "Saved 10 Hebrew words",
                                emoji: "📚",
                                unlocked: (stats?.savedWords || 0) >= 10,
                                color: "from-blue-400 to-cyan-400"
                            },
                            {
                                title: "Trivia Master",
                                description: "Played 5 trivia games",
                                emoji: "🧠",
                                unlocked: (stats?.triviaGamesPlayed || 0) >= 5,
                                color: "from-purple-400 to-pink-400"
                            },
                            {
                                title: "Match Expert",
                                description: "Played 5 word match games",
                                emoji: "🎯",
                                unlocked: (stats?.wordMatchGamesPlayed || 0) >= 5,
                                color: "from-yellow-400 to-orange-400"
                            },
                            {
                                title: "Photo Detective",
                                description: "Played 5 photo word games",
                                emoji: "📸",
                                unlocked: (stats?.photoWordGamesPlayed || 0) >= 5,
                                color: "from-orange-400 to-red-400"
                            },
                            {
                                title: "Accuracy Star",
                                description: "90%+ accuracy in trivia",
                                emoji: "⭐",
                                unlocked: stats?.triviaTotalAnswers ? (stats.triviaCorrectAnswers / stats.triviaTotalAnswers) >= 0.9 : false,
                                color: "from-indigo-400 to-purple-400"
                            },
                            {
                                title: "Perfect Vision",
                                description: "90%+ accuracy in photo word games",
                                emoji: "👁️",
                                unlocked: stats?.photoWordTotalAnswers ? (stats.photoWordCorrectAnswers / stats.photoWordTotalAnswers) >= 0.9 : false,
                                color: "from-cyan-400 to-blue-400"
                            },
                            {
                                title: "Hebrew Hero",
                                description: "Reached Level 10",
                                emoji: "🦸",
                                unlocked: (stats?.level || 0) >= 10,
                                color: "from-red-400 to-pink-400"
                            },
                            {
                                title: "Game Master",
                                description: "Played all 3 game types",
                                emoji: "🎮",
                                unlocked: (stats?.triviaGamesPlayed || 0) >= 1 && (stats?.wordMatchGamesPlayed || 0) >= 1 && (stats?.photoWordGamesPlayed || 0) >= 1,
                                color: "from-emerald-400 to-teal-400"
                            },
                            {
                                title: "Consistency King",
                                description: "Played 20+ games total",
                                emoji: "👑",
                                unlocked: ((stats?.triviaGamesPlayed || 0) + (stats?.wordMatchGamesPlayed || 0) + (stats?.photoWordGamesPlayed || 0)) >= 20,
                                color: "from-amber-400 to-yellow-400"
                            }
                        ].map((achievement, index) => (
                            <div
                                key={index}
                                className={`backdrop-blur-md rounded-2xl shadow-xl p-6 text-center transition-all duration-300 ${
                                    achievement.unlocked
                                        ? `bg-gradient-to-br ${achievement.color} text-white transform hover:scale-105`
                                        : theme === 'light'
                                            ? 'bg-gray-200 text-gray-500'
                                            : 'bg-gray-700 text-gray-400'
                                }`}
                            >
                                <div className={`text-4xl mb-3 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                                    {achievement.emoji}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                                <p className="text-sm">{achievement.description}</p>
                                {achievement.unlocked && (
                                    <div className="mt-3 text-sm font-bold">
                                        ✅ UNLOCKED!
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}