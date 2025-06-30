import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ExternalLink } from "lucide-react";
import { Dog, DogMedia, Goat, GoatMedia, CarouselItem, SiteContent, GalleryPhoto } from "@db/schema";

interface PhotoItem {
  id: string;
  url: string;
  title: string;
  category: 'dogs' | 'goats' | 'farm' | 'carousel';
  description?: string;
  animalName?: string;
  animalId?: number;
  date?: string | Date | null;
  linkTo?: string;
  entityType?: 'dog' | 'goat' | 'carousel' | 'site-content' | 'gallery';
}

export default function Gallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'dogs' | 'goats' | 'farm'>('all');

  // Fetch all data sources for photos
  const { data: dogs = [] } = useQuery<(Dog & { media?: DogMedia[] })[]>({
    queryKey: ['/api/dogs'],
  });

  const { data: goats = [] } = useQuery<(Goat & { media?: GoatMedia[] })[]>({
    queryKey: ['/api/goats'],
  });

  const { data: carousel = [] } = useQuery<CarouselItem[]>({
    queryKey: ['/api/carousel'],
  });

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ['/api/site-content'],
  });

  const { data: galleryPhotos = [] } = useQuery<GalleryPhoto[]>({
    queryKey: ['/api/gallery-photos'],
  });

  // Process all photos into a unified format
  const allPhotos: PhotoItem[] = [
    // Dog photos
    ...dogs.flatMap(dog => {
      const photos: PhotoItem[] = [];
      
      // Profile image
      if (dog.profileImageUrl) {
        photos.push({
          id: `dog-profile-${dog.id}`,
          url: dog.profileImageUrl,
          title: dog.name,
          category: 'dogs',
          description: `${dog.name} - ${dog.breed}`,
          animalName: dog.name,
          animalId: dog.id,
          date: dog.updatedAt || dog.createdAt,
          linkTo: `/dogs#${dog.name.toLowerCase().replace(/\s+/g, '-')}`,
          entityType: 'dog',
        });
      }
      
      // Additional media
      if (dog.media) {
        dog.media
          .filter(media => media.type === 'image')
          .forEach((media, index) => {
            photos.push({
              id: `dog-media-${dog.id}-${media.id}`,
              url: media.url,
              title: dog.name,
              category: 'dogs',
              description: `${dog.name} - Photo ${index + 1}`,
              animalName: dog.name,
              animalId: dog.id,
              date: media.createdAt || dog.createdAt,
              linkTo: `/dogs#${dog.name.toLowerCase().replace(/\s+/g, '-')}`,
              entityType: 'dog',
            });
          });
      }
      
      return photos;
    }),
    
    // Goat photos
    ...goats.flatMap(goat => {
      const photos: PhotoItem[] = [];
      
      // Profile image
      if (goat.profileImageUrl) {
        photos.push({
          id: `goat-profile-${goat.id}`,
          url: goat.profileImageUrl,
          title: goat.name,
          category: 'goats',
          description: `${goat.name} - ${goat.breed}`,
          animalName: goat.name,
          animalId: goat.id,
          date: goat.updatedAt || goat.createdAt,
          linkTo: `/goats#${goat.name.toLowerCase().replace(/\s+/g, '-')}`,
          entityType: 'goat',
        });
      }
      
      // Additional media
      if (goat.media) {
        goat.media
          .filter(media => media.type === 'image')
          .forEach((media, index) => {
            photos.push({
              id: `goat-media-${goat.id}-${media.id}`,
              url: media.url,
              title: goat.name,
              category: 'goats',
              description: `${goat.name} - Photo ${index + 1}`,
              animalName: goat.name,
              animalId: goat.id,
              date: media.createdAt || goat.createdAt,
              linkTo: `/goats#${goat.name.toLowerCase().replace(/\s+/g, '-')}`,
              entityType: 'goat',
            });
          });
      }
      
      return photos;
    }),
    
    // Carousel photos
    ...carousel.map(item => ({
      id: `carousel-${item.id}`,
      url: item.imageUrl,
      title: item.title,
      category: 'farm' as const,
      description: item.description,
      date: item.createdAt,
      linkTo: '/',
      entityType: 'carousel' as const,
    })),
    
    // Site content images
    ...siteContent
      .filter(content => content.type === 'image' && content.value)
      .map(content => ({
        id: `site-${content.id}`,
        url: content.value,
        title: content.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'farm' as const,
        description: `Farm image: ${content.key}`,
        date: content.updatedAt,
        linkTo: '/',
        entityType: 'site-content' as const,
      })),

    // Gallery photos
    ...galleryPhotos.map(photo => ({
      id: `gallery-${photo.id}`,
      url: photo.imageUrl,
      title: photo.title,
      category: 'farm' as const,
      description: photo.description || photo.title,
      date: photo.createdAt,
      linkTo: '/gallery',
      entityType: 'gallery' as const,
    })),
  ]
  // Sort by date (newest first)
  .sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  // Filter photos based on active category
  const filteredPhotos = activeCategory === 'all' 
    ? allPhotos 
    : allPhotos.filter(photo => photo.category === activeCategory);

  const openLightbox = (photo: PhotoItem) => {
    const photoIndex = filteredPhotos.findIndex(p => p.id === photo.id);
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(photoIndex);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    
    let newIndex = selectedPhotoIndex;
    if (direction === 'prev') {
      newIndex = selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : filteredPhotos.length - 1;
    } else {
      newIndex = selectedPhotoIndex < filteredPhotos.length - 1 ? selectedPhotoIndex + 1 : 0;
    }
    
    setSelectedPhotoIndex(newIndex);
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  const getCategoryCount = (category: 'all' | 'dogs' | 'goats' | 'farm') => {
    if (category === 'all') return allPhotos.length;
    return allPhotos.filter(photo => photo.category === category).length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-4">Photo Gallery</h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Explore our collection of photos featuring our Colorado Mountain Dogs, Nigerian Dwarf Goats, 
          and life here at Little Way Acres.
        </p>
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as any)} className="mb-8">
        <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto">
          <TabsTrigger value="all" className="text-sm">
            All ({getCategoryCount('all')})
          </TabsTrigger>
          <TabsTrigger value="dogs" className="text-sm">
            Dogs ({getCategoryCount('dogs')})
          </TabsTrigger>
          <TabsTrigger value="goats" className="text-sm">
            Goats ({getCategoryCount('goats')})
          </TabsTrigger>
          <TabsTrigger value="farm" className="text-sm">
            Farm ({getCategoryCount('farm')})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card 
              key={photo.id} 
              className="group cursor-pointer transition-transform hover:scale-105 overflow-hidden"
              onClick={() => openLightbox(photo)}
            >
              <div className="relative aspect-square">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 capitalize"
                >
                  {photo.category === 'farm' ? 'Farm' : photo.category}
                </Badge>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{photo.title}</h3>
                    {photo.date && (
                      <p className="text-xs text-stone-500">
                        {new Date(photo.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {photo.linkTo && (photo.entityType === 'dog' || photo.entityType === 'goat') && (
                    <Link href={photo.linkTo}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-stone-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-stone-500 text-lg">No photos found in this category.</p>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          {selectedPhoto && (
            <>
              <DialogHeader className="p-4 pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl">{selectedPhoto.title}</DialogTitle>
                    {selectedPhoto.description && (
                      <p className="text-stone-600 mt-1">{selectedPhoto.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {selectedPhoto.category === 'farm' ? 'Farm' : selectedPhoto.category}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPhoto(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="relative flex-1 flex items-center justify-center p-4">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="max-w-full max-h-full object-contain"
                />
                
                {/* Navigation Buttons */}
                {filteredPhotos.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      onClick={() => navigatePhoto('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={() => navigatePhoto('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              
              {/* Photo Counter */}
              <div className="p-4 pt-0 text-center">
                <p className="text-sm text-stone-500">
                  {selectedPhotoIndex + 1} of {filteredPhotos.length}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}