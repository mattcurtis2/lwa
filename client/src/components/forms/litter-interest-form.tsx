import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const litterInterestFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  farmName: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  desiredPurpose: z.string().min(1, "Please describe your desired purpose"),
  experience: z.string().optional(),
  currentDogs: z.string().optional(),
  preferredGender: z.string().optional(),
  notes: z.string().optional(),
});

type LitterInterestFormValues = z.infer<typeof litterInterestFormSchema>;

interface LitterInterestFormProps {
  litterId: number;
}

export function LitterInterestForm({ litterId }: LitterInterestFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<LitterInterestFormValues>({
    resolver: zodResolver(litterInterestFormSchema),
    defaultValues: {
      fullName: "",
      farmName: "",
      address: "",
      email: "",
      phone: "",
      desiredPurpose: "",
      experience: "",
      currentDogs: "",
      preferredGender: "",
      notes: "",
    },
  });

  const { mutate: submitForm, isLoading } = useMutation({
    mutationFn: async (data: LitterInterestFormValues) => {
      const res = await fetch("/api/litter-interest-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, litterId }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your interest form has been submitted. We'll be in touch soon!",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: LitterInterestFormValues) {
    submitForm(data);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="lg" className="mt-6">
          Express Interest in this Litter
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Litter Interest Form</SheetTitle>
          <SheetDescription>
            Please fill out this form to express your interest in this litter.
            We'll review your application and get back to you soon.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="farmName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farm Name (if applicable)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your farm name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your complete address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="desiredPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What kind of a dog are you looking for?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your ideal dog and intended purpose (companion, guardian, etc.)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience with Dogs</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about your experience with dogs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentDogs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Dogs</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about any dogs you currently have"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredGender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_preference">No Preference</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information you'd like to share"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Interest Form"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
