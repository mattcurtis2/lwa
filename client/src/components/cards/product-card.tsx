import { Product } from "@db/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function ProductCard({ product, isAdmin, onEdit }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteProduct = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
  });

  return (
    <Card>
      <div className="aspect-square relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1485637701894-09ad422f6de6"}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={product.inStock ? "default" : "secondary"}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-stone-600 mb-2">
          Category: {product.category}
        </p>
        <p className="text-stone-600 mb-2">{product.description}</p>
        <p className="font-bold">{product.price}</p>
      </CardContent>
      {isAdmin && (
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>Edit</Button>
          <Button 
            variant="destructive" 
            onClick={() => deleteProduct.mutate()}
          >
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
