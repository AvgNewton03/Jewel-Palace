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
                  <a href="https://maps.app.goo.gl/vzSK8emtow8sSS8S9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-maroon font-medium mt-2 hover:underline">
                    Get Directions <Navigation className="h-3 w-3" />
                  </a>
                </div>
              </div>


              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-maroon/5 rounded-full flex items-center justify-center flex-shrink-0 text-brand-maroon">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Contact Details</h3>
                  <p className="text-gray-600">Store Front: +91 90299 23215</p>

                </div>
              </div>
            </div>


          </div>

          {/* Map & Photos */}
          <div className="space-y-8">
            {/* Google Map Embedded */}
            <a 
              href="https://maps.app.goo.gl/vzSK8emtow8sSS8S9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-[300px] rounded-xl overflow-hidden relative shadow-inner border border-gray-100 group"
            >
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.2919598032604!2d72.85206537499401!3d19.22610358200961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b0d42d7ac6ff%3A0x67cfe4f42e6dab0!2sJewel%20Palace!5e0!3m2!1sen!2sin!4v1774116627867!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="pointer-events-none grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-brand-maroon shadow-sm font-medium text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <MapPin className="h-4 w-4" />
                  Click to open in Google Maps
                </div>
              </div>
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}
