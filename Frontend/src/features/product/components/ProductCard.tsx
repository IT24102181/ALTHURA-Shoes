import { Link, useNavigate } from "react-router";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/utils/mockData";

interface ProductCardProps {
  product: {
    id: number | string;
    name: string;
    brand?: string;
    price: number | string;
    originalPrice?: number | string;
    discount?: number;
    imageUrl?: string;
    image?: string;
    stockQuantity?: number;
    stock?: number;
    rating?: number | string;
    reviews?: number | string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.imageUrl || product.image;
  const stock = product.stockQuantity !== undefined ? product.stockQuantity : product.stock;
  const price = product.price;
  const navigate = useNavigate();

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden border">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300";
            }}
          />
          {product.discount && (
            <Badge className="absolute top-2 right-2 bg-red-600 text-white font-bold hover:bg-red-700 shadow-md transform -translate-y-1">
              PROMOTION -{product.discount}%
            </Badge>
          )}
          {stock < 20 && stock > 0 && (
            <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
              Low Stock
            </Badge>
          )}
          {stock === 0 && (
            <Badge className="absolute top-2 left-2 bg-gray-500">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          <h3 className="font-semibold text-sm mb-2 line-clamp-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{product.rating || "4.5"}</span>
            <span className="text-xs text-gray-500">({product.reviews || "0"})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold">Rs {price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  Rs {product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full"
            size="sm"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
            disabled={stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Link>
  );
}