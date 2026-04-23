import { useEffect, useState } from "react";
import { Search, Truck, MapPin, Loader2, CalendarIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function DeliveryManagement() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/deliveries/all");
      setDeliveries(res.data || []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast.error("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const handleStatusChange = async (deliveryId: any, newStatus: string) => {
    try {
      await api.put(`/deliveries/${deliveryId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success("Delivery status updated");
      fetchDeliveries();
    } catch (error) {
      toast.error("Failed to update delivery status");
    }
  };

  const filtered = deliveries.filter((d) => {
    const matchesSearch = String(d.id).includes(searchTerm) ||
      String(d.orderId || (d.order && d.order.id) || "").includes(searchTerm);
    const matchesStatus = statusFilter === "all" ||
      (d.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Delivery Management</h1>
        <p className="text-gray-600">Track and manage deliveries ({deliveries.length} total)</p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by delivery or order ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deliveries</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Deliveries Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Delivery ID</th>
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Address</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-gray-500">No deliveries found</td></tr>
              ) : (
                filtered.map((delivery) => (
                  <tr key={delivery.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">#{delivery.id}</td>
                    <td className="py-3 px-4">#{delivery.orderId || (delivery.order && delivery.order.id) || "N/A"}</td>
                    <td className="py-3 px-4 max-w-[200px] truncate" title={delivery.address}>
                      {delivery.address || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <Select
                        value={(delivery.status || "ASSIGNED")}
                        onValueChange={(val) => handleStatusChange(delivery.id, val)}
                      >
                        <SelectTrigger className={`w-36 ${delivery.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ASSIGNED">Assigned</SelectItem>
                          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delivery Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Total Deliveries</p>
            <Truck className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">{deliveries.length}</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Assigned</p>
            <Badge className="bg-blue-500">
              {deliveries.filter((d) => d.status === "ASSIGNED").length}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {deliveries.filter((d) => d.status === "ASSIGNED").length}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">In Transit</p>
            <Badge className="bg-yellow-500">
              {deliveries.filter((d) => d.status === "IN_TRANSIT").length}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {deliveries.filter((d) => d.status === "IN_TRANSIT").length}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Delivered</p>
            <Badge className="bg-green-500">
              {deliveries.filter((d) => d.status === "DELIVERED").length}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {deliveries.filter((d) => d.status === "DELIVERED").length}
          </p>
        </Card>
      </div>
    </div>
  );
}
