
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const { data: siteContent = [] } = useQuery({
    queryKey: ["/api/site-content"],
  });

  const getContentValue = (key: string) => {
    return siteContent.find((item: any) => item.key === key)?.value || "";
  };
  
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">
              {getContentValue("footer_about_text") || 
                "Little Way Acres is committed to sustainable farming practices, high-quality animal husbandry, and connecting with our community through our farm stand and products."}
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href={getContentValue("facebook_url") || "https://facebook.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a 
                href={getContentValue("instagram_url") || "https://instagram.com"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-pink-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/">
                <a className="text-gray-300 hover:text-white transition-colors">Home</a>
              </Link>
              <Link href="/about">
                <a className="text-gray-300 hover:text-white transition-colors">About</a>
              </Link>
              <Link href="/animals">
                <a className="text-gray-300 hover:text-white transition-colors">Animals</a>
              </Link>
              <Link href="/market">
                <a className="text-gray-300 hover:text-white transition-colors">Market</a>
              </Link>
              <Link href="/contact">
                <a className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </Link>
            </nav>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="text-gray-400 mt-1" size={18} />
                <span className="text-gray-300">
                  {getContentValue("address") || "123 Farm Road, Countryside, CO 80123"}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-gray-400" size={18} />
                <a 
                  href={`tel:${getContentValue("phone") || "555-123-4567"}`} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {getContentValue("phone") || "555-123-4567"}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-gray-400" size={18} />
                <a 
                  href={`mailto:${getContentValue("email") || "info@littlewayacres.com"}`} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {getContentValue("email") || "info@littlewayacres.com"}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Little Way Acres. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
