import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWj9WJjEdSnW17evJHja_7LMz3zcZ1QzE",
  authDomain: "targetclasses8271.firebaseapp.com",
  projectId: "targetclasses8271",
  storageBucket: "targetclasses8271.firebasestorage.app",
  messagingSenderId: "461782042965",
  appId: "1:461782042965:web:9ae88efc518946c21907dc",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
