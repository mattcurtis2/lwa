import { useQuery } from "@tanstack/react-query";
import { SiteContent, ContactInfo } from "@db/schema";

export default function Footer() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  return (
    <footer className="bg-stone-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Site Navigation Links */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Dogs Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">🐕 Colorado Mountain Dogs</h3>
            <ul className="space-y-2 text-stone-300">
              <li><a href="/dogs" className="hover:text-white transition-colors">Our Dogs</a></li>
              <li><a href="/dogs/breeding-goals" className="hover:text-white transition-colors">Breeding Goals</a></li>
              <li><a href="/dogs/how-to-purchase" className="hover:text-white transition-colors">How to Purchase</a></li>
              <li><a href="/dogs/males" className="hover:text-white transition-colors">Males</a></li>
              <li><a href="/dogs/females" className="hover:text-white transition-colors">Females</a></li>
              <li><a href="/dogs/available" className="hover:text-white transition-colors">Available Dogs</a></li>
              <li><a href="/dogs/litters/current" className="hover:text-white transition-colors">Current Litters</a></li>
              <li><a href="/dogs/litters/future" className="hover:text-white transition-colors">Future Litters</a></li>
              <li><a href="/dogs/litters/past" className="hover:text-white transition-colors">Past Litters</a></li>
            </ul>
          </div>

          {/* Goats Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-green-400">🐐 Nigerian Dwarf Goats</h3>
            <ul className="space-y-2 text-stone-300">
              <li><a href="/goats" className="hover:text-white transition-colors">Our Goats</a></li>
              <li><a href="/goats/males" className="hover:text-white transition-colors">Males</a></li>
              <li><a href="/goats/females" className="hover:text-white transition-colors">Females</a></li>
              <li><a href="/goats/available" className="hover:text-white transition-colors">Available Goats</a></li>
              <li><a href="/goats/litters/current" className="hover:text-white transition-colors">Current Litters</a></li>
              <li><a href="/goats/litters/upcoming" className="hover:text-white transition-colors">Upcoming Litters</a></li>
              <li><a href="/goats/litters/past" className="hover:text-white transition-colors">Past Litters</a></li>
            </ul>
          </div>

          {/* Sheep Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-blue-400">🐑 Katahdin Sheep</h3>
            <ul className="space-y-2 text-stone-300">
              <li><a href="/sheep" className="hover:text-white transition-colors">Our Sheep</a></li>
              <li><a href="/sheep/males" className="hover:text-white transition-colors">Males</a></li>
              <li><a href="/sheep/females" className="hover:text-white transition-colors">Females</a></li>
              <li><a href="/sheep/available" className="hover:text-white transition-colors">Available Sheep</a></li>
            </ul>
          </div>

          {/* Market & Other */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-purple-400">🥖 Market & More</h3>
            <ul className="space-y-2 text-stone-300">
              <li><a href="/market" className="hover:text-white transition-colors font-semibold">Farmers Market</a></li>
              <li><a href="/market/bakery" className="hover:text-white transition-colors">Bakery Items</a></li>
              <li><a href="/market/animal-products" className="hover:text-white transition-colors">Animal Products</a></li>
              <li><a href="/market/apparel" className="hover:text-white transition-colors">Apparel</a></li>
              <li><a href="/gallery" className="hover:text-white transition-colors">Gallery</a></li>
            </ul>
          </div>
        </div>

        {/* Contact & Social */}
        <div className="border-t border-stone-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{getContent("hero_text") || "Little Way Acres"}</h3>
              <p className="text-stone-300">
                {getContent("hero_subtext") || "A family farm dedicated to sustainable agriculture and animal husbandry."}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              {contactInfo ? (
                <>
                  <p className="text-stone-300">Email: {contactInfo?.email || 'littlewayacresmi@gmail.com'}</p>
                  <p className="text-stone-300">Phone: {contactInfo.phone}</p>
                </>
              ) : (
                <p className="text-stone-300">Contact information coming soon</p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {contactInfo?.facebook && (
                  <a 
                    href={contactInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-stone-300 hover:text-white"
                  >
                    Facebook
                  </a>
                )}
                {contactInfo?.instagram && (
                  <a 
                    href={contactInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-stone-300 hover:text-white"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-stone-700 text-center text-stone-400">
          <p>&copy; {new Date().getFullYear()} Little Way Acres. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}