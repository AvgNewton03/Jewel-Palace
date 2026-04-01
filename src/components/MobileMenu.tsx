"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';

export default function MobileMenu() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useUI();
  const { user, firebaseUser, openAuthModal } = useAuth();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] lg:hidden">
      {/* Overlay Background */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={() => setIsMobileMenuOpen(false)} 
        aria-hidden="true"
      />
      
      {/* Sliding Menu Panel */}
      <div className="fixed top-0 left-0 w-4/5 max-w-sm h-full bg-brand-bg shadow-2xl flex flex-col pt-5 pb-6 overflow-y-auto translate-x-0 transition-transform duration-300">
        <div className="px-4 flex items-center justify-between mb-8">
          <Link href="/" className="font-serif text-xl font-bold text-brand-maroon" onClick={() => setIsMobileMenuOpen(false)}>
            Jewel Palace
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="px-2 space-y-1">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md">Home</Link>
          <Link href="/collections" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md">All Collections</Link>
          <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md">Gallery</Link>
          <Link href="/collections?type=wedding" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md">Wedding</Link>
          <Link href="/collections?type=casual" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md">Casual</Link>
          <Link href="/store" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md">Store</Link>
          <div className="pt-4 mt-2 border-t border-gray-100">
            {(user || firebaseUser) ? (
              <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md">My Account</Link>
            ) : (
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal();
                }} 
                className="w-full text-left block px-4 py-3 text-base font-medium text-gray-900 hover:bg-brand-maroon/5 hover:text-brand-maroon rounded-md"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
