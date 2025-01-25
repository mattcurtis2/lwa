import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { useContentManagement } from "@/hooks/use-content-management";
import { SiteContent, Principle, ContactInfo } from "@db/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ImageCropper from "@/components/ui/image-cropper";

interface ContentField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'image';
}

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
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState("");
  const [currentImageKey, setCurrentImageKey] = useState<string>("");
  const { toast } = useToast();
  const {
    pendingContent: pendingContentFromHook,
    pendingPrinciples,
    pendingContactInfo,
    hasUnsavedChanges,
    handleContentChange,
    handlePrincipleChange,
    handleContactChange
  } = useContentManagement(siteContent, principlesData, contactInfo);

  const handleCropComplete = (croppedUrl: string) => {
    handleContentChange(currentImageKey, croppedUrl);
    setCropperOpen(false);
  };

  const handleImageEdit = (key: string, imageUrl: string) => {
    setCurrentImageKey(key);
    setImageToEdit(imageUrl);
    setCropperOpen(true);
  };

  return (
    <div className="space-y-6">
      <ImageCropper
        imageUrl={imageToEdit}
        onCropComplete={handleCropComplete}
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
      />
      <div className="grid gap-4">
      {/* Principles Title and Description */}
      <div className="border p-4 rounded-lg space-y-4 mb-6">
        <h4 className="font-medium">Principles Section</h4>
        <div>
          <Label htmlFor="principles_title">Section Title</Label>
          <Input
            id="principles_title"
            value={pendingContent["principles_title"] || ""}
            onChange={(e) => handleContentChange("principles_title", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="principles_description">Section Description</Label>
          <Textarea
            id="principles_description"
            value={pendingContent["principles_description"] || ""}
            onChange={(e) => handleContentChange("principles_description", e.target.value)}
          />
        </div>
      </div>

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
              <FileUpload
                value={pendingContent[field.key] || field.value}
                onChange={(url) => {
                  if (typeof url === 'string') {
                    handleImageEdit(field.key, url);
                  }
                }}
              />
              {(pendingContent[field.key] || field.value) && (
                <div className="relative group">
                  <img
                    src={pendingContent[field.key] || field.value}
                    alt="Preview"
                    className="mt-2 rounded-lg max-h-48 object-cover cursor-pointer"
                    onClick={() => handleImageEdit(field.key, pendingContent[field.key] || field.value)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white">Click to crop</p>
                  </div>
                </div>
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
    </div>
  );
}