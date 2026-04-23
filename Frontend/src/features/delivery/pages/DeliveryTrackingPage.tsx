import { useEffect, useState } from "react";
import { Package, Truck, CheckCircle, MapPin, Loader2, AlertCircle } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/services/axiosConfig";

export function DeliveryTrackingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderIdParam = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        setLoading(true);
        let currentOrderId = orderIdParam;

        if (!currentOrderId) {
          // Fetch from /myorders and use the most recent one
          const res = await api.get("/orders/myorders");
          const orders = res.data;
          if (orders && orders.length > 0) {
            // Assume the first one is the most recent
            currentOrderId = orders[orders.length - 1].id;
          } else {
            setError("You have no orders to track.");
            setLoading(false);
            return;
          }
        }

        const [orderRes, deliveryRes] = await Promise.all([
          api.get(`/orders/${currentOrderId}`),
          api.get(`/deliveries/order/${currentOrderId}`).catch(() => null) // May not have delivery yet
        ]);

        setOrder(orderRes.data);
        if (deliveryRes && deliveryRes.data) {
          setDelivery(deliveryRes.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to find tracking information.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingInfo();
  }, [orderIdParam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Card className="p-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tracking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "Could not load your tracking details."}</p>
          <Button onClick={() => navigate("/products")}>Return to Shop</Button>
        </Card>
      </div>
    );
  }

  // Derive timeline status
  const dStatus = delivery?.status || "PENDING"; 
  const currentStatus = order.status === "DELIVERED" ? "DELIVERED" 
                        : dStatus === "IN_TRANSIT" ? "IN TRANSIT" 
                        : dStatus === "ASSIGNED" ? "ASSIGNED" 
                        : order.status === "CONFIRMED" ? "CONFIRMED"
                        : "PROCESSING";

  const timeline = [
    {
      status: "CONFIRMED",
      title: "Order Confirmed",
      description: "Your order has been placed and confirmed",
      date: order.createdAt || "Processing...",
      completed: true,
      icon: Package
    },
    {
      status: "ASSIGNED",
      title: "Order Assigned",
      description: "Your order has been assigned for delivery",
      date: delivery?.createdAt ? new Date(delivery.createdAt).toLocaleDateString() : "Pending",
      completed: dStatus === "ASSIGNED" || dStatus === "IN_TRANSIT" || dStatus === "DELIVERED" || order.status === "DELIVERED",
      icon: Package
    },
    {
      status: "IN_TRANSIT",
      title: "In Transit",
      description: "Package is on its way to you",
      date: "In Progress",
      completed: dStatus === "IN_TRANSIT" || dStatus === "DELIVERED" || order.status === "DELIVERED",
      icon: Truck
    },
    {
      status: "DELIVERED",
      title: "Delivered",
      description: "Package has been delivered successfully",
      date: order.status === "DELIVERED" ? "Delivered" : "Pending",
      completed: dStatus === "DELIVERED" || order.status === "DELIVERED",
      icon: CheckCircle
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline & Address */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="text-xl font-bold text-blue-600">{order.formattedId}</p>
              </div>
              {delivery?.trackingNumber && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                  <p className="text-lg font-mono font-semibold">{delivery.trackingNumber}</p>
                </div>
              )}
              <Badge className={`px-4 py-2 ${currentStatus === "DELIVERED" ? "bg-green-500" : "bg-blue-500"} text-white`}>
                {currentStatus}
              </Badge>
            </div>

            <div className="flex items-start space-x-2 text-sm text-gray-600 mt-6 pt-4 border-t">
              <MapPin className="w-5 h-5 mt-0.5 text-red-500 shrink-0" />
              <div>
                 <span className="font-semibold text-black block mb-1">Delivery Address</span>
                 <p className="whitespace-pre-wrap leading-relaxed">{order.deliveryAddress}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Delivery Progress</h2>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-8">
                {timeline.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="relative flex gap-4">
                      <div
                        className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          step.completed
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                            : "bg-gray-100 text-gray-400 border-2 border-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 pt-2">
                        <h3 className={`font-bold ${step.completed ? "text-gray-900" : "text-gray-500"}`}>{step.title}</h3>
                        <p className="text-sm text-gray-500 mb-1 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                        <p className="text-xs font-medium text-gray-400">{step.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Order Items */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div className="w-16 h-16 rounded-md bg-white border border-gray-200 overflow-hidden shrink-0">
                    <img 
                      src={item.productImageUrl || "https://placehold.co/100"} 
                      alt={item.productName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-semibold text-sm truncate" title={item.productName}>{item.productName}</p>
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold mt-1 text-blue-600">Rs {item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t flex justify-between items-center">
               <span className="font-semibold text-gray-600">Total Paid</span>
               <span className="text-xl font-black">Rs {(order.total || 0).toFixed(2)}</span>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}