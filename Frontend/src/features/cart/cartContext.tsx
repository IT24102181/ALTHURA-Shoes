import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/services/axiosConfig";

interface CartContextType {
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.accessToken) {
        setCartCount(0);
        return;
      }
      const response = await api.get("/cart");
      const items: any[] = response.data?.items || [];
      const total = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
