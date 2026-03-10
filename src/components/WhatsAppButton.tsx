import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919029923215"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-6 md:bottom-10 md:right-10 z-[9999] bg-[#25D366] text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-foreground text-brand-bg text-sm py-1.5 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap hidden sm:block">
        Need help? Chat with us!
        <span className="absolute top-1/2 -mt-1 -right-1 border-4 border-transparent border-l-foreground"></span>
      </span>
    </a>
  );
}
