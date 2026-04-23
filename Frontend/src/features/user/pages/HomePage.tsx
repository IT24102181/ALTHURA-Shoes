import { Link } from "react-router";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/product/components/ProductCard";

import { useEffect, useState } from "react";
import api from "@/services/axiosConfig";
import { toast } from "sonner";

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, promosRes] = await Promise.all([
          api.get("/products"),
          api.get("/promotions/active")
        ]);
        setFeaturedProducts(productsRes.data.slice(0, 4));
        setPromotions(promosRes.data);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
        toast.error("Failed to load some content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { name: "Running", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { name: "Basketball", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { name: "Lifestyle", image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
    { name: "Training", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white tracking-tight">
              Walk the Walk with <span className="text-blue-500">Confidence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 font-light">
              Curated shoes for every occasion. Discover your new favorite pair and own every room you enter.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 h-14 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/20">
                  Shop Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/offers">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none text-white h-14 px-8 text-lg rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:brightness-110 active:scale-95"
                >
                  View Offers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">Shop by Category</h2>
          <div className="mt-2 h-1 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative h-[400px] overflow-hidden rounded-2xl shadow-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:bg-black/40" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-white text-2xl font-bold mb-2 transform transition-transform duration-300 group-hover:-translate-y-2">
                  {category.name}
                </h3>
                <div className="flex items-center text-blue-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore Now</span>
                  <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-gray-600 mt-2">Top picks of the season</p>
          </div>
          <Link to="/products">
            <Button variant="outline">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h2 className="text-3xl font-bold">Active Promotions</h2>
          </div>
          <Link to="/offers">
            <Button variant="outline">
              See All Offers
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-gradient-to-br from-red-500 to-pink-500 rounded-lg p-6 text-white"
            >
              <h3 className="text-2xl font-bold mb-2">{promo.title}</h3>
              <p className="mb-4">{promo.description}</p>
              <div className="bg-white text-black px-4 py-2 rounded-lg inline-block font-mono font-bold">
                CODE: {promo.id}
              </div>
              <div className="mt-2 text-sm font-semibold">
                Ends: {promo.endDate}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-gray-400">Products</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">50K+</p>
              <p className="text-gray-400">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">100+</p>
              <p className="text-gray-400">Brands</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-gray-400">Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
