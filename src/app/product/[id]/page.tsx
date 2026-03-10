import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ShoppingBag, Store, Heart, Share2, Tag, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function ProductDetail({ params }: { params: { id: string } }) {
  // Mock product data based on ID
  const product = {
    id: params.id,
    title: "Kundan Polki Bridal Choker Set with Pearls",
    price: 4299,
    originalPrice: 5999,
    description: "Make a royal statement on your special day with our stunning Kundan Polki Choker Set. Handcrafted with precision, this set features intricate meenakari work on the reverse and is adorned with premium quality faux pearls and semi-precious emerald drops.",
    features: [
      "Anti-tarnish 22k gold plating",
      "Hypoallergenic and skin-safe",
      "Includes matching earrings and maang tikka",
      "Adjustable dori closure for the perfect fit"
    ],
    occasion: "Wedding",
    stock: 5,
    images: [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1599643478514-4a4204b281f5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"
    ]
  };

  return (
    <div className="bg-white min-h-screen py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-brand-maroon transition-colors">Home</Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li>
              <Link href="/collections" className="hover:text-brand-maroon transition-colors">Collections</Link>
            </li>
            <li><span className="mx-2">/</span></li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]" aria-current="page">
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* Image Gallery */}
          <div className="lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 flex-shrink-0 hide-scrollbar">
              {product.images.map((img, idx) => (
                <button key={idx} className={`relative w-20 h-24 md:w-24 md:h-32 flex-shrink-0 rounded-md overflow-hidden border-2 ${idx === 0 ? 'border-brand-maroon' : 'border-transparent'}`}>
                  <Image src={img} alt={`${product.title} view ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
              {/* Video Mock Thumbnail */}
              <button className="relative w-20 h-24 md:w-24 md:h-32 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center group">
                <span className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></span>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center z-20 shadow-sm relative pl-1">
                  ▶
                </span>
              </button>
            </div>
            
            {/* Main Image */}
            <div className="relative w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden flex-1">
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" priority />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-brand-maroon text-white text-xs font-bold uppercase tracking-wider py-1.5 px-3 rounded">
                  {product.occasion}
                </span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4 pr-8 line-clamp-3">
                {product.title}
              </h1>
              <div className="flex gap-2 shrink-0">
                <button className="p-2 text-gray-400 hover:text-brand-maroon transition-colors bg-gray-50 rounded-full" aria-label="Share">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-brand-maroon transition-colors bg-gray-50 rounded-full" aria-label="Add to Wishlist">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-semibold text-brand-maroon">₹{product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-1">₹{product.originalPrice.toLocaleString("en-IN")}</span>
                  <span className="text-sm font-medium text-brand-emerald mb-1.5 ml-2">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Actions */}
            <div className="space-y-4 mb-8">
              <button className="w-full bg-foreground text-white font-medium text-lg py-4 rounded hover:bg-brand-maroon shadow-md transition-all flex justify-center items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </button>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a 
                  href={`https://wa.me/919029923215?text=Hi! I want to order: ${product.title} (ID: ${product.id})`}
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 font-medium py-3.5 rounded hover:bg-[#25D366]/20 transition-all flex justify-center items-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Order on WhatsApp
                </a>
                <button className="bg-brand-gold/10 text-brand-maroon border border-brand-gold/50 font-medium py-3.5 rounded hover:bg-brand-gold/20 transition-all flex justify-center items-center gap-2">
                  <Store className="h-5 w-5" />
                  Reserve & Pick
                </button>
              </div>
            </div>

            {/* Features/Details */}
            <div className="border-t border-gray-100 pt-8 mt-4">
              <h3 className="font-serif text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand-gold" />
                Product Highlights
              </h3>
              <ul className="space-y-2 mb-8">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <span className="mr-2 text-brand-gold">•</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-col items-center text-center p-2">
                  <ShieldCheck className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-600 font-medium">1 Year Polish Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center p-2 border-x border-gray-200">
                  <Truck className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-600 font-medium">Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center p-2">
                  <RotateCcw className="h-6 w-6 text-gray-500 mb-2" />
                  <span className="text-xs text-gray-600 font-medium">7-Day Easy Returns</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
