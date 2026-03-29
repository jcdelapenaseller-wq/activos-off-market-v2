import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, loginWithGoogle, logout, updateUserPlan, UserProfile } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && db) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser(userSnap.data() as UserProfile);
          } else {
            // Fallback if document doesn't exist yet but auth does
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              plan: 'free',
              createdAt: new Date()
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
    try {
      const profile = await loginWithGoogle();
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isBasicUser = () => {
    return user?.plan === 'basic' || user?.plan === 'pro';
  };

  const isProUser = () => {
    return user?.plan === 'pro';
  };

  const updatePlan = async (newPlan: 'free' | 'basic' | 'pro', targetUserId?: string) => {
    const idToUpdate = targetUserId || user?.id;
    if (!idToUpdate) return;
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
    plan: user?.plan || 'free',
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    isBasicUser,
    isProUser,
    updatePlan,
    requireLogin
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
