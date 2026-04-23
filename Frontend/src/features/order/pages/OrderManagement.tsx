import React, { useEffect, useState } from "react";
import { Search, Eye, Loader2, ShoppingBag, CheckCircle, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/services/axiosConfig";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";

export function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");
      setLoading(true);
      const res = await api.get("/orders/all");
      console.log("Orders received:", res.data);
      setOrders(res.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId: any, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const filtered = (orders || []).filter((order) => {
    if (!order) return false;
    const orderId = String(order.id || "");
    const userName = String(order.userName || "");
    const userEmail = String(order.userEmail || "");
    const status = String(order.status || "").toLowerCase();

    const matchesSearch = orderId.includes(searchTerm) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto p-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-gray-900">Order Management</h1>
          <p className="text-gray-500 font-medium font-inter">View and manage all orders</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="rounded-xl px-4 h-10 border-gray-200 hover:bg-gray-50 font-semibold shadow-sm transition-all active:scale-95">
            View Store
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full w-10 h-10 p-0 border border-gray-100 shadow-sm transition-all active:scale-95">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
          <Input
            type="text"
            placeholder="Search orders by ID or customer name..."
            className="pl-12 h-12 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-all shadow-sm focus:ring-4 focus:ring-blue-100/50"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-56 h-12 bg-gray-50/50 border-gray-200 rounded-xl shadow-sm hover:bg-gray-100/50 transition-all font-medium">
            <SelectValue placeholder="All Orders" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-2xl p-1 bg-white/95 backdrop-blur-md">
            <SelectItem value="all" className="rounded-lg h-9">All Orders</SelectItem>
            <SelectItem value="pending" className="rounded-lg h-9">Pending</SelectItem>
            <SelectItem value="confirmed" className="rounded-lg h-9 text-blue-600 font-medium">Confirmed</SelectItem>
            <SelectItem value="shipped" className="rounded-lg h-9 text-purple-600 font-medium">Shipped</SelectItem>
            <SelectItem value="delivered" className="rounded-lg h-9 text-green-600 font-medium">Delivered</SelectItem>
            <SelectItem value="cancelled" className="rounded-lg h-9 text-red-600 font-medium">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="border-none shadow-2xl shadow-gray-200/40 overflow-hidden bg-white rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100 italic font-inter text-left">
                <th className="py-6 px-8 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">Order ID</th>
                <th className="py-6 px-8 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">Customer</th>
                <th className="py-6 px-8 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">Date</th>
                <th className="py-6 px-8 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">Total</th>
                <th className="py-6 px-8 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">Status</th>
                <th className="py-6 px-8 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em]">Delivery Address</th>
                <th className="py-6 px-8 font-bold text-gray-400 text-[10px] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <ShoppingBag className="w-16 h-16" />
                      <p className="text-xl font-bold font-inter">No orders match your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/20 transition-all group cursor-default">
                    <td className="py-6 px-8 font-extrabold text-blue-600 tabular-nums font-inter">
                      {order.formattedId || `ORD-${String(order.id).padStart(3, '0')}`}
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight leading-tight font-inter">{order.userName || "Guest Customer"}</span>
                        <span className="text-xs text-gray-400 font-medium truncate max-w-[150px] font-inter">{order.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-gray-500 font-bold whitespace-nowrap tabular-nums font-inter">
                      {order.createdAt || "N/A"}
                    </td>
                    <td className="py-6 px-8 font-black text-gray-900 tabular-nums text-lg font-inter">
                      Rs {(order.total || 0).toFixed(2)}
                    </td>
                    <td className="py-6 px-8">
                      <Select
                        defaultValue={(order.status || "PENDING").toLowerCase()}
                        onValueChange={(val: string) => handleStatusChange(order.id, val.toUpperCase())}
                      >
                        <SelectTrigger className={cn(
                          "w-36 h-10 rounded-xl border-none font-bold text-[11px] uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95",
                          order.status === "DELIVERED" ? "bg-green-100/80 text-green-700 ring-1 ring-green-200" :
                            order.status === "SHIPPED" || order.status === "CONFIRMED" ? "bg-blue-100/80 text-blue-700 ring-1 ring-blue-200" :
                              order.status === "PENDING" ? "bg-amber-100/80 text-amber-700 ring-1 ring-amber-200" :
                                "bg-gray-100/80 text-gray-700 ring-1 ring-gray-200"
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 shadow-xl bg-white/95 backdrop-blur-md">
                          <SelectItem value="pending" className="text-[11px] font-bold uppercase">Pending</SelectItem>
                          <SelectItem value="confirmed" className="text-[11px] font-bold uppercase">Confirmed</SelectItem>
                          <SelectItem value="shipped" className="text-[11px] font-bold uppercase">Shipped</SelectItem>
                          <SelectItem value="delivered" className="text-[11px] font-bold uppercase">Delivered</SelectItem>
                          <SelectItem value="cancelled" className="text-[11px] font-bold uppercase">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-6 px-8 text-sm font-medium text-gray-500 max-w-[280px] truncate group-hover:text-gray-900 transition-colors font-inter" title={order.deliveryAddress}>
                      {order.deliveryAddress}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all font-bold group-active:scale-95 font-inter">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 text-left">
        <Card className="p-7 border-none shadow-xl shadow-gray-200/40 bg-white rounded-3xl group hover:shadow-blue-200/50 transition-all duration-300">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 font-inter italic">Total Orders</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-gray-900 tabular-nums font-inter">{orders.length}</p>
            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
              <ShoppingBag className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </Card>
        <Card className="p-7 border-none shadow-xl shadow-gray-200/40 bg-white rounded-3xl group hover:shadow-amber-200/50 transition-all duration-300">
          <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em] mb-3 font-inter italic">Pending</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-gray-900 tabular-nums font-inter">
              {orders.filter((o) => o && o.status === "PENDING").length}
            </p>
            <div className="p-3 bg-amber-50/50 rounded-2xl group-hover:bg-amber-100 transition-colors">
              <Loader2 className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </Card>
        <Card className="p-7 border-none shadow-xl shadow-gray-200/40 bg-white rounded-3xl group hover:shadow-blue-200/50 transition-all duration-300">
          <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-3 font-inter italic">Confirmed</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-gray-900 tabular-nums font-inter">
              {orders.filter((o) => o && o.status === "CONFIRMED").length}
            </p>
            <div className="p-3 bg-blue-50/50 rounded-2xl group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-7 border-none shadow-xl shadow-gray-200/40 bg-white rounded-3xl group hover:shadow-green-200/50 transition-all duration-300">
          <p className="text-[10px] font-black text-green-500/60 uppercase tracking-[0.2em] mb-3 font-inter italic">Delivered</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-gray-900 tabular-nums font-inter">
              {orders.filter((o) => o && o.status === "DELIVERED").length}
            </p>
            <div className="p-3 bg-green-50/50 rounded-2xl group-hover:bg-green-100 transition-colors">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-7 border-none shadow-xl shadow-gray-200/40 bg-white rounded-3xl group hover:shadow-blue-200/50 transition-all duration-300 overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <DollarSign className="w-32 h-32" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 font-inter italic">Income</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-gray-900 tabular-nums font-inter">
              Rs {orders.reduce((acc, o) => acc + (o.total || 0), 0).toFixed(0)}
            </p>
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-all z-10">
              <TrendingUp className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
