import { CheckCircle2, Shield, Lock } from "lucide-react";
import Image from "next/image";

export default function CheckoutPage() {
  return (
    <div className="bg-brand-bg/30 min-h-screen py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Secure Checkout</h1>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> SSL Encrypted Connection
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column - Forms */}
          <div className="lg:w-3/5 space-y-8">
            
            {/* Express Checkout */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Express Checkout</h2>
              <button className="w-full bg-[#25D366] text-white font-medium py-3 rounded hover:bg-[#128C7E] transition-colors flex justify-center items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.944 6.556L.167 24l5.667-1.667A11.944 11.944 0 0 0 12 24a12 12 0 0 0 12-12 12 12 0 0 0-12-12zm.056 20.167a9.89 9.89 0 0 1-5.056-1.389l-.333-.167-3.778 1.111 1.111-3.667-.222-.389A9.833 9.833 0 0 1 2.167 12a9.833 9.833 0 0 1 9.833-9.833A9.833 9.833 0 0 1 21.833 12a9.833 9.833 0 0 1-9.833 8.167zm5.333-7.222c-.278-.167-1.667-.833-1.944-.889-.222-.056-.444-.111-.611.167-.167.278-.722.889-.889 1.111-.167.167-.333.222-.611.056-.278-.111-1.167-.444-2.222-1.389-.778-.722-1.333-1.611-1.5-1.889-.167-.278 0-.444.111-.556.111-.111.278-.333.389-.5.111-.167.167-.278.222-.444.056-.222 0-.389-.056-.5-.056-.111-.611-1.5-.833-2.056-.222-.556-.444-.444-.611-.444H6.222c-.222 0-.556.111-.833.389-.278.278-1.056 1.056-1.056 2.556 0 1.5 1.111 2.944 1.278 3.167.167.222 2.167 3.333 5.278 4.611 1.833.778 2.611.889 3.5.833 1.056-.056 3.111-1.278 3.556-2.5.444-1.222.444-2.278.333-2.5-.167-.278-.389-.389-.667-.5z"></path></svg>
                Checkout with WhatsApp
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue as guest</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-medium text-gray-900 mb-6 font-serif flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center text-sm font-bold">1</span>
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" id="first-name" className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" id="last-name" className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" id="email" className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (For shipping updates)</label>
                  <input type="tel" id="phone" className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input type="text" id="address" className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" id="city" className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                  <input type="text" id="pincode" className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 opacity-60">
              <h2 className="text-xl font-medium text-gray-900 mb-2 font-serif flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</span>
                Payment Method
              </h2>
              <p className="text-sm text-gray-500 ml-8">Complete shipping step to unlock payment options.</p>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-2/5">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-brand-maroon/20 sticky top-24">
              <h2 className="text-xl font-serif text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {/* Item */}
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-200">
                    <Image src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=200" alt="Product" fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <h3 className="font-medium text-gray-900 line-clamp-1">Kundan Polki Bridal Choker</h3>
                    <p className="text-gray-500 mt-0.5">Qty: 1</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">₹4,299</div>
                </div>
              </div>

              <div className="border-t border-gray-100 py-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹4,299</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-brand-emerald font-medium">Free</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-medium text-gray-900 text-lg">Total</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 block">INR</span>
                    <span className="font-bold text-2xl text-brand-maroon">₹4,299</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-brand-maroon text-white font-medium py-4 rounded hover:bg-brand-maroon/90 shadow-md transition-all text-lg flex justify-center items-center gap-2">
                Continue to Payment
              </button>
              
              <div className="mt-6 bg-gray-50 rounded p-4 flex items-start gap-3 border border-gray-100">
                <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your information is secure. We will not share or sell your details. Need help? <a href="#" className="text-brand-maroon underline">Contact Support</a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
