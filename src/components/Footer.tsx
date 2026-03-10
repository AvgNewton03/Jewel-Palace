import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-brand-bg">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-brand-gold tracking-wider mb-4 block">
              Jewel Palace
            </Link>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Exquisite imitation jewellery for every occasion. Bringing festivity and vibrancy to your style with premium quality pieces.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-gold transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-brand-gold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/collections" className="text-sm text-gray-300 hover:text-white transition-colors">All Collections</Link></li>
              <li><Link href="/collections?type=wedding" className="text-sm text-gray-300 hover:text-white transition-colors">Wedding Jewellery</Link></li>
              <li><Link href="/store" className="text-sm text-gray-300 hover:text-white transition-colors">Our Store</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-brand-gold uppercase tracking-wider mb-4">Customer Care</h3>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Jewellery Care</Link></li>
              <li><Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-brand-gold uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-brand-gold mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">123 Market Street, Jewellery Bazaar, City - 123456</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-brand-gold mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-300">+91 90299 23215</span>
              </li>
              <li className="flex items-center">
                <MessageCircle className="h-5 w-5 text-brand-gold mr-3 flex-shrink-0" />
                <a href="https://wa.me/919029923215" className="text-sm text-gray-300 hover:text-white transition-colors">WhatsApp Us</a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-brand-gold mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-300">hello@jewelpalace.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Jewel Palace. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-400">Designed with elegance.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
