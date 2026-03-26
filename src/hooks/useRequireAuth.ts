"use client";

import { useAuth } from "@/context/AuthContext";

export function useRequireAuth() {
  const { user, openAuthModal } = useAuth();

  const requireAuth = (action: () => void) => {
    if (!user) {
      openAuthModal(action); // Pass the action to be resumed after login
    } else {
      action(); // User is logged in, execute immediately
    }
  };

  return requireAuth;
}
