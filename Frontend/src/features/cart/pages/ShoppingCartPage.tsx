import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/features/cart/components/CartItem";
import { useCart } from "@/features/cart/cartContext";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function ShoppingCartPage() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.accessToken) {
        toast.error("Please login to view your cart");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId: any, quantity: number) => {
    try {
      const response = await api.put(`/cart/item/${itemId}?quantity=${quantity}`);
      setCart(response.data);
      refreshCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: any) => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      setCart(response.data);
      toast.success("Item removed from cart");
      refreshCart();
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cart?.total || 0;
  const originalTotal = cart?.originalTotal || subtotal;
  const discountTotal = cart?.discountTotal || 0;
  const shipping = distance * 50;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Start shopping to add items to your cart
          </p>
          <Link to="/products">
            <Button size="lg">
              Browse Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item: any) => (
            <CartItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">

              {/* Always show full breakdown */}
              <div className="flex justify-between">
                <span className="text-gray-600">Original Total</span>
                <span className="font-semibold">Rs {originalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="font-semibold">Discount</span>
                <span className="font-semibold">- Rs {discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-4">
                <span className="text-gray-800 font-medium">Subtotal</span>
                <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Delivery Distance (km)</span>
                  <Input 
                    type="number"
                    min="0"
                    placeholder="Enter km"
                    className="w-24 text-right"
                    value={distance || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistance(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping (Rs 50/km)</span>
                  <span className="font-semibold">
                    {distance === 0 ? "Enter distance" : `Rs ${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Calculated Total</span>
                  <span className="text-2xl font-bold text-blue-700">
                    Rs {total.toFixed(2)}
                  </span>
                </div>
                {distance === 0 && (
                  <p className="text-xs text-gray-400 mt-1 text-right">Enter distance to include shipping</p>
                )}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full mb-4"
              onClick={() =>
                navigate("/checkout", {
                  state: {
                    originalTotal,
                    discountTotal,
                    subtotal,
                    distance,
                    shipping,
                    total,
                    cartItems,
                  },
                })
              }
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Link to="/products">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}