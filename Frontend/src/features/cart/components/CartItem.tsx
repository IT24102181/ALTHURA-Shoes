import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem as CartItemType } from "@/utils/mockData";

interface CartItemProps {
  item: any;
  onQuantityChange?: (id: any, quantity: number) => void;
  onRemove?: (id: any) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const name = item.productName || item.product?.name;
  const imageUrl = item.productImageUrl || item.product?.image;
  const price = item.price || item.product?.price;
  const brand = item.product?.brand || "";
  const discountedPrice = item.discountedPrice;
  const isDiscounted = discountedPrice !== undefined && discountedPrice !== null && discountedPrice < price;

  return (
    <div className="flex gap-4 bg-white p-4 rounded-lg border">
      {/* Product Image */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover rounded bg-gray-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300";
          }}
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {brand} • Size: {item.size}
        </p>
        {isDiscounted ? (
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-gray-400 line-through text-sm">Rs {price}</span>
            <span className="text-lg font-bold text-red-600">Rs {discountedPrice}</span>
            {item.appliedPromotionTitle && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold">
                {item.appliedPromotionTitle}
              </span>
            )}
          </div>
        ) : (
          <p className="text-lg font-bold">Rs {price}</p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove?.(item.id)}
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2 border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              onQuantityChange?.(item.id, Math.max(1, item.quantity - 1))
            }
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}