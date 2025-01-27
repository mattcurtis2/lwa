import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import cn from "classnames";
import { ImageCrop } from "@/components/ui/image-crop";


export default function ContentSection() {
  const { toast } = useToast();
  const [imageToUpload, setImageToUpload] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");

  const { data: siteContent = [], isLoading: siteContentLoading, isError: siteContentError } = useQuery({
    queryKey: ["/api/site-content"],
  });

  const { data: principles = [], isLoading: principlesLoading, isError: principlesError } = useQuery({
    queryKey: ["/api/principles"],
  });

  const { data: contactInfo, isLoading: contactInfoLoading, isError: contactInfoError } = useQuery({
    queryKey: ["/api/contact-info"],
  });

  const contentFields = [
    { key: "hero_title", label: "Hero Title", type: "text" },
    { key: "hero_subtitle", label: "Hero Subtitle", type: "text" },
    { key: "hero_background", label: "Hero Background Image", type: "image" },
    { key: "about_title", label: "About Section Title", type: "text" },
    { key: "about_content", label: "About Section Content", type: "textarea" },
    { key: "contact_title", label: "Contact Section Title", type: "text" },
    { key: "contact_content", label: "Contact Section Content", type: "textarea" },
  ];

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageToUpload(e.target.result as string);
      };
      reader.readAsDataURL(file);
    },
  });

  const handleContentChange = async (key: string, value: string) => {
    try {
      const res = await fetch(`/api/site-content/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) throw new Error("Failed to update content");

      toast({ title: "Content updated successfully" });
    } catch (error) {
      toast({ 
        title: "Failed to update content", 
        variant: "destructive" 
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageToUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = (croppedImage: string) => {
    handleContentChange(cropImageUrl!, croppedImage);
    setShowCropper(false);
    setCropImageUrl("");
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {contentFields.map((field) => {
              const content = siteContent.find(c => c.key === field.key);

              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.key}
                      value={content?.value || ''}
                      onChange={(e) => handleContentChange(field.key, e.target.value)}
                    />
                  ) : field.type === 'image' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div
                          {...getRootProps()}
                          className={cn(
                            "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
                            isDragActive && "border-primary bg-accent"
                          )}
                        >
                          <input {...getInputProps()} />
                          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <Upload className="h-10 w-10" />
                            <p className="text-sm text-center">
                              {isDragActive
                                ? "Drop your image here..."
                                : "Drag & drop an image here, or click to select"
                              }
                            </p>
                          </div>
                        </div>
                        {imageToUpload && (
                          <Button 
                            onClick={() => handleContentChange(field.key, imageToUpload!)}
                          >
                            Upload
                          </Button>
                        )}
                      </div>
                      {content?.value && (
                        <div className="relative aspect-video w-full max-w-xl">
                          <img
                            src={content.value}
                            alt={field.label}
                            className="rounded-lg object-cover w-full h-full cursor-pointer"
                            onClick={() => {
                              setCropImageUrl(content.value);
                              setShowCropper(true);
                            }}
                          />
                          {showCropper && cropImageUrl && (
                            <ImageCrop
                              imageUrl={cropImageUrl}
                              onCropComplete={handleCroppedImage}
                              onCancel={() => {
                                setShowCropper(false);
                                setCropImageUrl("");
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      id={field.key}
                      value={content?.value || ''}
                      onChange={(e) => handleContentChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={contactInfo?.email || ''}
                onChange={(e) => {
                  // TODO: Implement contact info update
                }}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={contactInfo?.phone || ''}
                onChange={(e) => {
                  // TODO: Implement contact info update
                }}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={contactInfo?.address || ''}
                onChange={(e) => {
                  // TODO: Implement contact info update
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Farm Principles</h3>
          <div className="space-y-4">
            {principles.map((principle) => (
              <div key={principle.id} className="space-y-2">
                <Input
                  value={principle.title}
                  onChange={(e) => {
                    // TODO: Implement principles update
                  }}
                  placeholder="Principle title"
                />
                <Textarea
                  value={principle.description}
                  onChange={(e) => {
                    // TODO: Implement principles update
                  }}
                  placeholder="Principle description"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}