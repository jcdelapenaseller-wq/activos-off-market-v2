import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, logout, updateUserPlan, UserProfile } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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
    if (!auth) {
      const storedMock = localStorage.getItem('mockUser');
      if (storedMock) {
        try {
          setUser(JSON.parse(storedMock));
        } catch (e) {
          console.error("Error parsing mock user", e);
        }
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && db) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            let userData = userSnap.data() as UserProfile;
            userData = await checkMonthlyReset(userData);
            setUser(userData);
          } else {
            // Fallback if document doesn't exist yet but auth does
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              plan: 'free',
              createdAt: new Date(),
              analysisUsed: 0
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (): Promise<UserProfile> => {
    if (!auth) {
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
      console.error("Error incrementing analysis count:", error);
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
      console.error("Error tracking auction view:", error);
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
    // Placeholder for future route protection
    // e.g. navigate('/login')
    console.log("requireLogin: User must be logged in to access this feature.");
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
