import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  CreditCard,
  Truck,
  Tag,
  BarChart3,
} from "lucide-react";
import { cn } from "@/components/ui/utils";

const menuItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/products", icon: Package, label: "Products" },
  { path: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { path: "/admin/payments", icon: CreditCard, label: "Payments" },
  { path: "/admin/delivery", icon: Truck, label: "Delivery" },
  { path: "/admin/promotions", icon: Tag, label: "Promotions" },
  { path: "/admin/reports", icon: BarChart3, label: "Reports" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-1">ShoeStore Management</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-white text-black"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}