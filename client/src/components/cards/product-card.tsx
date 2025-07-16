import { Product } from "@db/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function ProductCard({ product, isAdmin, onEdit }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { addItem } = useCart();

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

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <Card>
      <div className="aspect-square relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1485637701894-09ad422f6de6"}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Badge variant={product.inStock ? "default" : "secondary"}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
          {product.availableForPurchase && (
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
              Available for Purchase
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-stone-600 mb-2">
          Category: {product.category}
        </p>
        <p className="text-stone-600 mb-2">{product.description}</p>
        <p className="font-bold">{product.price || '$0.00'}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isAdmin ? (
          <>
            <Button variant="outline" onClick={onEdit}>Edit</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteProduct.mutate()}
            >
              Delete
            </Button>
          </>
        ) : (
          product.availableForPurchase ? (
            <Button className="w-full" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Display Only
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
