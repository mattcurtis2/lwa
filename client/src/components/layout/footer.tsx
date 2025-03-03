import { useQuery } from '@tanstack/react-query';

interface SiteContent {
  key: string;
  value: string;
}

interface ContactInfo {
  address: string | null;
  phone: string | null;
  email: string | null;
}

function Footer({ siteContent }: { siteContent: SiteContent[] }) {
  const { data: contactData } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  // Use getContent function to get content values
  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  return (
    <footer className="mt-auto bg-stone-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <address className="not-italic">
              <p className="mb-2">{contactData?.address || "Little Way Acres"}</p>
              <p className="mb-2">{contactData?.phone || "(555) 123-4567"}</p>
              <p className="mb-2">
                <a href={`mailto:${contactData?.email || "contact@littlewayacres.com"}`} className="hover:underline">
                  {contactData?.email || "contact@littlewayacres.com"}
                </a>
              </p>
            </address>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">About Us</h3>
            <p>{getContent('aboutUs') || 'Placeholder about us text'}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:underline">Facebook</a>
              <a href="#" className="hover:underline">Instagram</a>
              <a href="#" className="hover:underline">Twitter</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;