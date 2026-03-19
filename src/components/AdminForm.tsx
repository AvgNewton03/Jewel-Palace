"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function AdminForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState<string[]>(['Necklaces']);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !file) {
      setMessage({ type: 'error', text: 'Please provide all details including an image.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('price', price);
    formData.append('category', JSON.stringify(categories));
    formData.append('occasion', JSON.stringify(occasions));
    formData.append('color', JSON.stringify(colors));
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setMessage({ type: 'success', text: 'Product added successfully!' });
      
      // Clear form
      setTitle('');
      setPrice('');
      setCategories(['Necklaces']);
      setOccasions([]);
      setColors([]);
      setFile(null);
      
      // Reset input type file
      const fileInput = document.getElementById('product-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onSuccess) onSuccess();

      // Auto clear message after few seconds
      setTimeout(() => setMessage(null), 3500);
    } catch (error) {
      console.error('Upload Error:', error);
      setMessage({ type: 'error', text: 'Failed to upload product. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Add Product</h2>
      
      {message && (
        <div 
          className={`mb-5 p-3.5 rounded-xl text-sm font-medium transition-all ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="product-title" className="block text-sm font-medium text-gray-700 mb-1.5">
            Title
          </label>
          <input
            id="product-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
            placeholder="e.g. Diamond Necklace"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1.5">
            Price ($)
          </label>
          <input
            id="product-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Categories</label>
          <div className="grid grid-cols-2 gap-2">
            {['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Sets', 'Other'].map((cat) => (
              <label key={cat} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={(e) => {
                    if (e.target.checked) setCategories([...categories, cat]);
                    else setCategories(categories.filter((c) => c !== cat));
                  }}
                  className="rounded border-gray-300 text-black focus:ring-black"
                  disabled={isLoading}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Occasion</label>
          <div className="grid grid-cols-2 gap-2">
            {['Wedding', 'Heavy Festive', 'Casual', 'Office Wear'].map((occ) => (
              <label key={occ} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={occasions.includes(occ)}
                  onChange={(e) => {
                    if (e.target.checked) setOccasions([...occasions, occ]);
                    else setOccasions(occasions.filter((o) => o !== occ));
                  }}
                  className="rounded border-gray-300 text-black focus:ring-black"
                  disabled={isLoading}
                />
                <span>{occ}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Accent Color</label>
          <div className="grid grid-cols-2 gap-2">
            {['Ruby Red', 'Emerald Green', 'Sapphire Blue', 'Polki/Kundan', 'Antique Gold'].map((col) => (
              <label key={col} className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={colors.includes(col)}
                  onChange={(e) => {
                    if (e.target.checked) setColors([...colors, col]);
                    else setColors(colors.filter((c) => c !== col));
                  }}
                  className="rounded border-gray-300 text-black focus:ring-black"
                  disabled={isLoading}
                />
                <span>{col}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="product-image" className="block text-sm font-medium text-gray-700 mb-1.5">
            Image
          </label>
          <input
            id="product-image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition-all focus:outline-none cursor-pointer"
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 bg-black text-white font-medium rounded-xl hover:bg-gray-900 active:scale-[0.98] transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:active:scale-100 flex justify-center items-center shadow-md disabled:shadow-none"
        >
          {isLoading ? (
             <span className="flex items-center gap-2">
               <Loader2 className="w-5 h-5 animate-spin" />
               Uploading...
             </span>
          ) : 'Upload Product'}
        </button>
      </form>
    </div>
  );
}
