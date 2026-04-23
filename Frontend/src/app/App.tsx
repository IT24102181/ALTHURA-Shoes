import { AppRoutes } from "./routes";
import { CartProvider } from "@/features/cart/cartContext";

export default function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}
