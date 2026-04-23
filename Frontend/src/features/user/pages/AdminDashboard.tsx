import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Loader2, LogOut, ExternalLink } from "lucide-react";
import { DashboardCard } from "@/features/user/components/DashboardCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/services/axiosConfig";
import { toast } from "sonner";
import { cn } from "@/components/ui/utils";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  salesData: { month: string; sales: number }[];
  topProducts: { name: string; sales: number }[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto p-4 animate-in fade-in duration-700">
      {/* Top Header Row */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-8">
        <h1 className="text-xl font-extrabold tracking-tight text-gray-900 font-inter">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="rounded-xl px-4 h-10 border-gray-200 hover:bg-gray-50 font-bold shadow-sm transition-all active:scale-95 text-gray-700">
            View Store
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl w-10 h-10 p-0 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-4xl font-black mb-2 tracking-tighter text-gray-900 font-inter">Dashboard Overview</h2>
        <p className="text-gray-500 font-bold font-inter italic opacity-70">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <DashboardCard
          title="Total Sales"
          value={`Rs ${(stats.totalSales || 0).toLocaleString()}`}
          icon={DollarSign}
          change="+12.5%"
          changeType="positive"
        />
        <DashboardCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={ShoppingBag}
          change="+8.2%"
          changeType="positive"
        />
        <DashboardCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          icon={Package}
          change="+15 new"
          changeType="positive"
        />
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          change="+18 new users"
          changeType="positive"
        />
      </div>

      {/* Charts Main Layout */}
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Sales Chart Container */}
        <Card className="p-10 border-none shadow-2xl shadow-gray-200/40 bg-white rounded-[40px] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-gray-900 font-inter">Sales Overview</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Monthly performance</p>
            </div>
            <div className="p-3 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.salesData || []}>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F3F4F6" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 700 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ stroke: '#F3F4F6', strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#111827"
                  strokeWidth={5}
                  dot={{ fill: '#111827', r: 6, strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 10, strokeWidth: 0, fill: '#3B82F6' }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products Container */}
        <Card className="p-10 border-none shadow-2xl shadow-gray-200/40 bg-white rounded-[40px] group">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-gray-900 font-inter">Top Selling Products</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Best performers</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.topProducts || []}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="6 6" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={160}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#4B5563', fontSize: 13, fontWeight: 800 }}
                />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                    padding: '20px'
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#111827"
                  radius={[0, 12, 12, 0]}
                  barSize={32}
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
