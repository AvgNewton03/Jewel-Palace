"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import axios from "axios";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  wishlist: string[];
  addresses: any[];
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  // Auth Modal State
  isAuthModalOpen: boolean;
  openAuthModal: (action?: () => void) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Extend Window interface for ReCaptcha
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and Action state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
          // Sync with our MongoDB backend
          await syncWithBackend(idToken);
          
          // Resume any pending action after successful auth
          if (pendingActionRef.current) {
            const action = pendingActionRef.current;
            pendingActionRef.current = null;
            setTimeout(() => action(), 0); // Execute immediately after state processes
          }
          
        } catch (error) {
          console.error("Failed to sync user with backend", error);
        }
      } else {
        setToken(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const syncWithBackend = async (authToken: string) => {
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/users/sync`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setUser(data);
    } catch (error) {
      console.error("Failed to sync user profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!token || !user) return;
    try {
      await axios.post(
        `${API_BASE}/api/users/wishlist/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUserProfile();
    } catch (error) {
      console.error("Failed to add to wishlist", error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!token || !user) return;
    try {
      await axios.delete(
        `${API_BASE}/api/users/wishlist/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUserProfile();
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
    }
  };

  const openAuthModal = useCallback((action?: () => void) => {
    if (action) {
      pendingActionRef.current = action;
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    // Optionally clear pending action if modal is closed manually?
    // Let's keep it cleared so we don't unexpectedly trigger it later
    pendingActionRef.current = null;
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        firebaseUser, 
        token, 
        isLoading, 
        logout, 
        addToWishlist, 
        removeFromWishlist,
        refreshUserProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
