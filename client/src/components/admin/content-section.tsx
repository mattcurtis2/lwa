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
              <Input
                type="text"
                id={field.key}
                value={pendingContent[field.key] || ''}
                onChange={(e) => handleContentChange(field.key, e.target.value)}
                className="mt-1.5"
              />
              {pendingContent[field.key] && (
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