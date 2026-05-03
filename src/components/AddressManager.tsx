"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { MapPin, Trash2, Plus, Check, AlertCircle } from "lucide-react";

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressManager() {
  const { firebaseUser } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (firebaseUser) {
      fetchAddresses();
    }
  }, [firebaseUser]);

  const fetchAddresses = async () => {
    if (!firebaseUser) return;
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.addresses) {
          setAddresses(data.addresses);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "pincode") {
      // Allow only numbers
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData({ ...formData, [name]: numericValue });
      
      if (numericValue.length > 0 && numericValue.length !== 6) {
        setPincodeError("Pincode must be exactly 6 digits.");
      } else {
        setPincodeError("");
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const syncAddressesToFirestore = async (newAddresses: Address[]) => {
    if (!firebaseUser) return;
    const userRef = doc(db, "users", firebaseUser.uid);
    try {
      await updateDoc(userRef, {
        addresses: newAddresses,
      });
    } catch (error: any) {
      // If document doesn't exist yet, setDoc will create it
      if (error.code === 'not-found') {
        await setDoc(userRef, { addresses: newAddresses });
      } else {
        console.error("Error syncing addresses:", error);
        throw error;
      }
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pincode.length !== 6) {
      setPincodeError("Pincode must be exactly 6 digits.");
      return;
    }

    const newAddress: Address = {
      ...formData,
      id: Date.now().toString(),
      isDefault: addresses.length === 0, // First address is automatically default
    };

    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    setIsAdding(false);
    setFormData({ fullName: "", phone: "", addressLine: "", landmark: "", city: "", state: "", pincode: "" });
    
    await syncAddressesToFirestore(updatedAddresses);
  };

  const handleDeleteAddress = async (id: string) => {
    const addressToDelete = addresses.find(a => a.id === id);
    const updatedAddresses = addresses.filter(a => a.id !== id);
    
    // If we deleted the default address, make the first remaining address the new default
    if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    setAddresses(updatedAddresses);
    await syncAddressesToFirestore(updatedAddresses);
  };

  const handleSetDefault = async (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    
    setAddresses(updatedAddresses);
    await syncAddressesToFirestore(updatedAddresses);
  };

  if (!firebaseUser) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-brand-gold/20">
        <p className="text-brand-maroon font-medium">Please log in to manage your addresses.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 bg-brand-bg rounded-2xl shadow-sm border border-brand-maroon/5">
      <div className="flex justify-between items-center mb-8 border-b border-brand-gold/30 pb-4">
        <h2 className="text-2xl font-serif text-brand-maroon flex items-center gap-3">
          <div className="p-2 bg-white rounded-full shadow-sm border border-brand-gold/20">
            <MapPin className="text-brand-gold w-5 h-5" />
          </div>
          My Saved Addresses
        </h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-brand-maroon text-brand-bg px-5 py-2.5 rounded-full hover:bg-brand-maroon/90 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={18} /> Add New Address
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleAddAddress} className="bg-white p-6 md:p-8 rounded-xl border border-brand-gold/30 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-serif text-brand-maroon mb-6">Enter Address Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-shadow" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-shadow" placeholder="+91 9876543210" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line (House No, Building, Street) *</label>
              <input required name="addressLine" value={formData.addressLine} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-shadow" placeholder="Flat 101, Jewel Residency, SV Road..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
              <input name="landmark" value={formData.landmark} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-shadow" placeholder="Near City Mall" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input required name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-shadow" placeholder="e.g. 400092" />
              {pincodeError && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {pincodeError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-shadow" placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input required name="state" value={formData.state} onChange={handleInputChange} className="w-full p-3 border border-gray-200 rounded-lg focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-shadow" placeholder="Maharashtra" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-brand-maroon border border-brand-maroon/30 rounded-full hover:bg-brand-maroon/5 transition-colors font-medium">
              Cancel
            </button>
            <button type="submit" disabled={formData.pincode.length !== 6} className="px-8 py-2.5 bg-brand-maroon text-brand-bg rounded-full hover:bg-brand-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm font-medium">
              Save Address
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-2 border-brand-gold border-t-brand-maroon rounded-full"></div></div>
      ) : addresses.length === 0 && !isAdding ? (
        <div className="text-center py-16 bg-white rounded-xl border border-brand-gold/20 shadow-sm">
          <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gold/30">
            <MapPin className="w-8 h-8 text-brand-gold" />
          </div>
          <h3 className="text-xl font-serif text-brand-maroon mb-2">No Addresses Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't saved any delivery addresses yet. Add one now for a faster checkout experience.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 bg-white text-brand-maroon border border-brand-maroon px-6 py-2.5 rounded-full hover:bg-brand-maroon hover:text-white transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={18} /> Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((address) => (
            <div key={address.id} className={`relative p-6 rounded-xl border bg-white shadow-sm transition-all ${address.isDefault ? 'border-brand-gold ring-1 ring-brand-gold/50 bg-[#fffdf7]' : 'border-gray-200 hover:border-brand-gold/50'}`}>
              
              {address.isDefault && (
                <span className="absolute top-0 right-0 bg-brand-gold text-white text-xs px-3 py-1.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1 font-medium shadow-sm">
                  <Check size={14} /> Default Shipping
                </span>
              )}
              
              <div className="pr-16">
                <h4 className="font-semibold text-gray-800 text-lg mb-1">{address.fullName}</h4>
                <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-maroon/40 inline-block"></span>
                  {address.phone}
                </p>
                <div className="text-sm text-gray-500 leading-relaxed mb-5 bg-gray-50 p-3 rounded-md border border-gray-100">
                  <p className="font-medium text-gray-700">{address.addressLine}</p>
                  {address.landmark && <p>Near {address.landmark}</p>}
                  <p>{address.city}, {address.state}</p>
                  <p className="font-semibold text-brand-maroon mt-1">PIN: {address.pincode}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {!address.isDefault ? (
                  <button onClick={() => handleSetDefault(address.id)} className="text-sm text-brand-maroon hover:text-brand-maroon/70 font-medium transition-colors hover:underline">
                    Set as Default
                  </button>
                ) : (
                  <span className="text-sm text-gray-400 italic">Primary Address</span>
                )}
                <button onClick={() => handleDeleteAddress(address.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full" title="Delete address">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
