import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is provided
const isConfigured = !!firebaseConfig.apiKey;
export const app = isConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isConfigured ? getAuth(app!) : null;
export const db = isConfigured ? getFirestore(app!) : null;
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'basic' | 'pro';
  createdAt: any;
}

export const loginWithGoogle = async (): Promise<UserProfile> => {
  if (!auth || !db) throw new Error("Firebase no está configurado. Añade las variables de entorno VITE_FIREBASE_*");
  
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const newUser: UserProfile = {
      id: user.uid,
      email: user.email || '',
      name: user.displayName || '',
      plan: 'free',
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
  
  return userSnap.data() as UserProfile;
};

export const logout = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const updateUserPlan = async (userId: string, newPlan: 'free' | 'basic' | 'pro') => {
  if (!db) throw new Error("Firebase no está configurado.");
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { plan: newPlan }, { merge: true });
};
