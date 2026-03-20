import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation, Camera } from "lucide-react";
import Image from "next/image";

export default function StoreContactPage() {
  return (
    <div className="bg-white min-h-screen">
      
      {/* Header Banner */}
      <div className="bg-brand-bg py-16 px-4 text-center border-b border-brand-gold/20">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">Visit Jewel Palace</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the elegance in person. Try on our exquisite pieces and let our expert staff help you find the perfect adornment.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Details */}
          <div>
            <h2 className="text-2xl font-serif text-gray-900 mb-8 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span className="text-brand-gold">✦</span> Store Information
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-maroon/5 rounded-full flex items-center justify-center flex-shrink-0 text-brand-maroon">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Our Flagship Store</h3>
                  <p className="text-gray-600 leading-relaxed">
                    G-77, Moksh Plaza, Jambli Gali, 92, <br />
                    Swami Vivekanand Rd, Borivali West,<br />
                    Mumbai, Maharashtra 400092
                  </p>
                  <a href="#" className="inline-flex items-center gap-1 text-sm text-brand-maroon font-medium mt-2 hover:underline">
                    Get Directions <Navigation className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-maroon/5 rounded-full flex items-center justify-center flex-shrink-0 text-brand-maroon">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Store Timings</h3>
                  <div className="text-gray-600 grid grid-cols-2 gap-x-8 gap-y-1">
                    <span className="font-medium">Monday - Saturday</span>
                    <span>10:30 AM - 8:30 PM</span>
                    <span className="font-medium">Sunday</span>
                    <span>11:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-maroon/5 rounded-full flex items-center justify-center flex-shrink-0 text-brand-maroon">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Contact Details</h3>
                  <p className="text-gray-600">Store Front: +91 90299 23215</p>
                  <p className="text-gray-600 mt-1">Direct: +91 11 2345 6789</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-brand-bg rounded-xl border border-brand-gold/30">
              <h3 className="text-lg font-serif text-gray-900 mb-4">Book a Video Consultation</h3>
              <p className="text-sm text-gray-600 mb-6 font-light">
                Can't visit? Our consultants will showcase our best pieces to you over a video call.
              </p>
              <button className="w-full bg-[#25D366] text-white font-medium py-3 rounded hover:bg-[#128C7E] transition-colors flex justify-center items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Us to Book
              </button>
            </div>
          </div>

          {/* Map & Photos */}
          <div className="space-y-8">
            {/* Google Map Mockup */}
            <div className="w-full h-[300px] bg-gray-200 rounded-xl overflow-hidden relative shadow-inner border border-gray-100 flex items-center justify-center">
              {/* In a real app, embed iframe here */}
              <div className="text-center p-6 pb-8 bg-white/80 backdrop-blur rounded shadow-sm border border-gray-200">
                <MapPin className="h-8 w-8 text-brand-maroon mx-auto mb-2" />
                <p className="font-medium text-gray-800">Jewel Palace</p>
                <p className="text-xs text-gray-500">Google Map Integration</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-48 rounded-xl overflow-hidden group">
                <Image src="https://images.unsplash.com/photo-1574636906232-a5d5a2f5f13b?auto=format&fit=crop&q=80&w=600" alt="Store Interior" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="relative h-48 rounded-xl overflow-hidden group">
                <Image src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600" alt="Store Display" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>
            </div>
            
            <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <Camera className="h-4 w-4" /> Discover our world of elegance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
