import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";

export default function GoatInterestBanner() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const interestFormLink = siteContent?.find(
    (content) => content.key === "goat_interest_form_link"
  )?.value;

  if (!interestFormLink) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-100 border-y border-emerald-200">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="min-h-[80px] py-4 flex items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
            <div>
              <div className="bg-emerald-200/80 backdrop-blur-sm px-3 py-1 rounded-full text-emerald-800 text-sm font-semibold mb-2 inline-block">
                Interested in Our Goats?
              </div>
              <p className="text-emerald-800">
                Fill out our interest form to get on the list for current and upcoming Nigerian Dwarf goat kids.
              </p>
            </div>
            <div className="sm:ml-4 flex-shrink-0">
              <a
                href={interestFormLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
              >
                Goat Interest Form
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
