import { Routes, Route } from "react-router";

import { CustomerLayout } from "@/components/layouts/CustomerLayout";
import { AdminLayout } from "@/components/layouts/AdminLayout";

// Customer Pages
import { HomePage } from "@/features/user/pages/HomePage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProductListingPage } from "@/features/product/pages/ProductList";
import { ProductDetailsPage } from "@/features/product/pages/ProductDetails";
import { ShoppingCartPage } from "@/features/cart/pages/ShoppingCartPage";
import { CheckoutPage } from "@/features/cart/pages/CheckoutPage";
import { PaymentPage } from "@/features/payment/pages/PaymentPage";
import { DeliveryTrackingPage } from "@/features/delivery/pages/DeliveryTrackingPage";
import { OffersPage } from "@/features/promotion/pages/OffersPage";
import { ProfilePage } from "@/features/user/pages/ProfilePage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";

import { MyOrdersPage } from "@/features/order/pages/MyOrdersPage";

// Admin Pages
import { AdminDashboard } from "@/features/user/pages/AdminDashboard";
import { UserManagement } from "@/features/user/pages/UserManagement";
import { ProductManagement } from "@/features/product/pages/ProductManagement";
import { OrderManagement } from "@/features/order/pages/OrderManagement";
import { PaymentManagement } from "@/features/payment/pages/PaymentManagement";
import { DeliveryManagement } from "@/features/delivery/pages/DeliveryManagement";
import { PromotionsManagement } from "@/features/promotion/pages/PromotionsManagement";
import { SalesReports } from "@/features/order/pages/SalesReports";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="products" element={<ProductListingPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="cart" element={<ShoppingCartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="tracking" element={<DeliveryTrackingPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="my-orders" element={<MyOrdersPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="delivery" element={<DeliveryManagement />} />
        <Route path="promotions" element={<PromotionsManagement />} />
        <Route path="reports" element={<SalesReports />} />
      </Route>
    </Routes>
  );
}
