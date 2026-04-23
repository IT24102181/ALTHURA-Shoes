import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Package, Loader2, ArrowRight, Truck, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tracking states
  const [trackingInfo, setTrackingInfo] = useState<Record<number, any>>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<number, boolean>>({});
  const [trackingOpen, setTrackingOpen] = useState<Record<number, boolean>>({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/myorders");
      // Sort by newest first
      const sortedOrders = (res.data || []).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTrackOrder = async (orderId: number) => {
    // Toggle visibility
    if (trackingOpen[orderId]) {
      setTrackingOpen(prev => ({ ...prev, [orderId]: false }));
      return;
    }

    setTrackingOpen(prev => ({ ...prev, [orderId]: true }));
    
    // Fetch if not already fetched
    if (!trackingInfo[orderId]) {
      try {
        setTrackingLoading(prev => ({ ...prev, [orderId]: true }));
        const res = await api.get(`/deliveries/order/${orderId}`);
        setTrackingInfo(prev => ({ ...prev, [orderId]: res.data }));
      } catch (error) {
        toast.error("Delivery tracking not available yet");
        // We still keep it open so user sees its empty or we close it
        setTrackingOpen(prev => ({ ...prev, [orderId]: false }));
      } finally {
        setTrackingLoading(prev => ({ ...prev, [orderId]: false }));
      }
    }
  };

  const handleConfirmDelivery = async (orderId: number) => {
    try {
      await api.put(`/orders/${orderId}/confirm`);
      toast.success("Order confirmed as delivered!");
      fetchOrders(); // refresh order statuses
    } catch (error) {
      toast.error("Failed to confirm delivery");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">You haven't placed any orders yet</h1>
          <p className="text-gray-600 mb-8">
            When you purchase items, they will appear here along with their payment status.
          </p>
          <Link to="/products">
            <Button size="lg">
              Start Shopping
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
      case "DELIVERED":
        return "bg-green-500";
      case "PENDING":
        return "bg-amber-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8">My Order History</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="p-6 shadow-md border-gray-100/50">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b pb-4 gap-4">
              <div>
                <h2 className="text-lg font-bold">Order #{order.id}</h2>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Order Status</p>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status || "Unknown"}
                  </Badge>
                </div>
                {order.paymentStatus && (
                  <div className="text-right border-l pl-4">
                    <p className="text-sm text-gray-600 mb-1">Payment</p>
                    <Badge className={
                      order.paymentStatus === "PAID" ? "bg-green-500" :
                      order.paymentStatus === "FAILED" ? "bg-red-500" : "bg-yellow-500"
                    }>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2 border-l pl-4 ml-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handleTrackOrder(order.id)}
                  >
                    <Truck className="w-4 h-4" />
                    {trackingOpen[order.id] ? "Hide Tracking" : "Track"}
                  </Button>
                  
                  {/* Show confirm if order is shipped/confirmed/assigned essentially any non-pending/non-delivered non-cancelled state */}
                  {order.status !== 'DELIVERED' && order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
                    <Button 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 font-semibold"
                      onClick={() => handleConfirmDelivery(order.id)}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Received
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking Dropdown Details */}
            {trackingOpen[order.id] && (
              <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl animate-in slide-in-from-top-2">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5" /> Delivery Details
                </h3>
                {trackingLoading[order.id] ? (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching tracking info...
                  </div>
                ) : trackingInfo[order.id] ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Delivery Status</p>
                      <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                        {trackingInfo[order.id].status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Tracking Number</p>
                      <p className="font-semibold font-mono">{trackingInfo[order.id].trackingNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Delivery Partner</p>
                      <p className="font-medium text-gray-900">{trackingInfo[order.id].deliveryPartner || "Assigned by branch"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Expected Delivery</p>
                      <p className="font-bold text-gray-900">
                        {trackingInfo[order.id].estimatedDeliveryDate 
                          ? new Date(trackingInfo[order.id].estimatedDeliveryDate).toLocaleDateString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                            }) 
                          : "TBD"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Tracking information is not available for this order.</p>
                )}
              </div>
            )}

            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <img
                    src={item.productImage || item.product?.image || "/placeholder.jpg"}
                    alt={item.productName || item.product?.name}
                    className="w-20 h-20 object-cover rounded bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.productName || item.product?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Size: {item.size || "Standard"} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      Rs {(item.price || (item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-blue-700">Rs {order.total?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
