import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
    import { auth } from '../firebase';
    import { registerUser } from '../firebaseService';
    import { UserProfile } from '../firebaseService';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async () => {
        try {
            // Step 1: Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Step 2: Create profile object
            const userProfile: UserProfile = {
                userId: user.uid,
                email: user.email || '',
                displayName: displayName,
                createdAt: new Date().toISOString(),
            };

            // Step 3: Save profile to Firestore
            await registerUser(userProfile);

            alert('User registered successfully!');
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Register</h2>
            <input
                type="text"
                placeholder="Display Name"
                className="border p-2 w-full mb-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                className="border p-2 w-full mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="border p-2 w-full mb-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                onClick={handleRegister}
                className="bg-blue-500 text-white p-2 w-full rounded"
            >
                Register
            </button>
            {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
    );
}
