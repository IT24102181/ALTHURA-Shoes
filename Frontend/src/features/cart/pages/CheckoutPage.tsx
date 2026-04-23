import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<{ items: any[]; total: number; originalTotal?: number; discountTotal?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Active form data for Box 1 (Your Delivery Address)
  const [formDataMe, setFormDataMe] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  // Active form data for Box 2 (Another Delivery Address)
  const [formDataOther, setFormDataOther] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  });

  // Read values passed from ShoppingCartPage via navigate state
  const passedState = location.state as any;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await api.get("/cart");
        setCart(response.data);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load checkout summary");
        navigate("/cart");
      }
    };

    const fetchUser = async () => {
      try {
        const userRes = await api.get("/users/profile");
        if (userRes.data) {
          const profile = userRes.data;
          
          // Auto-fill specifically Box 1 mapping User Details automatically
          setFormDataMe(prev => ({
            ...prev,
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            city: profile.city || "",
            state: profile.state || "",
            zip: profile.postalCode || "",
          }));
        }
      } catch (err) {
        console.error("Error fetching user data", err);
      }
    };

    Promise.all([fetchCart(), fetchUser()]).finally(() => {
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const cartItems = passedState?.cartItems || cart?.items || [];
  const originalTotal = passedState?.originalTotal ?? (cart?.originalTotal || cart?.total || 0);
  const discountTotal = passedState?.discountTotal ?? (cart?.discountTotal || 0);
  const subtotal = passedState?.subtotal ?? (cart?.total || 0);
  const distance = passedState?.distance ?? 0;
  const shipping = passedState?.shipping ?? 0;
  const total = passedState?.total ?? subtotal;

  const handleInputChangeMe = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "phone") {
        const num = value.replace(/\D/g, ""); 
        if (num.length > 10) return; 
        setFormDataMe((prev) => ({ ...prev, [id]: num }));
        return;
    }
    if (id === "zip") {
        const num = value.replace(/\D/g, ""); 
        if (num.length > 5) return; 
        setFormDataMe((prev) => ({ ...prev, [id]: num }));
        return;
    }
    setFormDataMe((prev) => ({ ...prev, [id]: value }));
  };

  const handleInputChangeOther = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === "phone") {
        const num = value.replace(/\D/g, ""); 
        if (num.length > 10) return; 
        setFormDataOther((prev) => ({ ...prev, [id]: num }));
        return;
    }
    if (id === "zip") {
        const num = value.replace(/\D/g, ""); 
        if (num.length > 5) return; 
        setFormDataOther((prev) => ({ ...prev, [id]: num }));
        return;
    }
    setFormDataOther((prev) => ({ ...prev, [id]: value }));
  };

  const isFormComplete = (data: any) => {
      return data.firstName && data.lastName && data.email && data.phone && data.address && data.city && data.state && data.zip;
  };

  const handleContinueToPayment = () => {
    // Determine which box the user intends to use. 
    // Prioritize 'Another Delivery Address' if they actively filled it out.
    let selectedData = null;

    if (isFormComplete(formDataOther)) {
        selectedData = formDataOther;
    } else if (isFormComplete(formDataMe)) {
        selectedData = formDataMe;
    }

    if (!selectedData) {
        toast.error("Please completely fill out either 'Your Delivery Address' OR 'Another Delivery Address'.");
        return;
    }

    if (selectedData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    if (selectedData.zip.length !== 5) {
      toast.error("ZIP Code must be exactly 5 digits.");
      return;
    }

    const deliveryAddress = `${selectedData.address}, ${selectedData.city}, ${selectedData.state} ${selectedData.zip} (Receiver: ${selectedData.firstName} ${selectedData.lastName}, Phone: ${selectedData.phone})${selectedData.notes ? ' [Notes: ' + selectedData.notes + ']' : ''}`;

    navigate("/payment", {
      state: { 
        originalTotal, 
        discountTotal, 
        subtotal, 
        distance, 
        shipping, 
        total, 
        cartItems,
        deliveryAddress 
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center text-gray-600 hover:text-black mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Box 1: Your Delivery Address */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Your Delivery Address</h2>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" value={formDataMe.firstName} onChange={handleInputChangeMe} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" value={formDataMe.lastName} onChange={handleInputChangeMe} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" value={formDataMe.email} onChange={handleInputChangeMe} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Enter 10 digits"
                  value={formDataMe.phone} 
                  onChange={handleInputChangeMe} 
                  className="mt-1" 
                />
                <p className="text-xs text-gray-500 mt-1">Must be exactly 10 numeric digits only.</p>
              </div>

              <div>
                <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                <Input id="address" value={formDataMe.address} onChange={handleInputChangeMe} className="mt-1" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <Input id="city" value={formDataMe.city} onChange={handleInputChangeMe} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                  <Input id="state" value={formDataMe.state} onChange={handleInputChangeMe} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code <span className="text-red-500">*</span></Label>
                  <Input 
                    id="zip" 
                    type="text"
                    placeholder="Enter 5 digits"
                    value={formDataMe.zip} 
                    onChange={handleInputChangeMe} 
                    className="mt-1" 
                  />
                  <p className="text-xs text-gray-500 mt-1">5 numeric digits.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formDataMe.notes}
                  onChange={handleInputChangeMe}
                  placeholder="Any special instructions for delivery..."
                  className="mt-1"
                />
              </div>
            </form>
          </Card>

          {/* Box 2: Another Delivery Address */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Another Delivery Address (For a Friend)</h2>
            <p className="text-sm text-gray-500 mb-6">Fill this out ONLY if shipping to a different address.</p>
            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" value={formDataOther.firstName} onChange={handleInputChangeOther} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" value={formDataOther.lastName} onChange={handleInputChangeOther} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" value={formDataOther.email} onChange={handleInputChangeOther} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Enter 10 digits"
                  value={formDataOther.phone} 
                  onChange={handleInputChangeOther} 
                  className="mt-1" 
                />
                <p className="text-xs text-gray-500 mt-1">Must be exactly 10 numeric digits only.</p>
              </div>

              <div>
                <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                <Input id="address" value={formDataOther.address} onChange={handleInputChangeOther} className="mt-1" />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <Input id="city" value={formDataOther.city} onChange={handleInputChangeOther} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                  <Input id="state" value={formDataOther.state} onChange={handleInputChangeOther} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code <span className="text-red-500">*</span></Label>
                  <Input 
                    id="zip" 
                    type="text"
                    placeholder="Enter 5 digits"
                    value={formDataOther.zip} 
                    onChange={handleInputChangeOther} 
                    className="mt-1" 
                  />
                  <p className="text-xs text-gray-500 mt-1">5 numeric digits.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formDataOther.notes}
                  onChange={handleInputChangeOther}
                  placeholder="Any special instructions for delivery..."
                  className="mt-1"
                />
              </div>
            </form>
          </Card>

        </div>

        {/* Order Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6 pb-6 border-b">
              {cartItems.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <img
                    src={item.productImageUrl || item.product?.image}
                    alt={item.productName || item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.productName || item.product?.name}</p>
                    <p className="text-xs text-gray-600">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-bold mt-1">
                      Rs {(item.price || (item.product?.price ?? 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original Total</span>
                <span className="font-semibold">Rs {originalTotal.toFixed(2)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span className="font-semibold">Discount</span>
                  <span className="font-semibold">- Rs {discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rs {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Shipping{distance > 0 ? ` (${distance} km × Rs 50)` : ""}
                </span>
                <span className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}>
                  {shipping === 0 ? "Free" : `Rs ${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-blue-700">Rs {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleContinueToPayment}>
              Continue to Payment
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}