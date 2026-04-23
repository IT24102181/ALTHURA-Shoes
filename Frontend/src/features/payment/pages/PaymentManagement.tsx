import { useEffect, useState } from "react";
import { Search, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function PaymentManagement() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments/all");
      setPayments(res.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleStatusChange = async (paymentId: any, newStatus: string) => {
    try {
      await api.put(`/payments/${paymentId}/status`, null, {
        params: { status: newStatus }
      });
      toast.success("Payment status updated");
      fetchPayments();
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const filtered = payments.filter((p) => {
    const matchesSearch = String(p.id).includes(searchTerm) ||
      String(p.orderId || (p.order && p.order.id) || "").includes(searchTerm);
    const matchesStatus = statusFilter === "all" ||
      (p.status || "").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const paidPayments = payments.filter((p) => p.status === "PAID");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const failedPayments = payments.filter((p) => p.status === "FAILED");

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
        <h1 className="text-2xl font-bold mb-1">Payment Management</h1>
        <p className="text-gray-600">Monitor and manage all payments ({payments.length} total)</p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by payment ID or order ID..."
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
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Payment ID</th>
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Method</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-6 text-center text-gray-500">No payments found</td></tr>
              ) : (
                filtered.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">#{payment.id}</td>
                    <td className="py-3 px-4">#{payment.orderId || (payment.order && payment.order.id) || "N/A"}</td>
                    <td className="py-3 px-4 font-semibold">
                      Rs {(payment.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">{payment.paymentMethod || payment.method || "N/A"}</td>
                    <td className="py-3 px-4">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "N/A"}</td>
                    <td className="py-3 px-4">
                      <Select
                        defaultValue={(payment.status || "PENDING").toLowerCase()}
                        onValueChange={(val) => handleStatusChange(payment.id, val.toUpperCase())}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {(payment.status === "FAILED") && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this failed payment?")) {
                                try {
                                  await api.delete(`/payments/${payment.id}`);
                                  toast.success("Payment deleted successfully");
                                  fetchPayments();
                                } catch (error: any) {
                                  toast.error(error.response?.data?.message || "Failed to delete payment");
                                }
                              }
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold">Rs {totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-1">All time</p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Paid</p>
            <Badge className="bg-green-500">{paidPayments.length}</Badge>
          </div>
          <p className="text-2xl font-bold">
            Rs {paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <Badge className="bg-yellow-500">{pendingPayments.length}</Badge>
          </div>
          <p className="text-2xl font-bold">
            Rs {pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600">Failed</p>
            <Badge className="bg-red-500">{failedPayments.length}</Badge>
          </div>
          <p className="text-2xl font-bold">
            Rs {failedPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
          </p>
        </Card>
      </div>
    </div>
  );
}
