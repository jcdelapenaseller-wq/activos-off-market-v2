import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, logout, updateUserPlan, UserProfile } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface UserContextType {
  user: UserProfile | null;
  isLogged: boolean;
  plan: 'free' | 'basic' | 'pro';
  isLoading: boolean;
  login: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  isBasicUser: () => boolean;
  isProUser: () => boolean;
  updatePlan: (newPlan: 'free' | 'basic' | 'pro', targetUserId?: string) => Promise<void>;
  requireLogin: () => void;
  incrementAnalysisCount: () => Promise<boolean>;
  trackAuctionView: (auctionId: string, auctionTitle: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isDev = import.meta.env.DEV || (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');

  const checkMonthlyReset = async (userData: UserProfile) => {
    if (!db || userData.plan !== 'basic') return userData;
    
    const lastReset = userData.lastAnalysisReset?.toDate ? userData.lastAnalysisReset.toDate() : new Date(userData.lastAnalysisReset);
    const now = new Date();
    
    // If more than 30 days or different month
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      const userRef = doc(db, 'users', userData.id);
      await setDoc(userRef, { analysisUsed: 0, lastAnalysisReset: serverTimestamp() }, { merge: true });
      return { ...userData, analysisUsed: 0, lastAnalysisReset: now };
    }
    return userData;
  };

  useEffect(() => {
    // Validate connection to Firestore
    const testConnection = async () => {
      if (!db) return;
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    };
    testConnection();

    if (!auth) {
      if (isDev) {
        const storedMock = localStorage.getItem('mockUser');
        if (storedMock) {
          try {
            setUser(JSON.parse(storedMock));
          } catch (e) {
            console.error("Error parsing mock user", e);
          }
        }
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[AUTH_DEBUG] auth state", firebaseUser?.uid);
      console.log("[AUTH_DEBUG] 1. onAuthStateChanged fired. firebaseUser:", firebaseUser?.uid || 'null');
      if (firebaseUser && db) {
        try {
          console.log("[AUTH_DEBUG] 2. Fetching profile for:", firebaseUser.uid);
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            console.log("[AUTH_DEBUG] 3. Profile found in Firestore");
            let userData = userSnap.data() as UserProfile;
            userData = await checkMonthlyReset(userData);
            console.log("[AUTH_DEBUG] 4. Calling setUser(userData)");
            setUser(userData);
          } else {
            console.log("[AUTH_DEBUG] 3. Profile NOT found in Firestore, using fallback");
            const fallbackUser: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              plan: 'free',
              createdAt: new Date(),
              analysisUsed: 0
            };
            console.log("[AUTH_DEBUG] 4. Calling setUser(fallbackUser)");
            setUser(fallbackUser);
          }
        } catch (error) {
          console.error("[AUTH_DEBUG] Error fetching profile:", error);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        console.log("[AUTH_DEBUG] 2. No firebaseUser or no db, calling setUser(null)");
        setUser(null);
      }
      console.log("[AUTH_DEBUG] 5. Calling setIsLoading(false)");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (): Promise<UserProfile> => {
    if (!auth) {
      if (isDev) {
        const mockUser: UserProfile = {
          id: "mock-user",
          email: "demo@activosoffmarket.es",
          name: "Usuario demo",
          plan: "free",
          createdAt: new Date(),
          analysisUsed: 0
        };
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      } else {
        // En producción, si no hay Firebase, intentamos login real (que fallará con error descriptivo)
        return await loginWithGoogle();
      }
    }

    try {
      let profile = await loginWithGoogle();
      profile = await checkMonthlyReset(profile);
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const incrementAnalysisCount = async (): Promise<boolean> => {
    if (!user) return false;
    
    const currentPlan = user.plan.toLowerCase() as 'free' | 'basic' | 'pro';
    const used = user.analysisUsed || 0;
    
    // Check limits
    if (currentPlan === 'free' && used >= 1) return false;
    if (currentPlan === 'basic' && used >= 5) return false;
    if (currentPlan === 'pro') {
      // Pro is unlimited, but we still track for analytics if needed
    }

    const newCount = used + 1;

    if (!auth || !db) {
      if (user.id === 'mock-user') {
        const updatedUser = { ...user, analysisUsed: newCount };
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return true;
      }
      return false;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, { analysisUsed: newCount }, { merge: true });
      setUser(prev => prev ? { ...prev, analysisUsed: newCount } : null);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}`);
      return false;
    }
  };

  const trackAuctionView = async (auctionId: string, auctionTitle: string) => {
    if (!user) return;
    if (!auth || !db) {
      console.log("Mock tracking view:", auctionId, auctionTitle);
      return;
    }

    try {
      const historyRef = doc(db, 'users', user.id, 'viewHistory', auctionId);
      await setDoc(historyRef, {
        auctionId,
        title: auctionTitle,
        viewedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.id}/viewHistory/${auctionId}`);
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      localStorage.removeItem("mockUser");
      setUser(null);
      return;
    }

    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isBasicUser = () => {
    const currentPlan = user?.plan?.toLowerCase();
    return currentPlan === 'basic' || currentPlan === 'pro';
  };

  const isProUser = () => {
    return user?.plan?.toLowerCase() === 'pro';
  };

  const updatePlan = async (newPlan: 'free' | 'basic' | 'pro', targetUserId?: string) => {
    const idToUpdate = targetUserId || user?.id;
    if (!idToUpdate) return;

    if (!auth) {
      if (user && user.id === 'mock-user') {
        const updatedUser = { ...user, plan: newPlan };
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return;
    }

    try {
      await updateUserPlan(idToUpdate, newPlan);
      setUser(prev => prev ? { ...prev, plan: newPlan } : null);
    } catch (error) {
      console.error("Error updating plan:", error);
      throw error;
    }
  };

  const requireLogin = () => {
    if (!isLoading && !user) {
      navigate(ROUTES.LOGIN);
    }
  };

  const value = {
    user,
    isLogged: !!user,
    plan: (user?.plan?.toLowerCase() as 'free' | 'basic' | 'pro') || 'free',
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    isBasicUser,
    isProUser,
    updatePlan,
    requireLogin,
    incrementAnalysisCount,
    trackAuctionView
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
