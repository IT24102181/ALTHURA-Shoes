import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/features/product/components/ProductCard";
import api from "@/services/axiosConfig";
import { toast } from "sonner";
import { useCart } from "@/features/cart/cartContext";

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);

        // Fetch related products (same category)
        const relatedRes = await api.get(`/products?category=${response.data.category}`);
        setRelatedProducts(relatedRes.data.filter((p: any) => p.id !== parseInt(id!)).slice(0, 4));
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.accessToken) {
      toast.error("Please login to add items to cart");
      navigate('/login');
      return;
    }

    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    try {
      setAddingToCart(true);
      await api.post('/cart/add', {
        productId: product.id,
        quantity: quantity,
        size: selectedSize
      });
      toast.success("Added to cart successfully!");
      refreshCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Check stock.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const sizes = product.size ? product.size.split(',') : [];
  const imageUrl = product.imageUrl || product.image;
  const stock = product.stockQuantity !== undefined ? product.stockQuantity : product.stock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-black mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Link>

      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(product.images || [imageUrl, imageUrl, imageUrl]).map((img: string, idx: number) => (
              <div
                key={idx}
                className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-black cursor-pointer"
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 uppercase tracking-wide mb-2">
              {product.brand}
            </p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                      }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-4xl font-bold">Rs {product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    Rs {product.originalPrice}
                  </span>
                  <Badge className="bg-red-500">
                    Save {product.discount}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {stock > 0 ? (
                <Badge className="bg-green-500">In Stock ({stock} available)</Badge>
              ) : (
                <Badge className="bg-red-500">Out of Stock</Badge>
              )}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Select Size</h3>
            <div className="grid grid-cols-6 gap-2">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border rounded-lg py-3 text-center hover:border-black transition ${selectedSize === size ? "border-black bg-black text-white" : ""
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="text-lg font-semibold w-12 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-4 mb-8">
            <Button
              size="lg"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={stock === 0 || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              Buy Now
            </Button>
          </div>

          {/* Features */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Free shipping on orders over Rs 50</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-gray-600" />
              <span className="text-sm">30-day return policy</span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t mt-8 pt-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}