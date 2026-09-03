"use client";

import { useState, useEffect } from "react";
import { Shield, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import api from "@/lib/axios";
import ShippingAddressForm, {
  ConsolidatedShippingPayload,
} from "@/components/ShippingAddressForm";

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
  const [isAddressValid, setIsAddressValid] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/collections");
    }
  }, [cart, router]);

  const handleShippingSubmit = (consolidated: ConsolidatedShippingPayload) => {
    if (cart.length === 0) return;

    // Require authentication before initiating payment
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
          billing_customer_name: consolidated.billing_customer_name,
          billing_last_name: consolidated.billing_last_name,
          billing_address: consolidated.billing_address,
          billing_address_2: consolidated.billing_address_2,
          billing_city: consolidated.billing_city,
          billing_state: consolidated.billing_state,
          billing_pincode: consolidated.billing_pincode,
          billing_email: consolidated.billing_email,
          billing_phone: consolidated.billing_phone,
          shippingAddress: consolidated.shippingAddress,
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
            name: consolidated.billing_customer_name,
            email: consolidated.billing_email,
            contact: consolidated.billing_phone,
          },
          theme: {
            color: "#6b1f24", // brand-maroon
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
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
      <div className="min-h-screen py-10 md:py-16 bg-[#faf8f5] dark:bg-[#0f0a08] text-stone-900 dark:text-stone-100 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-wide">
              Checkout
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Column - Shipping Information & Payment Method */}
            <div className="lg:w-3/5 space-y-8">
              {/* Shipping Address Form */}
              <ShippingAddressForm
                formId="shipping-address-form"
                initialValues={{
                  firstName: user?.name ? user.name.split(" ")[0] : "",
                  lastName: user?.name ? user.name.split(" ").slice(1).join(" ") : "",
                  email: user?.email || "",
                }}
                onSubmit={handleShippingSubmit}
                isLoading={isProcessing}
                showSubmitButton={false}
                onValidationChange={setIsAddressValid}
              />

              {/* Payment Step Indicator */}
              <div className="bg-white dark:bg-[#1a120e] border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl p-6 md:p-8 opacity-85 transition-colors">
                <h2 className="text-xl font-serif font-medium text-stone-800 dark:text-stone-200 mb-2 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  Payment Method
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 ml-8">
                  Payment will be processed securely via Razorpay (UPI, Cards, NetBanking, Wallets).
                </p>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-2/5">
              <div className="bg-white dark:bg-[#1a120e] border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl p-6 md:p-8 sticky top-24 transition-colors">
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6 max-h-[350px] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-stone-100 dark:bg-stone-800 overflow-hidden relative flex-shrink-0 border border-stone-200 dark:border-stone-700">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 text-sm">
                        <h3 className="font-medium text-stone-900 dark:text-stone-100 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-stone-900 dark:text-stone-100 whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 dark:border-stone-800/80 py-4 space-y-3 text-sm">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-stone-900 dark:text-stone-100">
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Shipping</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free Delivery</span>
                  </div>
                </div>

                <div className="border-t border-stone-200 dark:border-stone-700 pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-medium text-stone-900 dark:text-stone-100 text-lg">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-xs text-stone-500 dark:text-stone-400 block">INR</span>
                      <span className="font-bold text-2xl text-stone-900 dark:text-amber-300 font-serif">
                        ₹{cartTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Single Primary Action Button: Proceed to Pay */}
                <button
                  type="submit"
                  form="shipping-address-form"
                  disabled={!isAddressValid || isProcessing}
                  className={`w-full font-medium py-4 rounded-xl transition-all text-base flex justify-center items-center gap-2 ${
                    !isAddressValid
                      ? "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed shadow-none"
                      : "bg-[#6b1414] hover:bg-[#801818] text-white shadow-md cursor-pointer active:scale-[0.99]"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Proceed to Pay</span>
                  )}
                </button>
                {!isAddressValid && (
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center mt-2.5">
                    Please complete all required address fields to proceed to payment
                  </p>
                )}

                <div className="mt-6 bg-stone-50 dark:bg-[#241a14] rounded-xl p-4 flex items-start gap-3 border border-stone-200 dark:border-stone-800">
                  <Shield className="h-5 w-5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                    Automated Shiprocket tracking & transit insurance enabled. Your details are
                    end-to-end encrypted.
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
