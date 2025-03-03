
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Facebook, Instagram, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function Footer({ className }: { className?: string }) {
  const { data: siteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const response = await axios.get("/api/site-content");
      return response.data;
    }
  });

  const getContentValue = (key: string) => {
    if (!siteContent) return "";
    const content = siteContent.find((item: any) => item.key === key);
    return content ? content.value : "";
  };

  const contactEmail = getContentValue("contact_email");
  const contactPhone = getContentValue("contact_phone");
  const contactAddress = getContentValue("contact_address");
  const contactHours = getContentValue("contact_hours");
  const facebookUrl = getContentValue("social_facebook");
  const instagramUrl = getContentValue("social_instagram");

  return (
    <footer className={cn("bg-gray-100 dark:bg-gray-900", className)}>
      <div className="container px-6 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg mb-4">Little Way Acres</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sustainable farming, exceptional livestock, and community connection.
            </p>
            <div className="flex space-x-4">
              {facebookUrl && (
                <a 
                  href={facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook size={20} />
                </a>
              )}
              {instagramUrl && (
                <a 
                  href={instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Instagram size={20} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dogs" className="text-muted-foreground hover:text-primary">
                  Our Dogs
                </Link>
              </li>
              <li>
                <Link href="/goats" className="text-muted-foreground hover:text-primary">
                  Our Goats
                </Link>
              </li>
              <li>
                <Link href="/market" className="text-muted-foreground hover:text-primary">
                  Farmers Market
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              {contactEmail && (
                <li className="flex items-start">
                  <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${contactEmail}`} className="text-muted-foreground hover:text-primary">
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-start">
                  <Phone className="mr-2 h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${contactPhone}`} className="text-muted-foreground hover:text-primary">
                    {contactPhone}
                  </a>
                </li>
              )}
              {contactAddress && (
                <li className="flex items-start">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">{contactAddress}</span>
                </li>
              )}
            </ul>
          </div>

          {contactHours && (
            <div>
              <h3 className="font-bold text-lg mb-4">Hours</h3>
              <div className="flex items-start">
                <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground whitespace-pre-line">{contactHours}</p>
              </div>
            </div>
          )}
        </div>

        <hr className="my-8 border-gray-200 dark:border-gray-700" />

        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Little Way Acres. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary mx-2">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary mx-2">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
