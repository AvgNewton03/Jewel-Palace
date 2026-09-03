"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Package, Heart, Trash2, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/axios";

export default function AccountPage() {
  const { user, firebaseUser, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"wishlist" | "orders" | "addresses">("wishlist");
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Fetch saved addresses directly from MongoDB whenever user or tab changes
  useEffect(() => {
    if (!firebaseUser && !user) return;
    let isSubscribed = true;

    const fetchAddresses = async () => {
      setIsAddressesLoading(true);
      try {
        const targetUserId = user?._id || firebaseUser?.uid;
        const res = await api.get(`/api/user/address/${targetUserId}`);
        const list = Array.isArray(res.data) ? res.data : (res.data?.addresses || []);
        if (isSubscribed) {
          setSavedAddresses(list);
        }
      } catch (err) {
        console.error("Failed to load saved addresses from MongoDB:", err);
        if (user?.addresses && isSubscribed) {
          setSavedAddresses(user.addresses);
        }
      } finally {
        if (isSubscribed) {
          setIsAddressesLoading(false);
        }
      }
    };
    fetchAddresses();
    return () => {
      isSubscribed = false;
    };
  }, [firebaseUser, user]);

  const handleDeleteAddress = async (indexToDelete: number, addressId?: string) => {
    setDeletingIndex(indexToDelete);
    try {
      if (addressId) {
        await api.delete(`/api/user/address/${addressId}`);
      }
      setSavedAddresses((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    } catch (err) {
      console.error("Failed to delete address from MongoDB:", err);
      // Fallback local remove
      setSavedAddresses((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    } finally {
      setDeletingIndex(null);
    }
  };

  useEffect(() => {
    if (!isLoading && !user && !firebaseUser) {
      router.push("/login");
    }
  }, [user, firebaseUser, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] bg-[#faf8f5] dark:bg-[#0f0a08] transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-maroon dark:border-amber-400"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const displayName = user?.name || firebaseUser?.displayName || "Valued Customer";
  const displayEmail = user?.email || firebaseUser?.email || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="bg-[#faf8f5] dark:bg-[#0f0a08] text-stone-900 dark:text-stone-100 min-h-screen transition-colors duration-200 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar Navigation Card */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white dark:bg-[#1a120e] border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl p-6 transition-colors">
              {/* User Profile Summary */}
              <div className="mb-6 pb-6 border-b border-stone-100 dark:border-stone-800/80 text-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-900 dark:bg-[#2a1d17] dark:text-amber-300 font-semibold rounded-full flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-300/30 dark:border-amber-400/20 shadow-inner">
                  {initial}
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                  {displayName}
                </h2>
                {displayEmail && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {displayEmail}
                  </p>
                )}
              </div>
              
              {/* Navigation Links */}
              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === "wishlist"
                      ? "bg-[#6b1414] text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  My Wishlist
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-[#6b1414] text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Order History
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                    activeTab === "addresses"
                      ? "bg-[#6b1414] text-white shadow-sm"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/50"
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  Saved Addresses
                </button>
              </nav>
              
              {/* Sign Out */}
              <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800/80">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Panels */}
          <div className="flex-1 bg-white dark:bg-[#1a120e] border border-stone-200 dark:border-stone-800 shadow-sm rounded-2xl p-6 md:p-8 min-h-[500px] transition-colors">
            
            {/* PANEL: WISHLIST */}
            {activeTab === "wishlist" && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800/80">
                  <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    My Wishlist
                  </h3>
                  {user.wishlist && user.wishlist.length > 0 && (
                    <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/60 px-3 py-1 rounded-full font-medium">
                      {user.wishlist.length} {user.wishlist.length === 1 ? "item" : "items"}
                    </span>
                  )}
                </div>

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
                  <div className="text-center py-20 bg-stone-50 dark:bg-[#241a14] rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                    <Heart className="h-16 w-16 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
                    <p className="text-stone-700 dark:text-stone-300 text-lg font-medium">
                      Your wishlist is empty.
                    </p>
                    <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">
                      Explore our collections and save your favorite pieces.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PANEL: ORDER HISTORY */}
            {activeTab === "orders" && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800/80">
                  <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    Order History
                  </h3>
                </div>
                <div className="text-center py-20 bg-stone-50 dark:bg-[#241a14] rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                  <Package className="h-16 w-16 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
                  <p className="text-stone-700 dark:text-stone-300 text-lg font-medium">
                    No orders found.
                  </p>
                  <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">
                    Your placed orders and tracking details will appear here.
                  </p>
                </div>
              </div>
            )}

            {/* PANEL: SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800/80">
                  <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    Saved Addresses
                  </h3>
                  {savedAddresses.length > 0 && (
                    <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/60 px-3 py-1 rounded-full font-medium">
                      {savedAddresses.length} {savedAddresses.length === 1 ? "address" : "addresses"}
                    </span>
                  )}
                </div>

                {isAddressesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6b1414] dark:text-amber-400" />
                  </div>
                ) : savedAddresses && savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {savedAddresses.map((addr: any, idx: number) => {
                      const displayStreet =
                        (addr.flatHouse && addr.areaStreet
                          ? `${addr.flatHouse}, ${addr.areaStreet}`
                          : addr.street || addr.addressLine || addr.flatHouse || addr.areaStreet || "").replace(/^,\s*|,\s*$/g, "");
                      const cardName =
                        addr.fullName ||
                        addr.name ||
                        (addr.firstName ? `${addr.firstName} ${addr.lastName || ""}`.trim() : null);

                      return (
                        <div
                          key={addr._id || addr.id || idx}
                          className="bg-stone-50 dark:bg-[#241a14] border border-stone-200 dark:border-stone-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div>
                                {cardName && (
                                  <span className="font-semibold text-stone-900 dark:text-stone-100 block text-base">
                                    {cardName}
                                  </span>
                                )}
                                {addr.phone && (
                                  <span className="text-xs text-stone-500 dark:text-stone-400">
                                    +91 {addr.phone}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {addr.isDefault && (
                                  <span className="text-[10px] bg-amber-100 text-amber-900 dark:bg-[#2a1d17] dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-300/30 dark:border-amber-400/20">
                                    Default
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAddress(idx, addr._id || addr.id)}
                                  disabled={deletingIndex === idx}
                                  title="Delete Address"
                                  className="text-stone-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-stone-200/60 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  {deletingIndex === idx ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed mt-2">
                              {displayStreet}
                            </p>
                            {addr.landmark && (
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                                Landmark: {addr.landmark}
                              </p>
                            )}
                            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-2">
                              {addr.city}, {addr.state} - {addr.zip || addr.pincode}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-stone-50 dark:bg-[#241a14] rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">
                    <MapPin className="h-16 w-16 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
                    <p className="text-stone-700 dark:text-stone-300 text-lg font-medium">
                      No saved addresses.
                    </p>
                    <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">
                      Addresses you save during checkout or in your account will appear here.
                    </p>
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
