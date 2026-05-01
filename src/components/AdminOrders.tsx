"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, PackageOpen } from "lucide-react";

interface OrderItem {
  _id: string;
  title: string;
  qty: number;
  price: number;
}

interface Order {
  _id: string;
  user?: {
    username?: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const { data } = await axios.get(`${API_URL}/api/orders`);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(searchLower) ||
      (order.user?.email || "").toLowerCase().includes(searchLower) ||
      (order.user?.username || "").toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading orders...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredOrders.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500">
            <PackageOpen className="h-12 w-12 text-gray-300 mb-4" />
            <p>No orders found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="px-6 py-4">Order ID / Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm text-gray-900">{order._id.substring(order._id.length - 8)}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{order.user?.username || "Guest"}</div>
                    <div className="text-sm text-gray-500">{order.user?.email || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.length} item{order.items.length !== 1 && "s"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">
                      {order.items.map(i => i.title).join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">₹{order.totalAmount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "paid" ? "bg-green-100 text-green-800" :
                      order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
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
