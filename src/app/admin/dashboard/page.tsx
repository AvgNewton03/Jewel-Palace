"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminForm from '../../../components/AdminForm';
import ProductList from '../../../components/ProductList';
import AdminReviews from '../../../components/AdminReviews';
import AdminOrders from '../../../components/AdminOrders';
import AdminWishlisted from '../../../components/AdminWishlisted';
import { LogOut, Package, Star, ShoppingBag, Heart } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'orders' | 'wishlisted'>('products');

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
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-5 w-5" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reviews'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Star className="h-5 w-5" />
              Manage Reviews
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              Customer Orders
            </button>
            <button
              onClick={() => setActiveTab('wishlisted')}
              className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'wishlisted'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="h-5 w-5" />
              Wishlist Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                 <AdminForm onSuccess={handleProductAdded} />
              </div>
            </div>
            <div className="lg:col-span-8">
              <ProductList refreshKey={refreshKey} />
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-fade-in-up">
            <AdminReviews />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="animate-fade-in-up">
            <AdminOrders />
          </div>
        )}

        {activeTab === 'wishlisted' && (
          <div className="animate-fade-in-up">
            <AdminWishlisted />
          </div>
        )}

      </main>
    </div>
  );
}
