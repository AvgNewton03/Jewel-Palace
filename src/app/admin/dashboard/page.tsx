"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminForm from '../../../components/AdminForm';
import ProductList from '../../../components/ProductList';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin');
  };

  const handleProductAdded = () => {
    // Increment to trigger re-render/re-fetch in ProductList
    setRefreshKey(prev => prev + 1);
  };

  if (!isAuthenticated) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Jewelry Manager Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Product Section */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
               <AdminForm onSuccess={handleProductAdded} />
            </div>
          </div>

          {/* Product List Section */}
          <div className="lg:col-span-8">
            <ProductList refreshKey={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}
