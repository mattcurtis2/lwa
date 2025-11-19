import { useQuery } from "@tanstack/react-query";
import { Dog, DogMedia } from "@db/schema";
import { useLocation } from "wouter";
import { formatAge, formatDisplayDate, parseApiDate } from "@/lib/date-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import DogMediaCarousel from "@/components/cards/dog-media-carousel";
import {
  FileText,
  FileImage,
  FileVideo,
  File,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import DogDetails from "@/components/dog-details";

interface Document {
  id?: number;
  type: string;
  url: string;
  name: string;
  mimeType: string;
}

function DocumentLink({ document }: { document: Document }) {
  const isImage = document.mimeType.startsWith('image/');
  const isVideo = document.mimeType.startsWith('video/');
  const isPdf = document.mimeType === 'application/pdf';

  const getIcon = () => {
    if (isPdf) return <FileText className="h-5 w-5" />;
    if (isImage) return <FileImage className="h-5 w-5" />;
    if (isVideo) return <FileVideo className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {isImage ? (
            <img
              src={document.url}
              alt={document.name}
              className="w-full h-full object-cover"
            />
          ) : isVideo ? (
            <video
              src={document.url}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              {getIcon()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 w-full">
          <h4 className="text-lg font-medium break-words">{document.name}</h4>
          {isPdf && (
            <div className="mt-2">
              <iframe
                src={`${document.url}#toolbar=0&navpanes=0`}
                className="w-full h-64 border rounded"
                title={document.name}
              />
            </div>
          )}
          <div className="mt-2">
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DogDetail() {
  const [location] = useLocation();
  const dogId = parseInt(location.split("/").pop() || "0", 10);

  const { data: dogs, isLoading, error } = useQuery<(Dog & {
    media?: DogMedia[];
    documents?: Document[];
  })[]>({
    queryKey: ["/api/dogs"],
    onSuccess: (data) => console.log('Dogs query successful:', data),
    onError: (err) => console.error('Dogs query error:', err)
  });

  console.log('Current dogId:', dogId);
  console.log('Dogs data:', dogs);

  console.log('DogDetail page - All dogs:', dogs);
  console.log('Looking for dog with ID:', dogId);
  const dog = dogs?.find((d) => d.id === dogId);
  console.log('Found dog:', dog);

  useEffect(() => {
    if (dog) {
      const dogAge = dog.birthDate ? formatAge(parseApiDate(dog.birthDate)) : '';
      const pageTitle = `${dog.name} - ${dog.breed || 'Colorado Mountain Dog'} | Little Way Acres`;
      const pageDescription = dog.description || `Meet ${dog.name}, a ${dogAge} ${dog.gender || ''} ${dog.breed || 'Colorado Mountain Dog'} at Little Way Acres in Hudsonville, Michigan.`;
      const imageUrl = dog.media?.[0]?.url || dog.imageUrl || '/logo.png';

      document.title = pageTitle;

      const updateOrCreateMetaTag = (name: string, content: string) => {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', name);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      };

      const updateOrCreateOGTag = (property: string, content: string) => {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      };

      updateOrCreateMetaTag('description', pageDescription);
      updateOrCreateMetaTag('keywords', `${dog.name}, ${dog.breed || 'Colorado Mountain Dog'}, CMDR, Hudsonville Michigan, livestock guardian dog`);

      updateOrCreateOGTag('og:title', pageTitle);
      updateOrCreateOGTag('og:description', pageDescription);
      updateOrCreateOGTag('og:image', imageUrl);
      updateOrCreateOGTag('og:url', window.location.href);
      updateOrCreateOGTag('og:type', 'article');
      updateOrCreateOGTag('og:site_name', 'Little Way Acres');

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', window.location.href);
    }
  }, [dog]);

  if (!dog) {
    console.log('No dog found with ID:', dogId);
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Dog not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-6xl mx-auto">
        <DogDetails dog={dog} />
      </div>
    </div>
  );
}