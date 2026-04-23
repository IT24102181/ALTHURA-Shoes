import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function PromotionsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountPercentage: "",
    code: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    imageUrl: "",
    isActive: true,
    applicableCategory: ""
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/promotions/all");
      setPromotions(res.data || []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const handleEdit = (promo: any) => {
    setEditingId(promo.id);
    setForm({
      title: promo.title || "",
      description: promo.description || "",
      discountPercentage: promo.discountPercentage?.toString() || "",
      code: promo.code || "",
      startDate: promo.startDate ? promo.startDate.split("T")[0] : new Date().toISOString().split("T")[0],
      endDate: promo.endDate ? promo.endDate.split("T")[0] : "",
      imageUrl: promo.imageUrl || "",
      isActive: promo.isActive ?? true,
      applicableCategory: promo.applicableCategory || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        discountPercentage: parseFloat(form.discountPercentage) || 0,
        startDate: form.startDate + "T00:00:00",
        endDate: form.endDate + "T23:59:59"
      };

      if (editingId) {
        await api.put(`/promotions/${editingId}`, data);
        toast.success("Promotion updated successfully!");
      } else {
        await api.post("/promotions", data);
        toast.success("Promotion created successfully!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPromotions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save promotion");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      discountPercentage: "",
      code: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      imageUrl: "",
      isActive: true,
      applicableCategory: ""
    });
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await api.delete(`/promotions/${id}`);
      toast.success("Promotion deleted");
      fetchPromotions();
    } catch (error) {
      toast.error("Failed to delete promotion");
    }
  };

  const handleToggleStatus = async (id: any) => {
    try {
      await api.put(`/promotions/${id}/toggle`);
      toast.success("Status updated");
      fetchPromotions();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Promotions Management</h1>
          <p className="text-gray-600">Create and manage promotional offers ({promotions.length} total)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Promotion" : "Create New Promotion"}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="title">Promotion Title</Label>
                <Input id="title" className="mt-1" value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" className="mt-1" value={form.description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input id="discount" type="number" className="mt-1" value={form.discountPercentage} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, discountPercentage: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="code">Promo Code</Label>
                  <Input id="code" className="mt-1" value={form.code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, code: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" className="mt-1" value={form.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" className="mt-1" value={form.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input id="image" type="url" className="mt-1" value={form.imageUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <Label htmlFor="applicableCategory">Applicable Category (optional)</Label>
                  <Input id="applicableCategory" className="mt-1" value={form.applicableCategory} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, applicableCategory: e.target.value })} placeholder="e.g. Running" />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch id="active" checked={form.isActive} onCheckedChange={(checked: boolean) => setForm({ ...form, isActive: checked })} />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingId ? "Update" : "Create"} Promotion</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <Card key={promo.id} className="overflow-hidden">
            <div className="relative h-40">
              <img
                src={promo.imageUrl || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1080"}
                alt={promo.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 right-3 bg-red-600 text-lg px-3 py-1">
                {promo.discountPercentage}% OFF
              </Badge>
              {!promo.isActive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg">Inactive</Badge>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold truncate pr-2">{promo.title}</h3>
                <Switch checked={promo.isActive} onCheckedChange={() => handleToggleStatus(promo.id)} />
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">{promo.description}</p>

              {promo.code && (
                <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-3 py-2 font-mono text-center mb-4 font-bold tracking-wider">
                  {promo.code}
                </div>
              )}
              {promo.applicableCategory && (
                <div className="mb-4 text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded w-max">
                  For: {promo.applicableCategory}
                </div>
              )}

              <div className="flex flex-col space-y-1 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span>From:</span>
                  <span>{new Date(promo.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Until:</span>
                  <span>{new Date(promo.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(promo)}>
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                  onClick={() => handleDelete(promo.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Total Promotions</p>
            <Tag className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{promotions.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Active</p>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {promotions.filter((p) => p.isActive).length}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-gray-400">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-500 font-medium">Inactive</p>
          </div>
          <p className="text-3xl font-bold text-gray-400">
            {promotions.filter((p) => !p.isActive).length}
          </p>
        </Card>
      </div>
    </div>
  );
}
