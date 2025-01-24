
import { Router, Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Dogs from "@/pages/dogs";
import DogDetail from "@/pages/dog-detail";
import LitterDetail from "@/pages/litter-detail";
import UpcomingLitters from "@/pages/upcoming-litters";
import PastLitters from "@/pages/past-litters";
import Admin from "@/pages/admin";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import { useEffect } from "react";

function App() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  useEffect(() => {
    // Update favicon
    const faviconUrl = getContent("favicon_url");
    if (faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.setAttribute("href", faviconUrl);
      } else {
        const newFavicon = document.createElement("link");
        newFavicon.rel = "icon";
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }

    // Update title and meta description
    const siteTitle = getContent("site_title");
    const siteDescription = getContent("site_description");
    
    if (siteTitle) {
      document.title = siteTitle;
    }

    if (siteDescription) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", siteDescription);
      } else {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        metaDescription.content = siteDescription;
        document.head.appendChild(metaDescription);
      }
    }

    // Update Open Graph image
    const ogImage = getContent("og_image");
    if (ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]');
      if (ogImageMeta) {
        ogImageMeta.setAttribute("content", ogImage);
      } else {
        ogImageMeta = document.createElement("meta");
        ogImageMeta.setAttribute("property", "og:image");
        ogImageMeta.content = ogImage;
        document.head.appendChild(ogImageMeta);
      }
    }
  }, [siteContent]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dogs" component={Dogs} />
              <Route path="/dog/:id" component={DogDetail} />
              <Route path="/litter/:id" component={LitterDetail} />
              <Route path="/upcoming-litters" component={UpcomingLitters} />
              <Route path="/past-litters" component={PastLitters} />
              <Route path="/admin" component={Admin} />
              <Route path="/login" component={Login} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
