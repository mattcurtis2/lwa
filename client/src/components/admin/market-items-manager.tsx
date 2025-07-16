import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, MarketSection } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductForm from "@/components/forms/product-form";

export default function MarketItemsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsSheetOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsSheetOpen(true);
  };

  const handleClose = () => {
    setIsSheetOpen(false);
    setEditingProduct(null);
  };

  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Market Items</CardTitle>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Products List */}
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {product.price || '$0.00'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="mt-2 h-20 w-20 object-cover rounded-md"
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm
              product={editingProduct}
              onClose={handleClose}
              sections={sections}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}