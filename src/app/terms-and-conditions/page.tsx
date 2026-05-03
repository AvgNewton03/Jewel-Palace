import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Jewel Palace",
  description: "Terms & Conditions for Jewel Palace e-commerce store.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-maroon mb-4">Terms & Conditions</h1>
        <div className="h-1 w-24 bg-brand-gold mx-auto rounded-full"></div>
      </div>
      
      <div className="bg-white p-8 md:p-12 shadow-sm border border-brand-gold/20 rounded-xl text-gray-800 leading-relaxed space-y-8 relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-gold/10 to-transparent -z-10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-brand-gold/10 to-transparent -z-10 rounded-tr-full"></div>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">1. Agreement to Terms</h2>
          <p>These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Jewel Palace ("we," "us" or "our"), concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">2. Intellectual Property Rights</h2>
          <p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">3. Products & Pricing</h2>
          <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products. All prices are subject to change without notice.</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">4. Governing Law</h2>
          <p>These Terms shall be governed by and defined following the laws of India. Jewel Palace and yourself irrevocably consent that the courts of Mumbai, Maharashtra shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">5. Contact Information</h2>
          <address className="not-italic mt-4 p-6 bg-brand-bg border-l-4 border-brand-gold rounded-r-lg shadow-inner">
            <strong className="text-brand-maroon text-lg block mb-1">Jewel Palace</strong>
            G-77, Moksh Plaza, Jambli Gali,<br/>
            Borivali West, Mumbai,<br/>
            Maharashtra, India.<br/><br/>
            <strong>Phone:</strong> +91 90299 23215<br/>
            <strong>Email:</strong> <a href="mailto:praveensipani215@gmail.com" className="text-brand-maroon hover:underline">praveensipani215@gmail.com</a>
          </address>
        </section>
      </div>
    </div>
  );
}
