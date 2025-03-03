import React, { useState, useEffect } from "react";
import { Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter"; // Added from original code

export default function Footer() {
  const { data: contactData, isLoading } = useQuery({
    queryKey: ['/api/site-content'],
    queryFn: async () => {
      const res = await fetch('/api/site-content');
      if (!res.ok) throw new Error('Failed to fetch site content');
      return res.json();
    },
  });

  const getContactValue = (key: string) => {
    if (!contactData) return "";
    const item = contactData.find((item: any) => item.key === key);
    return item ? item.value : "";
  };

  return (
    <footer className="bg-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Little Way Acres</h3>
            <p className="text-gray-600 mb-4">
              Breeding quality livestock with love and care.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              {getContactValue("contact_email") && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <a 
                    href={`mailto:${getContactValue("contact_email")}`}
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {getContactValue("contact_email")}
                  </a>
                </li>
              )}

              {getContactValue("contact_phone") && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <a 
                    href={`tel:${getContactValue("contact_phone")}`} 
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {getContactValue("contact_phone")}
                  </a>
                </li>
              )}

              {getContactValue("contact_address") && (
                <li className="flex gap-2">
                  <MapPin className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">
                    {getContactValue("contact_address")}
                  </span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Little Way Acres. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}