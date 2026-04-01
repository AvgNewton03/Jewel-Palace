"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Package, Heart } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function AccountPage() {
  const { user, firebaseUser, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("wishlist");

  useEffect(() => {
    if (!isLoading && !user && !firebaseUser) {
      router.push("/login");
    }
  }, [user, firebaseUser, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="flex-1 bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                <div className="w-16 h-16 bg-brand-maroon/10 text-brand-maroon rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-serif font-bold text-gray-900 line-clamp-1">{user.name}</h2>
                <p className="text-sm text-gray-500 line-clamp-1">{user.email}</p>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === "orders" ? "bg-brand-maroon text-white shadow-md shadow-brand-maroon/20" : "text-gray-600 hover:bg-gray-50 hover:text-brand-maroon"
                  }`}
                >
                  <Package className="h-5 w-5" />
                  Order History
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === "wishlist" ? "bg-brand-maroon text-white shadow-md shadow-brand-maroon/20" : "text-gray-600 hover:bg-gray-50 hover:text-brand-maroon"
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  My Wishlist
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                    activeTab === "addresses" ? "bg-brand-maroon text-white shadow-md shadow-brand-maroon/20" : "text-gray-600 hover:bg-gray-50 hover:text-brand-maroon"
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  Saved Addresses
                </button>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
            {activeTab === "wishlist" && (
              <div className="animate-fade-in-up">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">My Wishlist</h3>
                {user.wishlist && user.wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.wishlist.map((product: any) => (
                      <ProductCard
                        key={typeof product === "string" ? product : product._id}
                        id={typeof product === "string" ? product : product._id}
                        title={product.title || "Product"}
                        price={product.price || 0}
                        imageUrl={product.imageUrl || "https://res.cloudinary.com/dwyj5h6y1/image/upload/v1700000000/placeholder.jpg"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-xl font-medium">Your wishlist is empty.</p>
                    <p className="text-gray-400 mt-2">Explore our collections and find items to love.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "orders" && (
              <div className="animate-fade-in-up">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Order History</h3>
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-xl font-medium">No orders found.</p>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="animate-fade-in-up">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Saved Addresses</h3>
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {user.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">{addr.street}</span>
                          {addr.isDefault && (
                            <span className="text-xs bg-brand-maroon/10 text-brand-maroon px-3 py-1 rounded-full font-bold uppercase tracking-wider">Default</span>
                          )}
                        </div>
                        <p className="text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-xl font-medium">No saved addresses.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
