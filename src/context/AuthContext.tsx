"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

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
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/users/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (authToken: string, userData: User) => {
    localStorage.setItem("userToken", authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
  };

  const addToWishlist = async (productId: string) => {
    if (!token || !user) return;
    try {
      await axios.post(
        `${API_BASE}/api/users/wishlist/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUserProfile(token);
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
      await fetchUserProfile(token);
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, addToWishlist, removeFromWishlist }}
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
