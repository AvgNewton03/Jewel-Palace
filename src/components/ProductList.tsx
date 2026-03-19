"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Trash2, Edit } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  imageUrl: string;
  isVisible: boolean;
}

export default function ProductList({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // NOTE: Depending on your environment, you may want to use a Next.js environment variable.
  const API_URL = 'http://localhost:5000/api/products';

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/${id}`, { isVisible: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally update local state instead of refetching for speed
      setProducts(products.map(p => p._id === id ? { ...p, isVisible: !currentStatus } : p));
    } catch (error) {
      console.error('Failed to update visibility', error);
      alert('Failed to update visibility');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete product', error);
      alert('Failed to delete product');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-gray-500 text-lg">No products found.</p>
        <p className="text-sm text-gray-400 mt-2">Upload a product using the form to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map(product => (
        <div 
          key={product._id} 
          className={`flex flex-col sm:flex-row items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all ${
            !product.isVisible ? 'opacity-60 saturate-50' : ''
          }`}
        >
          {/* Product Image */}
          <div className="w-full sm:w-24 h-48 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 mb-4 sm:mb-0">
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-grow sm:px-6 w-full text-center sm:text-left mb-4 sm:mb-0">
            <h3 className="text-lg font-bold text-gray-900">{product.title}</h3>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
              <span className="font-semibold text-gray-700">${product.price.toFixed(2)}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {product.category}
              </span>
              {!product.isVisible && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Hidden
                </span>
              )}
            </div>
          </div>

          {/* Actions - Big touch-friendly buttons */}
          <div className="flex flex-row justify-center sm:flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => toggleVisibility(product._id, product.isVisible)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 text-sm font-medium rounded-xl transition-colors ${
                product.isVisible 
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {product.isVisible ? <EyeOff className="w-5 h-5 sm:w-4 sm:h-4" /> : <Eye className="w-5 h-5 sm:w-4 sm:h-4" />}
              <span className="sm:hidden">{product.isVisible ? 'Hide' : 'Show'}</span>
            </button>
            <button
              onClick={() => deleteProduct(product._id)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium rounded-xl transition-colors"
            >
              <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">Delete</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
