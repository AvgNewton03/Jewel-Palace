"use client";
import React, { createContext, useContext, useState } from 'react';

type UIContextType = {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <UIContext.Provider value={{ isCartOpen, setIsCartOpen, isMobileMenuOpen, setIsMobileMenuOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
