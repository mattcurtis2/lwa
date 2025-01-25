import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useContentManagement } from "@/hooks/use-content-management";
import { ContentField, SiteContent, Principle, ContactInfo } from "@db/schema";
import { useDropzone } from "@react-dropzone/dropzone";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import cn from "classnames";
import { ImageCrop } from "@/components/ImageCrop"; // Assumed component


interface ContentSectionProps {
  siteContent: SiteContent[];
  principlesData: Principle[];
  contactInfo: ContactInfo;
  contentFields: ContentField[];
}

export function ContentSection({
  siteContent,
  principlesData,
  contactInfo,
  contentFields
}: ContentSectionProps) {
  const {
    pendingContent,
    pendingPrinciples,
    pendingContactInfo,
    hasUnsavedChanges,
    handleContentChange,
    handlePrincipleChange,
    handleContactChange
  } = useContentManagement(siteContent, principlesData, contactInfo);

  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        handleContentChange("hero_background", e.target.result as string); // Assumed hero_background is the key
      };
      reader.readAsDataURL(file);
    },
  });


  return (
    <div className="space-y-6">
      {/* Content fields rendering */}
      {contentFields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.type === 'textarea' ? (
            <Textarea
              id={field.key}
              value={pendingContent[field.key] || ''}
              onChange={(e) => handleContentChange(field.key, e.target.value)}
              className="mt-1.5"
            />
          ) : field.type === 'image' ? (
            <div className="mt-1.5 space-y-2">
              {field.key === "hero_background" ? (
                <div className="space-y-4">
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
                  {pendingContent[field.key] && (
                    <div className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={pendingContent[field.key]}
                        alt="Hero Background"
                        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                        onClick={() => {
                          setCropImageUrl(pendingContent[field.key]);
                          setShowCropper(true);
                        }}
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContentChange(field.key, "");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                        onClick={() => {
                          setCropImageUrl(pendingContent[field.key]);
                          setShowCropper(true);
                        }}
                      />
                    </div>
                  )}
                  {showCropper && cropImageUrl && (
                    <ImageCrop
                      imageUrl={cropImageUrl}
                      onCropComplete={(croppedImage) => {
                        handleContentChange(field.key, croppedImage);
                        setShowCropper(false);
                        setCropImageUrl("");
                      }}
                      onCancel={() => {
                        setShowCropper(false);
                        setCropImageUrl("");
                      }}
                    />
                  )}
                </div>
              ) : (
                <div> {/* Placeholder for FileUpload component */}
                  {/*  Implement FileUpload component here if needed */}
                  <Input type="file" onChange={(e) => handleContentChange(field.key, URL.createObjectURL(e.target.files[0]))}/>
                </div>
              )}
              {pendingContent[field.key] && field.key !== "hero_background" && (
                <img
                  src={pendingContent[field.key]}
                  alt="Preview"
                  className="mt-2 rounded-lg max-h-48 object-cover"
                />
              )}
            </div>
          ) : (
            <Input
              id={field.key}
              value={pendingContent[field.key] || ''}
              onChange={(e) => handleContentChange(field.key, e.target.value)}
              className="mt-1.5"
            />
          )}
        </div>
      ))}
    </div>
  );
}