import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-jynNNK1jsgYl6VGLgOT6RhapMNYXBYs",
  authDomain: "ellie-says.firebaseapp.com",
  projectId: "ellie-says",
  storageBucket: "ellie-says.firebasestorage.app",
  messagingSenderId: "454771034135",
  appId: "1:454771034135:web:7f056108bedcc36b82f452"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);


export { app };
