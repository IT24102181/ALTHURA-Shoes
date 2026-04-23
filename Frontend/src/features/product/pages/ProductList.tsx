import { useEffect, useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { ProductCard } from "@/features/product/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router";
import api from "@/services/axiosConfig";
import { toast } from "sonner";
import { FilterPanel } from "@/features/product/components/FilterPanel";

export function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const normalizedCategory = category?.trim();
        const endpoint = normalizedCategory
          ? `/products?category=${encodeURIComponent(normalizedCategory)}`
          : "/products";
        const response = await api.get(endpoint);
        console.log("Products response:", response.data);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))],
    [products],
  );

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    let result = products.filter((product) => {
      const matchesSearch = !normalizedSearch
        || product.name?.toLowerCase().includes(normalizedSearch)
        || product.brand?.toLowerCase().includes(normalizedSearch)
        || product.category?.toLowerCase().includes(normalizedSearch);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      return matchesSearch && matchesBrand && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      const aPrice = Number(a.price) || 0;
      const bPrice = Number(b.price) || 0;
      const aRating = Number(a.rating) || 0;
      const bRating = Number(b.rating) || 0;

      switch (sortBy) {
        case "price-low":
          return aPrice - bPrice;
        case "price-high":
          return bPrice - aPrice;
        case "newest":
          return Number(b.id) - Number(a.id);
        case "rating":
          return bRating - aRating;
        default:
          return 0;
      }
    });

    return result;
  }, [products, searchTerm, selectedBrands, selectedCategories, sortBy]);

  const handleBrandChange = (brand: string, checked: boolean) => {
    setSelectedBrands((prev) => {
      if (checked) return [...prev, brand];
      return prev.filter((item) => item !== brand);
    });
  };

  const handleCategoryChange = (nextCategory: string, checked: boolean) => {
    setSelectedCategories((prev) => {
      if (checked) return [...prev, nextCategory];
      return prev.filter((item) => item !== nextCategory);
    });
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Products` : "All Products"}
        </h1>
        <p className="text-gray-600">Showing {filteredProducts.length} products</p>
      </div>

      {/* Search and Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for shoes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        <aside className="hidden md:block w-72 shrink-0">
          <FilterPanel
            brands={brands}
            categories={categories}
            selectedBrands={selectedBrands}
            selectedCategories={selectedCategories}
            onBrandChange={handleBrandChange}
            onCategoryChange={handleCategoryChange}
            onClear={clearFilters}
          />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-4 md:hidden">
            <FilterPanel
              brands={brands}
              categories={categories}
              selectedBrands={selectedBrands}
              selectedCategories={selectedCategories}
              onBrandChange={handleBrandChange}
              onCategoryChange={handleCategoryChange}
              onClear={clearFilters}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : (
            filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
                No products found for the selected filters.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
