import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { useContentManagement } from "@/hooks/use-content-management";
import { ContentField, SiteContent, Principle, ContactInfo } from "@db/schema";

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

  return (
    <div className="space-y-6">
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
                value={pendingContent[field.key] || ''}
                onChange={(url) => handleContentChange(field.key, url)}
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