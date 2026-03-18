import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCRrD-U5onfidbVfozt5fwR7U7wKqcqacc",
  authDomain: "yarukoto-b9868.firebaseapp.com",
  projectId: "yarukoto-b9868",
  storageBucket: "yarukoto-b9868.firebasestorage.app",
  messagingSenderId: "979695084943",
  appId: "1:979695084943:web:9ffad8a9fd500fdb3917fa",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
