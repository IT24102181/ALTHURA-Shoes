import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

interface FormState {
  name: string;
  brand: string;
  category: string;
  price: string;
  stockQuantity: string;
  description: string;
  size: string;
  color: string;
  imageUrl: string;
}

const emptyForm: FormState = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stockQuantity: "",
  description: "",
  size: "",
  color: "",
  imageUrl: "",
};

export function ProductManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductStatus, setEditingProductStatus] = useState<string>("ACTIVE");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [editForm, setEditForm] = useState<FormState>({ ...emptyForm });

  // ── Fetch all products (admin) ──────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/all");
      setProducts(res.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Add Product ─────────────────────────────────────────────────────────────
  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/products", {
        name: form.name,
        brand: form.brand,
        category: form.category,
        price: parseFloat(form.price) || 0,
        stockQuantity: parseInt(form.stockQuantity) || 0,
        description: form.description,
        size: form.size,
        color: form.color,
        imageUrl: form.imageUrl,
        status: "ACTIVE",
      });
      toast.success("Product added successfully!");
      setIsAddDialogOpen(false);
      setForm({ ...emptyForm });
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  // ── Open Edit dialog pre-filled with selected product ──────────────────────
  const openEditDialog = (product: any) => {
    setEditingProductId(product.id);
    setEditingProductStatus(product.status || "ACTIVE");
    setEditForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      stockQuantity: String(product.stockQuantity ?? product.stock ?? ""),
      description: product.description || "",
      size: product.size || "",
      color: product.color || "",
      imageUrl: product.imageUrl || product.image || "",
    });
    setIsEditDialogOpen(true);
  };

  // ── Save edited product ─────────────────────────────────────────────────────
  const handleEditProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingProductId === null) return;
    try {
      await api.put(`/products/${editingProductId}`, {
        name: editForm.name,
        brand: editForm.brand,
        category: editForm.category,
        price: parseFloat(editForm.price) || 0,
        stockQuantity: parseInt(editForm.stockQuantity) || 0,
        description: editForm.description,
        size: editForm.size,
        color: editForm.color,
        imageUrl: editForm.imageUrl,
        status: editingProductStatus,
      });
      toast.success("Product updated successfully!");
      setIsEditDialogOpen(false);
      setEditingProductId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  // ── Delete Product ──────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const filtered = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Datalists for Combobox behavior ── */}
      <datalist id="brand-options">
        {uniqueBrands.map((brand) => (
          <option key={brand} value={brand} />
        ))}
      </datalist>
      <datalist id="category-options">
        {uniqueCategories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Product Management</h1>
          <p className="text-gray-600">
            Manage your product inventory ({products.length} products)
          </p>
        </div>

        {/* ── Add Product Dialog ── */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAddProduct}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="a-name">Product Name</Label>
                  <Input
                    id="a-name"
                    className="mt-1"
                    value={form.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="a-brand">Brand</Label>
                  <Input
                    id="a-brand"
                    list="brand-options"
                    className="mt-1"
                    value={form.brand}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="a-category">Category</Label>
                  <Input
                    id="a-category"
                    list="category-options"
                    className="mt-1"
                    value={form.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="a-price">Price</Label>
                  <Input
                    id="a-price"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    value={form.price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="a-stock">Stock</Label>
                  <Input
                    id="a-stock"
                    type="number"
                    className="mt-1"
                    value={form.stockQuantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, stockQuantity: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="a-color">Color</Label>
                  <Input
                    id="a-color"
                    className="mt-1"
                    value={form.color}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, color: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="a-desc">Description</Label>
                <Input
                  id="a-desc"
                  className="mt-1"
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="a-size">Available Sizes (comma separated)</Label>
                <Input
                  id="a-size"
                  placeholder="7,8,9,10,11,12"
                  className="mt-1"
                  value={form.size}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, size: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="a-img">Image URL</Label>
                <Input
                  id="a-img"
                  className="mt-1"
                  value={form.imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Product</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Edit Product Dialog ── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEditProduct}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="e-name">Product Name</Label>
                <Input
                  id="e-name"
                  className="mt-1"
                  value={editForm.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="e-brand">Brand</Label>
                <Input
                  id="e-brand"
                  list="brand-options"
                  className="mt-1"
                  value={editForm.brand}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, brand: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="e-category">Category</Label>
                <Input
                  id="e-category"
                  list="category-options"
                  className="mt-1"
                  value={editForm.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="e-price">Price</Label>
                <Input
                  id="e-price"
                  type="number"
                  step="0.01"
                  className="mt-1"
                  value={editForm.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, price: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="e-stock">Stock</Label>
                <Input
                  id="e-stock"
                  type="number"
                  className="mt-1"
                  value={editForm.stockQuantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, stockQuantity: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="e-color">Color</Label>
                <Input
                  id="e-color"
                  className="mt-1"
                  value={editForm.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditForm({ ...editForm, color: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="e-desc">Description</Label>
              <Input
                id="e-desc"
                className="mt-1"
                value={editForm.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="e-size">Available Sizes (comma separated)</Label>
              <Input
                id="e-size"
                placeholder="7,8,9,10,11,12"
                className="mt-1"
                value={editForm.size}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, size: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="e-img">Image URL</Label>
              <Input
                id="e-img"
                className="mt-1"
                value={editForm.imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, imageUrl: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Search Bar ── */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search products by name or brand..."
            className="pl-10"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
      </Card>

      {/* ── Products Table ── */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Image</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Brand</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img
                        src={
                          product.imageUrl ||
                          product.image ||
                          "https://via.placeholder.com/48"
                        }
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.brand}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">Rs {product.price}</td>
                    <td className="py-3 px-4">
                      {product.stockQuantity ?? product.stock}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          (product.stockQuantity ?? product.stock) > 20
                            ? "bg-green-500"
                            : (product.stockQuantity ?? product.stock) > 0
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }
                      >
                        {(product.stockQuantity ?? product.stock) > 20
                          ? "In Stock"
                          : (product.stockQuantity ?? product.stock) > 0
                            ? "Low Stock"
                            : "Out of Stock"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {/* Edit button — opens pre-filled dialog */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        {/* Delete button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}