import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface OfferCardProps {
  promotion: any;
}

export function OfferCard({ promotion }: OfferCardProps) {
  const code = promotion.code || promotion.itemCode || `PROMO${promotion.id}`;
  const discount = promotion.discountPercentage || promotion.discount;
  const validUntil = promotion.endDate || promotion.validUntil;
  const image = promotion.imageUrl || promotion.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400";

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <img
          src={image}
          alt={promotion.title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-4 right-4 bg-red-500 text-lg px-3 py-1">
          {discount}% OFF
        </Badge>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{promotion.title}</h3>
        <p className="text-gray-600 mb-4">{promotion.description}</p>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 font-mono text-center">
            {code}
          </div>
          <Button size="icon" variant="outline" onClick={copyCode}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          Valid until: {new Date(validUntil).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}