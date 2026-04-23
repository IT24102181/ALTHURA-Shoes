import { Link } from "react-router";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-4">ALTURA ShoeStore</h3>
            <p className="text-gray-400 text-sm">
              Your trusted destination for premium footwear. Quality shoes at unbeatable prices.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link to="#" className="hover:text-gray-300 transition">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link to="#" className="hover:text-gray-300 transition">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link to="#" className="hover:text-gray-300 transition">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition">
                  Offers
                </Link>
              </li>
              <li>
                <Link to="/tracking" className="hover:text-white transition">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="#" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>123 Shoe Street, Fashion District, NY 10001</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>support@alturashoestore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 ALTURA ShoeStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
