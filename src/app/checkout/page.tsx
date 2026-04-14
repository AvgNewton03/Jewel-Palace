"use client";

import { useState, useEffect } from "react";
import { Shield, Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import api from "@/lib/axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/collections");
    }
  }, [cart, router]);

  // Update email if user logs in after mounting this page
  useEffect(() => {
    if (user?.email && !shippingInfo.email) {
      setShippingInfo(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [id]: value }));
  };

  const handlePayment = () => {
    if (cart.length === 0) return;
    
    // We require the user to be logged in before proceeding
    requireAuth(async () => {
      if (!scriptLoaded) {
        alert("Payment gateway is still loading. Please try again in a moment.");
        return;
      }
      
      setIsProcessing(true);
      try {
        const { data: orderData } = await api.post("/api/payments/order", {
          amount: cartTotal, 
          items: cart,
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Jewel Palace",
          description: "Purchase Transaction",
          order_id: orderData.id,
          handler: async function (response: any) {
            try {
              const verifyRes = await api.post("/api/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                clearCart();
                router.push("/success");
              } else {
                alert("Payment verification failed.");
              }
            } catch (error) {
              console.error("Verification error:", error);
              alert("Payment verification encountered an error.");
            }
          },
          prefill: {
            name: user?.name || `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
            email: user?.email || shippingInfo.email,
            contact: shippingInfo.phone,
          },
          theme: {
            color: "#6b1f24", // brand-maroon
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any){
           alert("Payment Failed. Reason: " + response.error.description);
        });
        rzp.open();
      } catch (error: any) {
        console.error("Order creation error:", error);
        alert(error?.response?.data?.message || "Failed to initialize payment.");
      } finally {
        setIsProcessing(false);
      }
    });
  };

  if (cart.length === 0) return null; 

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        onLoad={() => setScriptLoaded(true)} 
        strategy="lazyOnload"
      />
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
              
              {/* Shipping Info */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-xl font-medium text-gray-900 mb-6 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center text-sm font-bold">1</span>
                  Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input type="text" id="firstName" value={shippingInfo.firstName} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input type="text" id="lastName" value={shippingInfo.lastName} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input type="email" id="email" value={shippingInfo.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (For payment & updates)</label>
                    <input type="tel" id="phone" value={shippingInfo.phone} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input type="text" id="address" value={shippingInfo.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" id="city" value={shippingInfo.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input type="text" id="pincode" value={shippingInfo.pincode} onChange={handleInputChange} className="w-full border border-gray-300 rounded px-3 py-2.5 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon outline-none bg-white text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 opacity-60">
                <h2 className="text-xl font-medium text-gray-900 mb-2 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">2</span>
                  Payment Method
                </h2>
                <p className="text-sm text-gray-500 ml-8">Payment will be securely handled by Razorpay.</p>
              </div>

            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-2/5">
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-brand-maroon/20 sticky top-24">
                <h2 className="text-xl font-serif text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-200">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="flex-1 text-sm">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                        <p className="text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900 whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 py-4 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString("en-IN")}</span>
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
                      <span className="font-bold text-2xl text-brand-maroon">₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-brand-maroon text-white font-medium py-4 rounded hover:bg-brand-maroon/90 shadow-md transition-all text-lg flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {isProcessing ? "Processing..." : "Proceed to Pay"}
                </button>
                
                <div className="mt-6 bg-gray-50 rounded p-4 flex items-start gap-3 border border-gray-100">
                  <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Your information is secure. We will not share or sell your details.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
