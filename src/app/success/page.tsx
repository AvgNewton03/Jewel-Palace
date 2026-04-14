"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="bg-brand-bg/30 min-h-screen py-20 flex flex-col items-center justify-center">
      <div className="bg-white p-10 md:p-14 rounded-2xl shadow-sm border border-gray-100 max-w-lg text-center mx-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-serif text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been placed successfully. We'll be in touch shortly with shipping details.
        </p>
        <Link 
          href="/collections" 
          className="inline-block bg-brand-maroon text-white font-medium py-3.5 px-8 rounded-lg hover:bg-brand-maroon/90 shadow-md transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
