import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format, parse, isValid } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dog, DogMedia } from "@db/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, ImageIcon, Upload, Video } from "lucide-react";

const mediaSchema = z.object({
  url: z.string().min(1, "Media URL or file path is required"),
  type: z.enum(["image", "video"]),
  fileName: z.string().optional(),
});

const dogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registrationName: z.string().optional(),
  birthDate: z.string().refine(
    (date) => {
      if (!date) return false;
      const inputDate = parse(date, 'yyyy-MM-dd', new Date());
      return isValid(inputDate) && inputDate <= new Date();
    },
    "Please enter a valid date that is not in the future"
  ),
  gender: z.enum(["male", "female"], {
    required_error: "Please select sex",
  }),
  description: z.string(),
  healthData: z.string().optional(),
  color: z.string().optional(),
  dewclaws: z.string().optional(),
  furLength: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  pedigree: z.string().optional(),
  narrativeDescription: z.string().optional(),
  media: z.array(mediaSchema),
  outsideBreeder: z.boolean().default(false),
});

interface DogDocument {
  id?: number;
  url: string;
  type: "health" | "pedigree";
  name: string;
  mimeType: string;
}

interface DogFormProps {
  dog?: Dog & { media?: DogMedia[]; documents?: DogDocument[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
}

interface DocumentInput {
  url: string;
  type: "health" | "pedigree";
  name: string;
  mimeType: string;
  isNew?: boolean;
}

export default function DogForm({ dog, open, onOpenChange }: DogFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [inputMethod, setInputMethod] = useState<"url" | "upload">("url");
  const [mediaUrl, setMediaUrl] = useState("");
  const [healthDocuments, setHealthDocuments] = useState<DocumentInput[]>([]);
  const [pedigreeDocuments, setPedigreeDocuments] = useState<DocumentInput[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const form = useForm<z.infer<typeof dogSchema>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      registrationName: "",
      birthDate: "",
      gender: "male",
      description: "",
      healthData: "",
      color: "",
      dewclaws: "",
      furLength: "",
      height: "",
      weight: "",
      pedigree: "",
      narrativeDescription: "",
      media: [],
      outsideBreeder: false,
    },
  });

  useEffect(() => {
    if (dog) {
      const birthDate = new Date(dog.birthDate);
      form.reset({
        ...dog,
        birthDate: format(birthDate, 'yyyy-MM-dd'),
      });

      const media = dog.media?.map(m => ({
        url: m.url,
        type: m.type as "image" | "video",
        isNew: false,
      })) || [];

      const docs = dog.documents || [];
      const healthDocs = docs
        .filter(d => d.type === 'health')
        .map(d => ({
          url: d.url,
          type: 'health' as const,
          name: d.name,
          mimeType: d.mimeType,
          isNew: false,
        }));

      const pedigreeDocs = docs
        .filter(d => d.type === 'pedigree')
        .map(d => ({
          url: d.url,
          type: 'pedigree' as const,
          name: d.name,
          mimeType: d.mimeType,
          isNew: false,
        }));

      setHealthDocuments(healthDocs);
      setPedigreeDocuments(pedigreeDocs);
      setMediaInputs(media);
    }
  }, [dog, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof dogSchema>) => {
      try {
        const formattedValues = {
          ...values,
          birthDate: values.birthDate,
          height: values.height ? parseFloat(values.height) : null,
          weight: values.weight ? parseFloat(values.weight) : null,
          documents: [
            ...healthDocuments.map(doc => ({
              ...doc,
              type: 'health' as const,
            })),
            ...pedigreeDocuments.map(doc => ({
              ...doc,
              type: 'pedigree' as const,
            }))
          ]
        };

        const res = await fetch(dog ? `/api/dogs/${dog.id}` : "/api/dogs", {
          method: dog ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedValues),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', errorText);
          throw new Error(errorText);
        }

        return res.json();
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
      toast({
        title: "Success",
        description: `Dog ${dog ? "updated" : "created"} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';

      const newMedia = {
        url: data.url,
        type: fileType,
        fileName: file.name,
        isNew: true,
      };

      const newInputs = [newMedia, ...mediaInputs];
      setMediaInputs(newInputs);
      form.setValue("media", newInputs);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setShowAddMedia(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddMedia = () => {
    if (inputMethod === "url") {
      if (!mediaUrl) {
        toast({
          title: "Error",
          description: "Please enter a URL",
          variant: "destructive",
        });
        return;
      }

      const newMedia = {
        url: mediaUrl,
        type: mediaType,
        fileName: mediaUrl.split('/').pop(),
        isNew: true,
      };

      const newInputs = [newMedia, ...mediaInputs];
      setMediaInputs(newInputs);
      form.setValue("media", newInputs);
      setShowAddMedia(false);
      setMediaUrl("");
    } else {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = mediaType === 'image' ? 'image/*' : 'video/*';
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleFileUpload(file);
        }
      };
      fileInput.click();
    }
  };

  const removeMediaInput = (index: number) => {
    const newInputs = [...mediaInputs];
    newInputs.splice(index, 1);
    setMediaInputs(newInputs);
    form.setValue("media", newInputs);
  };

  const handleDocumentUpload = async (file: File, type: 'health' | 'pedigree') => {
    setIsUploadingDoc(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      const newDoc = {
        url: data.url,
        type,
        name: file.name,
        mimeType: file.type,
        isNew: true,
      };

      if (type === 'health') {
        setHealthDocuments(prev => [newDoc, ...prev]);
      } else {
        setPedigreeDocuments(prev => [newDoc, ...prev]);
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const removeDocument = (index: number, type: 'health' | 'pedigree') => {
    if (type === 'health') {
      setHealthDocuments(prev => prev.filter((_, i) => i !== index));
    } else {
      setPedigreeDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const DocumentList = ({ documents, type }: { documents: DocumentInput[], type: 'health' | 'pedigree' }) => (
    <div className="space-y-2">
      {documents.map((doc, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg ${doc.isNew ? 'bg-primary/5 border border-primary/20' : 'bg-muted'}`}
        >
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">{doc.mimeType}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeDocument(index, type)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[95vw] sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{dog ? "Edit Dog" : "Add New Dog"}</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6 pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="registrationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <label htmlFor="male" className="flex items-center gap-1">
                          Male <span className="text-blue-500">♂</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <label htmlFor="female" className="flex items-center gap-1">
                          Female <span className="text-pink-500">♀</span>
                        </label>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outsideBreeder"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Outside Breeder</FormLabel>
                      <FormDescription>
                        Mark this if the dog is from an outside breeding program
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Pictures & Videos</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddMedia(true)}
                    disabled={isUploading}
                  >
                    Add Media
                  </Button>
                </div>

                <div className="space-y-4">
                  {mediaInputs.map((input, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${input.isNew ? 'bg-primary/5 border border-primary/20' : 'bg-muted'}`}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 relative shrink-0">
                          {input.type === 'image' ? (
                            <img
                              src={input.url}
                              alt="Preview"
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <video
                              src={input.url}
                              className="w-full h-full object-cover rounded"
                              controls
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {input.fileName || input.url.split('/').pop()}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={input.url}>
                            {input.url}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeMediaInput(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              <FormField
                control={form.control}
                name="narrativeDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Narrative Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detailed description of the dog's personality, training, and characteristics" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., White with brown markings" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (inches)</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="furLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fur Length</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Medium length, double coat" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dewclaws"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dewclaws</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Removed, Natural" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Health certifications, testing results, etc." />
                    </FormControl>
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-sm text-muted-foreground">Health Documents</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleDocumentUpload(file, 'health');
                            };
                            input.click();
                          }}
                          disabled={isUploadingDoc}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingDoc ? "Uploading..." : "Upload Document"}
                        </Button>
                      </div>
                      <DocumentList documents={healthDocuments} type="health" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pedigree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedigree Information</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Family history and lineage information" />
                    </FormControl>
                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <FormLabel className="text-sm text-muted-foreground">Pedigree Documents</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleDocumentUpload(file, 'pedigree');
                            };
                            input.click();
                          }}
                          disabled={isUploadingDoc}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingDoc ? "Uploading..." : "Upload Document"}
                        </Button>
                      </div>
                      <DocumentList documents={pedigreeDocuments} type="pedigree" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 mt-8">
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Sheet open={showAddMedia} onOpenChange={setShowAddMedia}>
        <SheetContent side="bottom" className="h-[90vh] sm:h-auto">
          <SheetHeader>
            <SheetTitle>Add Media</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="text-sm font-medium leading-none">Media Type</div>
              <RadioGroup value={mediaType} onValueChange={(value) => setMediaType(value as "image" | "video")} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <label htmlFor="image">Image</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="video" id="video" />
                  <label htmlFor="video">Video</label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium leading-none">Input Method</div>
              <RadioGroup value={inputMethod} onValueChange={(value) => setInputMethod(value as "url" | "upload")} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="url" />
                  <label htmlFor="url">URL</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="upload" />
                  <label htmlFor="upload">Upload</label>
                </div>
              </RadioGroup>
            </div>

            {inputMethod === "url" && (
              <div className="space-y-2">
                <div className="text-sm font-medium leading-none">Media URL</div>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder={`Enter ${mediaType} URL`}
                />
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={handleAddMedia} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Add Media"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddMedia(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}