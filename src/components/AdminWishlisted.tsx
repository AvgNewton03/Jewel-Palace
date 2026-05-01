"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Heart, Trophy } from "lucide-react";

interface WishlistedItem {
  _id: string;
  count: number;
  title: string;
  price: number;
  imageUrl: string;
}

export default function AdminWishlisted() {
  const [items, setItems] = useState<WishlistedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const { data } = await axios.get(`${API_URL}/api/products/admin/most-wishlisted`);
        setItems(data);
      } catch (error) {
        console.error("Error fetching wishlist analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-brand-gold" />
            Most Wishlisted Products
          </h2>
          <p className="text-sm text-gray-500 mt-1">Products ranked by how many times customers have saved them.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {items.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <Heart className="h-12 w-12 text-gray-300 mb-4" />
            <p>No products have been wishlisted yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="px-6 py-4 w-16">Rank</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4 text-center">Wishlist Count</th>
                <th className="px-6 py-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                      index === 1 ? "bg-gray-200 text-gray-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "text-gray-500"
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden relative flex-shrink-0 border border-gray-200">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-maroon/10 text-brand-maroon rounded-full text-sm font-semibold">
                      <Heart className="h-4 w-4 fill-current" />
                      {item.count}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">₹{item.price.toLocaleString("en-IN")}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
