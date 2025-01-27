import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import cn from "classnames";
import { ImageCrop } from "@/components/ui/image-crop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ContentSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("home");
  const [imageToUpload, setImageToUpload] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");

  const { data: pageContent = [] } = useQuery({
    queryKey: ["/api/pages"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ pageId, field, value }: { pageId: number, field: string, value: string }) => {
      const res = await fetch(`/api/pages/${pageId}/fields/${field}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to update field");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "Content updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update content", variant: "destructive" });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageToUpload(result);
      };
      reader.readAsDataURL(file);
    },
  });

  const handleCroppedImage = (croppedImage: string) => {
    if (cropImageUrl) {
      const [pageId, field] = cropImageUrl.split('|');
      updateMutation.mutate({
        pageId: parseInt(pageId),
        field,
        value: croppedImage,
      });
    }
    setShowCropper(false);
    setCropImageUrl("");
  };

  const renderFields = (page: any) => (
    <div className="space-y-4">
      {Object.entries(page.fields).map(([field, value]: [string, any]) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={`${page.id}-${field}`}>{field.replace(/_/g, ' ').toUpperCase()}</Label>
          {field.includes('image') ? (
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
                    onClick={() => {
                      updateMutation.mutate({
                        pageId: page.id,
                        field,
                        value: imageToUpload,
                      });
                      setImageToUpload(null);
                    }}
                  >
                    Upload
                  </Button>
                )}
              </div>
              {value && (
                <div className="relative aspect-video w-full max-w-xl">
                  <img
                    src={value}
                    alt={field}
                    className="rounded-lg object-cover w-full h-full cursor-pointer"
                    onClick={() => {
                      setCropImageUrl(`${page.id}|${field}`);
                      setShowCropper(true);
                    }}
                  />
                </div>
              )}
            </div>
          ) : field.includes('content') || field.includes('description') ? (
            <Textarea
              id={`${page.id}-${field}`}
              value={value || ''}
              onChange={(e) => updateMutation.mutate({
                pageId: page.id,
                field,
                value: e.target.value,
              })}
            />
          ) : (
            <Input
              id={`${page.id}-${field}`}
              value={value || ''}
              onChange={(e) => updateMutation.mutate({
                pageId: page.id,
                field,
                value: e.target.value,
              })}
            />
          )}
        </div>
      ))}
      {showCropper && cropImageUrl && (
        <ImageCrop
          imageUrl={cropImageUrl.split('|')[1]}
          onCropComplete={handleCroppedImage}
          onCancel={() => {
            setShowCropper(false);
            setCropImageUrl("");
          }}
        />
      )}
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            {pageContent.map((page: any) => (
              <TabsTrigger key={page.id} value={page.name.toLowerCase()}>
                {page.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {pageContent.map((page: any) => (
            <TabsContent key={page.id} value={page.name.toLowerCase()}>
              {renderFields(page)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}