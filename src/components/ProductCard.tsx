"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  hoverImageUrl?: string;
  occasion?: string;
  isNew?: boolean;
}

export default function ProductCard({
  id,
  title,
  price,
  originalPrice,
  imageUrl,
  hoverImageUrl,
  occasion,
  isNew
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        <Link href={`/product/${id}`} className="block w-full h-full">
          <Image
            src={isHovered && hoverImageUrl ? hoverImageUrl : imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-brand-emerald text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded">
              New
            </span>
          )}
          {occasion && (
            <span className="bg-brand-maroon/90 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-2 rounded">
              {occasion}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 text-gray-400 hover:text-brand-maroon transition-colors bg-white/80 backdrop-blur rounded-full p-2 shadow-sm" aria-label="Add to wishlist">
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Actions (Desktop Hover / Mobile Visible) */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 md:translate-y-full md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-gradient-to-t from-black/60 to-transparent flex gap-2"
        >
          <button className="flex-1 bg-white hover:bg-brand-gold text-gray-900 hover:text-white text-sm font-medium py-2.5 rounded transition-colors flex items-center justify-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
          <button className="bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded transition-colors tooltip" aria-label="Quick View">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{occasion || 'Jewellery'}</p>
        <Link href={`/product/${id}`} className="font-serif text-lg text-gray-900 hover:text-brand-maroon transition-colors line-clamp-2 leading-snug mb-2 font-medium">
          {title}
        </Link>
        <div className="mt-auto flex items-center gap-2">
          <span className="font-semibold text-brand-maroon">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
