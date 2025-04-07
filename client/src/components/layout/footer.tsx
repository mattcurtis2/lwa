import { useQuery } from "@tanstack/react-query";
import { SiteContent, ContactInfo } from "@db/schema";
import { useStyles } from "@/providers/styles-provider";
import { getCssVar } from "@/lib/styles-util";

export default function Footer() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const { styles } = useStyles();

  // Get style values with defaults using getCssVar
  const footerBgColor = getCssVar('footerBgColor', '#1c1917'); // stone-900
  const footerTextColor = getCssVar('footerTextColor', '#ffffff');
  const footerLinkColor = getCssVar('footerLinkColor', '#d6d3d1'); // stone-300
  const footerBorderColor = getCssVar('footerBorderColor', '#44403c'); // stone-700
  const footerCopyrightColor = getCssVar('footerCopyrightColor', '#a8a29e'); // stone-400
  
  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  return (
    <footer style={{ backgroundColor: footerBgColor, color: footerTextColor }}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{getContent("hero_text") || "Little Way Acres"}</h3>
            <p style={{ color: footerLinkColor }}>
              {getContent("hero_subtext") || "A family farm dedicated to sustainable agriculture and animal husbandry."}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            {contactInfo ? (
              <>
                <p style={{ color: footerLinkColor }}>Email: {contactInfo?.email || 'littlewayacresmi@gmail.com'}</p>
                <p style={{ color: footerLinkColor }}>Phone: {contactInfo.phone}</p>
              </>
            ) : (
              <p style={{ color: footerLinkColor }}>Contact information coming soon</p>
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
                  style={{ color: footerLinkColor }}
                  className="hover:text-white"
                >
                  Facebook
                </a>
              )}
              {contactInfo?.instagram && (
                <a 
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer" 
                  style={{ color: footerLinkColor }}
                  className="hover:text-white"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center" style={{ borderTop: `1px solid ${footerBorderColor}`, color: footerCopyrightColor }}>
          <p>&copy; {new Date().getFullYear()} Little Way Acres. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}