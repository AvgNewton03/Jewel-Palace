"use client";

import { X, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUI } from "@/context/UIContext";
import { useCart } from "@/context/CartContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen } = useUI();
  const { cart, removeFromCart, updateQuantity, cartTotal, itemCount } =
    useCart();
  const requireAuth = useRequireAuth();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
  };

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
            Your Cart ({itemCount})
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
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
              <ShoppingBag className="h-16 w-16 text-gray-300" />
              <p className="text-gray-500 text-lg">Your cart is empty.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 text-brand-maroon font-medium hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <Link 
                  href={`/product/${item.id}`}
                  onClick={() => setIsCartOpen(false)}
                  className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 block hover:opacity-80 transition-opacity"
                >
                  <Image
                    fill
                    src={item.imageUrl}
                    alt={item.title}
                    className="object-cover"
                  />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-2 leading-snug pr-6 relative">
                      <Link 
                        href={`/product/${item.id}`}
                        onClick={() => setIsCartOpen(false)}
                        className="hover:text-brand-maroon transition-colors"
                      >
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="absolute right-0 top-0 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-brand-maroon">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-brand-gold/20 bg-white">
            <div className="space-y-3 mb-5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-brand-emerald">
                  Calculated at Checkout
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-medium text-lg text-gray-900 mt-2">
                <span>Total</span>
                <span className="text-brand-maroon">
                  ₹{cartTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/checkout"
                onClick={handleProceedToCheckout}
                className="w-full bg-brand-maroon text-white py-3.5 rounded-lg flex justify-center items-center gap-2 font-medium hover:bg-brand-maroon/90 hover:shadow-lg transition-all"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-center text-gray-500 mt-3 pt-2">
                Complete your order securely with Razorpay.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
