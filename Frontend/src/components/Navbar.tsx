import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useCart } from "@/features/cart/cartContext";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const syncAuthState = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsLoggedIn(Boolean(user?.accessToken));
    setUserEmail(user?.email || "");
    setUserRole(user?.role || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    syncAuthState();
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);
    window.addEventListener("auth-changed", syncAuthState);
    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
      window.removeEventListener("auth-changed", syncAuthState);
    };
  }, []);

  useEffect(() => {
    syncAuthState();
  }, [location.pathname]);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-xl font-bold">ALTURA ShoeStore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-gray-600 transition">
              Home
            </Link>
            <Link to="/products" className="hover:text-gray-600 transition">
              Products
            </Link>
            <Link to="/offers" className="hover:text-gray-600 transition">
              Offers
            </Link>
            <Link to="/tracking" className="hover:text-gray-600 transition">
              Track Order
            </Link>
            {isLoggedIn && (
              <Link to="/my-orders" className="hover:text-gray-600 transition">
                My Orders
              </Link>
            )}
            {userRole === "ADMIN" && (
              <Link to="/admin" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                Admin Panel
              </Link>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search shoes..."
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/cart')}>
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} title={userEmail}>
                  <User className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Create Account
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="hover:text-gray-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="hover:text-gray-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/offers"
                className="hover:text-gray-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Offers
              </Link>
              <Link
                to="/tracking"
                className="hover:text-gray-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Order
              </Link>
              {isLoggedIn && (
                <Link
                  to="/my-orders"
                  className="hover:text-gray-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
              )}
              {userRole === "ADMIN" && (
                <Link
                  to="/admin"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              {!isLoggedIn && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setIsMenuOpen(false); navigate("/login"); }}>
                    Login
                  </Button>
                  <Button onClick={() => { setIsMenuOpen(false); navigate("/register"); }}>
                    Create Account
                  </Button>
                </div>
              )}
              <div className="relative pt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search shoes..."
                  className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
