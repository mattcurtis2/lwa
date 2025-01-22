import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DogsHero, Dog, DogMedia, Litter } from "@db/schema";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";
import { useLocation } from "wouter";
import { formatDisplayDate } from "@/lib/date-utils";

export default function Dogs() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [newHeroImage, setNewHeroImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: heroContent } = useQuery<DogsHero[]>({
    queryKey: ["/api/dogs-hero"],
  });

  const { data: dogs } = useQuery<(Dog & { media?: DogMedia[] })[]>({
    queryKey: ["/api/dogs"],
  });

  const { data: litters } = useQuery<(Litter & { 
    mother: Dog & { media?: DogMedia[] }, 
    father: Dog & { media?: DogMedia[] } 
  })[]>({
    queryKey: ["/api/litters"],
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image");
      return uploadRes.json();
    }
  });

  const updateHeroImage = useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      const res = await fetch(`/api/dogs-hero/${heroContent?.[0]?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: url }),
      });
      if (!res.ok) throw new Error("Failed to update hero image");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs-hero"] });
      setIsEditingHero(false);
      setNewHeroImage("");
      setImageFile(null);
      toast({
        title: "Success",
        description: "Hero image updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hero image",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (imageFile) {
        const uploadResult = await uploadImage.mutateAsync(imageFile);
        await updateHeroImage.mutateAsync({ url: uploadResult.url });
      } else if (newHeroImage) {
        await updateHeroImage.mutateAsync({ url: newHeroImage });
      } else {
        toast({
          title: "Error",
          description: "Please provide an image file or URL",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading/updating hero image:', error);
      toast({
        title: "Error",
        description: "Failed to update hero image",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hero = heroContent?.[0];
  const visibleLitter = litters?.find(litter => litter.isVisible);

  const females = dogs?.filter(dog => dog.gender === 'female' && !dog.outsideBreeder) || [];
  const males = dogs?.filter(dog => dog.gender === 'male' && !dog.outsideBreeder) || [];
  const motherDog = dogs?.find(dog => dog.id === visibleLitter?.mother?.id);
  const fatherDog = dogs?.find(dog => dog.id === visibleLitter?.father?.id);

  return (
    <div className="w-full">
      <div 
        className="relative h-[500px] bg-cover bg-center"
        style={{ backgroundImage: `url(${hero?.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 h-full flex items-center justify-between">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">
              {hero?.title || "Colorado Mountain Dogs"}
            </h1>
            <p className="text-xl">
              {hero?.subtitle || "Loyal guardians bred for livestock protection"}
            </p>
          </div>
          {window.location.pathname.includes('/admin') && (
            <Dialog open={isEditingHero} onOpenChange={setIsEditingHero}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/90 hover:bg-white">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Hero Image</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleImageUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="file">Upload Image</Label>
                    <Input
                      id="file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setNewHeroImage("");
                        }
                      }}
                    />
                  </div>
                  <div className="relative">
                    <Label htmlFor="url">Or Enter Image URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newHeroImage}
                      onChange={(e) => {
                        setNewHeroImage(e.target.value);
                        setImageFile(null);
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={(!imageFile && !newHeroImage) || uploadImage.isPending || updateHeroImage.isPending}
                    >
                      {uploadImage.isPending || updateHeroImage.isPending ? "Updating..." : "Update Hero Image"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {visibleLitter && motherDog && fatherDog && (
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-y border-amber-200">
          <div className="container mx-auto px-4">
            <div className="h-[100px] flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-sm font-semibold mb-2">
                    New Litter Coming Soon!
                  </div>
                  <p className="text-amber-800">
                    Expected: <span className="font-semibold">{formatDisplayDate(new Date(visibleLitter.dueDate))}</span>
                  </p>
                </div>

                <div className="flex items-center gap-8">
                  {/* Mother */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {motherDog.profileImageUrl ? (
                        <img 
                          src={motherDog.profileImageUrl} 
                          alt={motherDog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : motherDog.media && motherDog.media.length > 0 ? (
                        <img 
                          src={motherDog.media[0].url} 
                          alt={motherDog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-pink-500">♀</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">{motherDog.name}</p>
                      <p className="text-sm text-amber-700">Mother</p>
                    </div>
                  </div>

                  {/* Father */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {fatherDog.profileImageUrl ? (
                        <img 
                          src={fatherDog.profileImageUrl} 
                          alt={fatherDog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : fatherDog.media && fatherDog.media.length > 0 ? (
                        <img 
                          src={fatherDog.media[0].url} 
                          alt={fatherDog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-blue-500">♂</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-amber-900">{fatherDog.name}</p>
                      <p className="text-sm text-amber-700">Father</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-16 space-y-16">
        {females.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Meet Our Females</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {females.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </div>
        )}

        {males.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Meet Our Males</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {males.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </div>
        )}

        {dogs?.filter(dog => dog.outsideBreeder).length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Breeding Dogs from Outside Farms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dogs
                .filter(dog => dog.outsideBreeder)
                .map((dog) => (
                  <DogCard key={dog.id} dog={dog} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}