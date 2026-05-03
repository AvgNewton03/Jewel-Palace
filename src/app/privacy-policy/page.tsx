import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Jewel Palace",
  description: "Privacy Policy for Jewel Palace e-commerce store.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-brand-maroon mb-4">Privacy Policy</h1>
        <div className="h-1 w-24 bg-brand-gold mx-auto rounded-full"></div>
      </div>
      
      <div className="bg-white p-8 md:p-12 shadow-sm border border-brand-gold/20 rounded-xl text-gray-800 leading-relaxed space-y-8 relative overflow-hidden">
        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-gold/10 to-transparent -z-10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-brand-gold/10 to-transparent -z-10 rounded-tr-full"></div>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">1. Introduction</h2>
          <p>Welcome to Jewel Palace. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at our store in Mumbai.</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">2. Information We Collect</h2>
          <p>We collect personal information that you voluntarily provide to us when registering at the Website, expressing an interest in obtaining information about us or our products, when participating in activities on the Website or otherwise contacting us.</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">3. How We Use Your Information</h2>
          <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-brand-maroon mb-4">4. Contact Us</h2>
          <p>If you have questions or comments about this notice, you may visit us at:</p>
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
