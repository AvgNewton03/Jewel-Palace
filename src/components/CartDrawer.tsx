"use client";

import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUI } from '@/context/UIContext';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen } = useUI();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-brand-bg h-full flex flex-col shadow-2xl animate-slide-in-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-gold/20 bg-white">
          <h2 className="font-serif text-xl font-medium flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-maroon" />
            Your Cart (2)
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-500 hover:text-brand-maroon hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Item 1 */}
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-400">Image</div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-gray-900 line-clamp-2 leading-snug">Kundan Polki Bridal Choker Set</h3>
                <p className="text-sm text-gray-500 mt-1">Ruby Red</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200 rounded">
                  <button className="px-2 py-1 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">-</button>
                  <span className="px-2 py-1 text-sm font-medium w-8 text-center">1</span>
                  <button className="px-2 py-1 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">+</button>
                </div>
                <span className="font-semibold text-brand-maroon">₹4,299</span>
              </div>
            </div>
          </div>
          
          {/* Item 2 */}
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
               <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-400">Image</div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-gray-900 line-clamp-2 leading-snug">Antique Gold Plated Jhumkas</h3>
                <p className="text-sm text-gray-500 mt-1">Standard</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200 rounded">
                  <button className="px-2 py-1 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">-</button>
                  <span className="px-2 py-1 text-sm font-medium w-8 text-center">1</span>
                  <button className="px-2 py-1 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">+</button>
                </div>
                <span className="font-semibold text-brand-maroon">₹1,150</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Summary */}
        <div className="p-5 border-t border-brand-gold/20 bg-white">
          <div className="space-y-3 mb-5 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">₹5,449</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-brand-emerald">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-medium text-lg text-gray-900 mt-2">
              <span>Total</span>
              <span className="text-brand-maroon">₹5,449</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/checkout" 
              className="w-full bg-brand-maroon text-white py-3.5 rounded-lg flex justify-center items-center gap-2 font-medium hover:bg-brand-maroon/90 hover:shadow-lg transition-all"
              onClick={() => setIsCartOpen(false)}
            >
              Secure Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-center text-gray-500 mt-3 pt-2">
              Taxes included. Continue to checkout to add shipping details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
