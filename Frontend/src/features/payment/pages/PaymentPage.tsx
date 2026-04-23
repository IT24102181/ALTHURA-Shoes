import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { CreditCard, Wallet, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import api from "@/services/axiosConfig";
import { useCart } from "@/features/cart/cartContext";
import { toast } from "sonner";

export function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedState = location.state as any;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // State for card details
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: ""
  });

  const { refreshCart } = useCart();

  const originalTotal: number = passedState?.originalTotal ?? 0;
  const discountTotal: number = passedState?.discountTotal ?? 0;
  const subtotal: number = passedState?.subtotal ?? 0;
  const distance: number = passedState?.distance ?? 0;
  const shipping: number = passedState?.shipping ?? 0;
  const total: number = passedState?.total ?? subtotal;
  const deliveryAddress: string = passedState?.deliveryAddress || "No Address Provided";

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Strict Card Number validation
    if (id === "cardNumber") {
        if (/[^0-9]/.test(value)) {
            toast.error("Enter Wrong Credentials");
        }
        const numericValue = value.replace(/\D/g, ""); // Strip non-digits
        
        if (numericValue.length > 16) {
             toast.error("Card number cannot exceed 16 digits.");
             return;
        }
        setCardDetails(prev => ({ ...prev, number: numericValue }));
        return;
    }

    // Strict CVV validation
    if (id === "cvv") {
      const numericValue = value.replace(/\D/g, ""); // Strip non-digits
      if (numericValue.length > 3) return;
      setCardDetails(prev => ({ ...prev, cvv: numericValue }));
      return;
    }

    setCardDetails(prev => ({ ...prev, [id]: value }));
  };

  const handlePayment = async () => {
    // Prevent submission if card validation fails
    if (paymentMethod === "card") {
      if (!cardDetails.name || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        toast.error("Please fill in all card details.");
        return;
      }
      if (cardDetails.number.length !== 16) {
        toast.error("Card number must be exactly 16 digits to proceed.");
        return;
      }
    }

    setStatus("pending");
    try {
      // 1. Convert Cart to Order and attach Address
      const orderResponse = await api.post("/orders/checkout", {
        deliveryAddress: deliveryAddress
      });
      const generatedOrderId = orderResponse.data.id;
      setOrderId(generatedOrderId);

      // 2. Process Payment for the Order
      await api.post("/payments/pay", {
        orderId: generatedOrderId,
        paymentMethod: paymentMethod.toUpperCase(),
      });

      setStatus("success");
      refreshCart(); // clear cart on success
    } catch (error: any) {
      console.error("Payment failed:", error);
      setStatus("failed");
      toast.error(error.response?.data?.message || "Failed to process payment. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Card className="p-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-2">
            Your order has been confirmed and will be shipped soon.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Order ID: #ORD-{Date.now()}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to={`/tracking?orderId=${orderId}`}>
              <Button size="lg">Track Order</Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Card className="p-12">
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            We couldn't process your payment. Please try again or use a different payment method.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => setStatus("idle")}>
              Try Again
            </Button>
            <Link to="/cart">
              <Button size="lg" variant="outline">
                Back to Cart
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Card className="p-12">
          <Clock className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold mb-4">Processing Payment...</h1>
          <p className="text-gray-600">Please wait while we process your payment.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/checkout" className="inline-flex items-center text-gray-600 hover:text-black mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Checkout
      </Link>

      <h1 className="text-3xl font-bold mb-8">Payment Method</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Payment Methods */}
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Select Payment Method</h2>

            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-4">
                {/* Credit/Debit Card */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="card" id="card" />
                  <div className="flex-1">
                    <Label htmlFor="card" className="cursor-pointer flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Credit / Debit Card
                    </Label>
                  </div>
                </div>

                {/* Cash on Delivery */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="cod" id="cod" />
                  <div className="flex-1">
                    <Label htmlFor="cod" className="cursor-pointer flex items-center">
                      <Wallet className="w-5 h-5 mr-2" />
                      Cash on Delivery
                    </Label>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </Card>

          {/* Card Details Form */}
          {paymentMethod === "card" && (
            <Card className="p-6">
              <h3 className="font-bold mb-4">Card Details</h3>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Cardholder Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="name" 
                    value={cardDetails.name}
                    onChange={handleCardInputChange}
                    placeholder="John Doe" 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Card Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="cardNumber"
                    value={cardDetails.number}
                    onChange={handleCardInputChange}
                    placeholder="1234 1234 1234 1234"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">16 numeric digits.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry Date <span className="text-red-500">*</span></Label>
                    <Input 
                      id="expiry" 
                      type="month"
                      value={cardDetails.expiry}
                      onChange={handleCardInputChange}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV <span className="text-red-500">*</span></Label>
                    <Input 
                      id="cvv" 
                      type="password"
                      placeholder="***" 
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      className="mt-1" 
                    />
                  </div>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* Payment Summary */}
        <div>
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Payment Summary</h2>

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
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold text-blue-700">Rs {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handlePayment}>
              Pay Now — Rs {total.toFixed(2)}
            </Button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Your payment information is secure and encrypted
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}