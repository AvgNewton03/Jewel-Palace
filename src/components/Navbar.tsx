"use client";

import Link from 'next/link';
import { ShoppingBag, Search, Menu, User, X } from 'lucide-react';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { isMobileMenuOpen, setIsMobileMenuOpen, setIsCartOpen } = useUI();
  const { itemCount } = useCart();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-bg/90 backdrop-blur-md border-b border-brand-gold/20 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-900 hover:text-brand-maroon transition-colors p-2 -ml-2"
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center flex-1 lg:flex-none">
            <Link href="/" className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-brand-maroon flex items-center gap-2">
              <span className="text-brand-gold text-3xl hidden sm:inline-block">✧</span>
              Jewel Palace
              <span className="text-brand-gold text-3xl hidden sm:inline-block">✧</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex sm:space-x-8 items-center justify-center flex-1">
            <Link href="/" className="text-gray-900 hover:text-brand-maroon px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-brand-maroon">Home</Link>
            <Link href="/collections" className="text-gray-900 hover:text-brand-maroon px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-brand-maroon">Collections</Link>
            <Link href="/gallery" className="text-gray-900 hover:text-brand-maroon px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-brand-maroon">Gallery</Link>
            <Link href="/collections?type=wedding" className="text-gray-900 hover:text-brand-maroon px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-brand-maroon">Wedding</Link>
            <Link href="/collections?type=casual" className="text-gray-900 hover:text-brand-maroon px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-brand-maroon">Casual</Link>
            <Link href="/store" className="text-gray-900 hover:text-brand-maroon px-3 py-2 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-brand-maroon">Store</Link>
          </div>

          {/* User & Cart Icons */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            <Link href="/collections" className="text-gray-900 hover:text-brand-maroon transition-colors p-2 hidden sm:block">
              <span className="sr-only">Search</span>
              <Search className="h-5 w-5" />
            </Link>
            <Link href={user ? "/account" : "/login"} className="text-gray-900 hover:text-brand-maroon transition-colors p-2 hidden sm:block">
              <span className="sr-only">Account</span>
              <User className={`h-5 w-5 ${user ? "fill-brand-maroon text-brand-maroon" : ""}`} />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-gray-900 hover:text-brand-maroon transition-colors p-2 relative"
            >
              <span className="sr-only">Cart</span>
              <ShoppingBag className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-maroon text-brand-bg text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

    </nav>
  );
}
