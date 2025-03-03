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
import { useState } from 'react';
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

  const { data: dogs } = useQuery<(Dog & {
    media?: DogMedia[];
    documents?: Document[];
  })[]>({
    queryKey: ["/api/dogs"],
  });

  const dog = dogs?.find((d) => d.id === dogId);

  if (!dog) {
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