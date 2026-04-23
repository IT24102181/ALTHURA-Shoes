import { useEffect, useState } from "react";
import { Tag, Loader2 } from "lucide-react";
import { OfferCard } from "@/features/promotion/components/OfferCard";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function OffersPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/promotions/active");
        console.log("Promotions response:", response.data);
        setPromotions(response.data);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        toast.error("Failed to load offers");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Special Offers & Promotions</h1>
        </div>
        <p className="text-gray-600">
          Save big with our exclusive deals and discount codes
        </p>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <OfferCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      )}

      {/* How to Use Section */}
      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">How to Use Promo Codes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Copy the Code</h3>
            <p className="text-sm text-gray-600">
              Click on the copy button to copy the promotional code
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Add to Cart</h3>
            <p className="text-sm text-gray-600">
              Add your favorite items to your shopping cart
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Apply & Save</h3>
            <p className="text-sm text-gray-600">
              Enter the code at checkout to enjoy your discount
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
