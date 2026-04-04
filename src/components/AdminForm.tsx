"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function AdminForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categories, setCategories] = useState<string[]>(['Necklace set']);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [productColors, setProductColors] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || files.length === 0) {
      setMessage({ type: 'error', text: 'Please provide all details including at least one media file.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('title', title);
    if (description) formData.append('description', description);
    formData.append('price', price);
    formData.append('category', JSON.stringify(categories));
    formData.append('occasion', JSON.stringify(occasions));
    formData.append('color', JSON.stringify(colors));
    formData.append('productColor', JSON.stringify(productColors));
    files.forEach(f => formData.append('media', f));

    try {
  const token = localStorage.getItem('token');

  await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/products/add`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    }
  );

      setMessage({ type: 'success', text: 'Product added successfully!' });
      
      // Clear form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategories(['Necklaces']);
      setOccasions([]);
      setColors([]);
      setProductColors([]);
      setFiles([]);
      
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
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 md:p-10 bg-white rounded-2xl shadow-sm border border-gray-100">
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
          <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm min-h-[100px] resize-y"
            placeholder="Product description..."
            disabled={isLoading}
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

        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <label className="block text-base font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
            {[
              'Necklace set', 'Pendent set', 'Bangle', 'Kada', 'Ring', 'Nath', 
              'Hath pan', 'Mang tika', 'Tops', 'Earrings', 'Mangalsutra', 
              'Borla', 'Killangi', 'Chocker', 'Balli', 'Earcuff', 'Payal', 
              'West belt', 'Baju band', 'Jooda', 'Damini', 'Sheeshphool', 
              'Ghughri', 'Mala', 'Chain', 'Sindoor box', 'Groom mala'
            ].map((cat) => (
              <label key={cat} className="flex items-start space-x-2.5 text-sm text-gray-700 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={(e) => {
                    if (e.target.checked) setCategories([...categories, cat]);
                    else setCategories(categories.filter((c) => c !== cat));
                  }}
                  className="mt-0.5 rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon cursor-pointer w-4 h-4"
                  disabled={isLoading}
                />
                <span className="group-hover:text-gray-900 transition-colors leading-snug">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 border border-gray-100 rounded-xl p-5">
          {/* Occasion */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Occasion</label>
            <div className="flex flex-col gap-3">
              {['Wedding', 'Heavy Festive', 'Casual', 'Office Wear'].map((occ) => (
                <label key={occ} className="flex items-start space-x-2.5 text-sm text-gray-700 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={occasions.includes(occ)}
                    onChange={(e) => {
                      if (e.target.checked) setOccasions([...occasions, occ]);
                      else setOccasions(occasions.filter((o) => o !== occ));
                    }}
                    className="mt-0.5 rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon cursor-pointer w-4 h-4"
                    disabled={isLoading}
                  />
                  <span className="group-hover:text-gray-900 transition-colors leading-snug">{occ}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Material</label>
            <div className="flex flex-col gap-3">
              {['American Diamond', 'Kundan', 'Polki', 'Mojonite', 'Antique', 'Moti', 'Oxodized'].map((col) => (
                <label key={col} className="flex items-start space-x-2.5 text-sm text-gray-700 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={colors.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) setColors([...colors, col]);
                      else setColors(colors.filter((c) => c !== col));
                    }}
                    className="mt-0.5 rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon cursor-pointer w-4 h-4"
                    disabled={isLoading}
                  />
                  <span className="group-hover:text-gray-900 transition-colors leading-snug">{col}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Color (Optional)</label>
            <div className="flex flex-col gap-3">
              {['Pink', 'Green', 'Blue', 'Mint Pink', 'Mint Green', 'Black', 'Purple'].map((col) => (
                <label key={col} className="flex items-start space-x-2.5 text-sm text-gray-700 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={productColors.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) setProductColors([...productColors, col]);
                      else setProductColors(productColors.filter((c) => c !== col));
                    }}
                    className="mt-0.5 rounded border-gray-300 text-brand-maroon focus:ring-brand-maroon cursor-pointer w-4 h-4"
                    disabled={isLoading}
                  />
                  <span className="group-hover:text-gray-900 transition-colors leading-snug">{col}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="product-media" className="block text-sm font-medium text-gray-700 mb-1.5">
            Media (Images & Videos)
          </label>
          <input
            id="product-media"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition-all focus:outline-none cursor-pointer"
            disabled={isLoading}
            required
          />
          {files.length > 0 && (
            <p className="mt-2 text-xs text-brand-maroon">{files.length} file(s) selected.</p>
          )}
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
