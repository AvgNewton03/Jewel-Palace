import Link from "next/link";
import { XCircle, MessageCircle, RefreshCw } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Failed | Jewel Palace",
  description: "Your payment was unsuccessful. Please try again or contact support.",
};

export default function PaymentFailedPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl flex-1 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white p-8 md:p-12 shadow-md border border-brand-maroon/10 rounded-2xl text-center relative overflow-hidden w-full">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-50 to-transparent -z-10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-brand-gold/10 to-transparent -z-10 rounded-tr-full"></div>

        <div className="mx-auto w-20 h-20 bg-red-50 text-brand-maroon rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <XCircle className="w-10 h-10" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl md:text-4xl font-serif text-brand-maroon mb-4">
          Payment Unsuccessful
        </h1>
        
        <div className="h-1 w-16 bg-brand-gold mx-auto rounded-full mb-6"></div>

        <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-lg mx-auto">
          We couldn't process your payment at this time. Don't worry, if any amount was deducted from your account, it will be automatically refunded within 3-5 business days.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/checkout"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-maroon text-brand-bg px-8 py-3 rounded-full hover:bg-brand-maroon/90 transition-all font-medium border border-transparent shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>

          <a
            href="https://wa.me/919029923215?text=Hi%20Jewel%20Palace,%20I%20am%20facing%20an%20issue%20with%20my%20payment."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent text-brand-maroon px-8 py-3 rounded-full hover:bg-brand-maroon/5 transition-all font-medium border border-brand-maroon/30 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-brand-gold" />
            Contact Support
          </a>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Error Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">PAYMENT_DECLINED</span></p>
        </div>
      </div>
    </div>
  );
}
