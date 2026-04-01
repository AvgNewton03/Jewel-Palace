"use client";

import { useAuth } from "@/context/AuthContext";

export function useRequireAuth() {
  const { user, firebaseUser, openAuthModal } = useAuth();

  const requireAuth = (action: () => void) => {
    if (!user && !firebaseUser) {
      openAuthModal(action); // Pass the action to be resumed after login
    } else {
      action(); // User is logged in, execute immediately
    }
  };

  return requireAuth;
}
