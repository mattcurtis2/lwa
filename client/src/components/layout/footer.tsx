import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";

export default function Footer() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  return (
    <footer className="bg-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{getContent("hero_text") || "Little Way Acres"}</h3>
            <p className="text-stone-300">
              {getContent("hero_subtext") || "A family farm dedicated to sustainable agriculture and animal husbandry."}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-stone-300">Email: info@littlewayacres.com</p>
            <p className="text-stone-300">Phone: (555) 123-4567</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-stone-300 hover:text-white">Facebook</a>
              <a href="#" className="text-stone-300 hover:text-white">Instagram</a>
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