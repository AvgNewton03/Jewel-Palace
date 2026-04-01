"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import axios from "axios";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from "firebase/auth";
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

// Define API_BASE outside the component so it's globally available
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal and Action state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Wrapped in useCallback to prevent React hydration/dependency issues
  const syncWithBackend = useCallback(async (authToken?: string) => {
    try {
      const currentToken = authToken || localStorage.getItem("token");

      if (!currentToken) {
        return;
      }

      // CHANGED: axios.get is now axios.post, and we added {} as the empty body
      const response = await axios.post(
        `${API_BASE}/api/users/sync`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        },
      );

      // Update the user state with data from the backend!
      if (response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 401) {
          console.warn("User is not authenticated yet.");
        } else if (error.response.status === 404) {
          console.warn("⚠️ Backend route /api/users/sync not found (404).");
        } else {
          console.error(`Backend error (${error.response.status}):`, error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        // Enforce email verification for password users
        const isPasswordUser = currentUser.providerData.some(
          (p) => p.providerId === "password",
        );
        if (isPasswordUser && !currentUser.emailVerified) {
          await signOut(auth); // block unverified login
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          setIsLoading(false);
          return;
        }

        try {
          const idToken = await currentUser.getIdToken();
          setToken(idToken);
          localStorage.setItem("token", idToken); // Sync to localStorage

          // Sync with our MongoDB backend
          await syncWithBackend(idToken);

          // Resume any pending action after successful auth
          if (pendingActionRef.current) {
            const action = pendingActionRef.current;
            pendingActionRef.current = null;
            setTimeout(() => action(), 0);
          }
        } catch (error) {
          console.error("Failed to sync user with backend", error);
        } finally {
          setIsLoading(false);
          // Force a fallback user if backend sync failed (e.g. CORS or network error)
          setUser((prev) => {
            if (!prev && currentUser) {
              let localWishlist: string[] = [];
              try {
                const stored = localStorage.getItem(
                  `wishlist_${currentUser.uid}`,
                );
                if (stored) localWishlist = JSON.parse(stored);
              } catch (e) {}

              return {
                _id: currentUser.uid,
                name: currentUser.displayName || "User",
                email: currentUser.email || "",
                role: "customer",
                wishlist: localWishlist,
                addresses: [],
              };
            }
            return prev;
          });
        }
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token"); // Clear stale tokens
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncWithBackend]);

  const refreshUserProfile = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(`${API_BASE}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data) {
        setUser(data);
        if (firebaseUser) {
          const ids = data.wishlist.map((item: any) =>
            typeof item === "string" ? item : item._id,
          );
          localStorage.setItem(
            `wishlist_${firebaseUser.uid}`,
            JSON.stringify(ids),
          );
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const addToWishlist = async (productId: string) => {
    // 1. Get the most recent token directly from storage to avoid "stale" state
    let activeToken = localStorage.getItem("token");
    if (auth.currentUser) {
      activeToken = await auth.currentUser.getIdToken();
    }
    
    if (!activeToken || !user) {
      console.error("No active session found");
      return;
    }

    // Save the previous state in case we need to roll back
    const previousWishlist = [...user.wishlist];

    // 2. Optimistic UI update
    setUser((prev) => {
      if (!prev || prev.wishlist.includes(productId)) return prev;
      const newWishlist = [...prev.wishlist, productId];
      return { ...prev, wishlist: newWishlist };
    });

    try {
      // 3. Ensure the URL matches your backend requirements.
      // If your backend wants the user ID in the URL, use user._id or user.uid
      await axios.post(
        `${API_BASE}/api/users/wishlist/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      await refreshUserProfile();
    } catch (error) {
      console.error("Failed to add to wishlist", error);

      // 4. Rollback: If the server call fails, remove the item from UI
      setUser((prev) =>
        prev ? { ...prev, wishlist: previousWishlist } : prev,
      );

      // Alert the user so they know it didn't save
      alert("Session expired. Please log in again.");
    }
  };
  const removeFromWishlist = async (productId: string) => {
    let activeToken = localStorage.getItem("token");
    if (auth.currentUser) {
      activeToken = await auth.currentUser.getIdToken();
    }
    
    if (!activeToken || !user) {
      console.error("No active session found");
      return;
    }

    // Optimistic UI update
    setUser((prev) => {
      if (!prev) return prev;
      const newWishlist = prev.wishlist.filter(
        (id: any) => (typeof id === "string" ? id : id._id) !== productId,
      );
      if (firebaseUser) {
        const ids = newWishlist.map((id: any) =>
          typeof id === "string" ? id : id._id,
        );
        localStorage.setItem(
          `wishlist_${firebaseUser.uid}`,
          JSON.stringify(ids),
        );
      }
      return { ...prev, wishlist: newWishlist };
    });

    try {
      await axios.delete(`${API_BASE}/api/users/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      await refreshUserProfile();
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
      // We could revert the optimistic update here if desired
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
        closeAuthModal,
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
