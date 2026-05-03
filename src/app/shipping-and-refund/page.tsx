import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Refund Policy | Jewel Palace",
  description: "Shipping and Refund Policy for Jewel Palace e-commerce store.",
};

export default function ShippingAndRefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-maroon mb-4">Shipping & Refund Policy</h1>
        <div className="h-1 w-24 bg-brand-gold mx-auto rounded-full"></div>
      </div>
      
      <div className="bg-white p-8 md:p-12 shadow-sm border border-brand-gold/20 rounded-xl text-gray-800 leading-relaxed space-y-12 relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-gold/10 to-transparent -z-10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-brand-gold/10 to-transparent -z-10 rounded-tr-full"></div>
        
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-brand-bg rounded-full border border-brand-gold/30 shadow-sm">
              <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <h2 className="text-3xl font-serif text-brand-maroon m-0">Shipping Policy</h2>
          </div>
          <div className="space-y-4 text-gray-700 ml-2 md:ml-16 border-l-2 border-brand-gold/20 pl-6 py-2">
            <p className="text-lg">At <strong>Jewel Palace</strong>, we ensure that your luxury imitation jewellery reaches you safely and promptly.</p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Delivery Area:</strong> We offer standard delivery across India.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Processing Time:</strong> Orders are processed within 24-48 hours of confirmation.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Delivery Time:</strong> Standard delivery takes <strong className="text-brand-maroon">5-7 business days</strong> across India.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Tracking:</strong> Once your order is dispatched, you will receive a tracking link via email or SMS.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent my-8"></div>

        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-brand-bg rounded-full border border-brand-gold/30 shadow-sm">
              <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
            </div>
            <h2 className="text-3xl font-serif text-brand-maroon m-0">Refund & Return Policy</h2>
          </div>
          <div className="space-y-4 text-gray-700 ml-2 md:ml-16 border-l-2 border-brand-gold/20 pl-6 py-2">
            <p className="text-lg">We take utmost care in packaging our products to ensure they arrive in pristine condition. However, if you receive a damaged item, we are here to help.</p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Return Window:</strong> We offer a strict <strong className="text-brand-maroon">7-day return policy</strong> from the date of delivery.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Eligibility:</strong> Returns are accepted <strong className="text-brand-maroon border-b border-brand-maroon/30">for damaged items only</strong>. We do not accept returns for change of mind.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Process:</strong> To initiate a return, please contact our support team within 48 hours of delivery with unboxing videos and clear photographs of the damage.</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-gold mr-2">•</span>
                <span><strong>Refunds:</strong> Once the damaged item is received and inspected, we will process your refund to the original payment method within 5-7 business days.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 bg-brand-bg/50 p-6 md:p-8 rounded-xl border border-brand-gold/20 text-center shadow-sm">
          <h3 className="text-xl font-serif text-brand-maroon mb-2">Need Assistance?</h3>
          <p className="text-gray-600 mb-4">For any queries regarding your order, visit our store or contact us:</p>
          <address className="not-italic text-gray-800">
            <strong className="text-brand-maroon block mb-1">Jewel Palace</strong>
            G-77, Moksh Plaza, Jambli Gali,<br/>
            Borivali West, Mumbai.<br/><br/>
            <strong>Phone:</strong> +91 90299 23215<br/>
            <strong>Email:</strong> <a href="mailto:praveensipani215@gmail.com" className="text-brand-maroon hover:underline">praveensipani215@gmail.com</a>
          </address>
        </div>

      </div>
    </div>
  );
}
