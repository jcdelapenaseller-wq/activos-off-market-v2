import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Set persistence to local to ensure session is maintained after redirect
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("[AUTH_DEBUG] persistence set"))
  .catch(console.error);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export { signInWithRedirect, getRedirectResult };

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'basic' | 'pro';
  createdAt: any;
  analysisUsed?: number;
  lastAnalysisReset?: any;
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
      createdAt: serverTimestamp(),
      analysisUsed: 0,
      lastAnalysisReset: serverTimestamp()
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
  
  const data = userSnap.data() as UserProfile;
  // Initialize fields if they don't exist for old users
  if (data.analysisUsed === undefined) {
    await setDoc(userRef, { analysisUsed: 0, lastAnalysisReset: serverTimestamp() }, { merge: true });
    return { ...data, analysisUsed: 0, lastAnalysisReset: new Date() };
  }
  
  return data;
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
