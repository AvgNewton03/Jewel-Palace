"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const { data } = await axios.get(`${API_URL}/api/reviews/all`);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleVisibility = async (id: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const { data } = await axios.put(`${API_URL}/api/reviews/${id}/visibility`);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isVisible: data.isVisible } : r))
      );
    } catch (error) {
      console.error("Error toggling visibility:", error);
      alert("Failed to update visibility");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Manage Reviews</h2>
        <span className="text-sm text-gray-500">{reviews.length} total</span>
      </div>
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reviews found.</div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className={`p-6 transition-colors ${review.isVisible ? 'bg-white' : 'bg-gray-50/50'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{review.name}</h3>
                  <div className="flex text-brand-gold mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => toggleVisibility(review._id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    review.isVisible 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {review.isVisible ? (
                    <><Eye className="h-4 w-4" /> Visible on Site</>
                  ) : (
                    <><EyeOff className="h-4 w-4" /> Hidden</>
                  )}
                </button>
              </div>
              <p className="text-gray-600 mt-3 text-sm italic">"{review.comment}"</p>
              <p className="text-xs text-gray-400 mt-4">
                Submitted on {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
