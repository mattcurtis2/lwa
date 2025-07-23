import { Product } from "@db/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart, Plus, Minus, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { isBeforeThursdayNoonEastern, getTimeUntilDeadline, formatDeadline } from "@/lib/date-utils";

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function ProductCard({ product, isAdmin, onEdit }: ProductCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showAddToCartDialog, setShowAddToCartDialog] = useState(false);
  const [, setLocation] = useLocation();

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
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setShowAddToCartDialog(true);
  };

  const handleQuantityChange = (newQuantity: string) => {
    const num = parseInt(newQuantity);
    if (!isNaN(num) && num >= 1) {
      setQuantity(num);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="aspect-square relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1485637701894-09ad422f6de6"}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
        />

      </div>
      <CardContent className="pt-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-stone-600 mb-2">
          Category: {product.category}
        </p>
        <p className="text-stone-600 mb-2 flex-grow">{product.description}</p>
        <p className="font-bold mb-2">{product.price || '$0.00'}</p>
        
        {/* Deadline warning for farmers market orders */}
        {product.availableForPurchase && (
          <div className="mt-2">
            {isBeforeThursdayNoonEastern() ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-2">
                <div className="flex items-center text-green-700 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="font-medium">Pre-order deadline:</span>
                </div>
                <p className="text-green-600 text-xs mt-1">Order by {formatDeadline()} for this week's Saturday pickup</p>
                <p className="text-green-600 text-xs">Time left: {getTimeUntilDeadline()}</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-2">
                <div className="flex items-center text-red-700 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  <span className="font-medium">Pre-order deadline passed</span>
                </div>
                <p className="text-red-600 text-xs mt-1">Order deadline passed for this week's Saturday pickup</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 mt-auto">
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
            isBeforeThursdayNoonEastern() ? (
              <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-16 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full text-gray-500" disabled>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Pre-order Deadline Passed
              </Button>
            )
          ) : (
            <Button variant="outline" className="w-full text-gray-500" disabled>
              Currently Unavailable
            </Button>
          )
        )}
      </CardFooter>

      <Dialog open={showAddToCartDialog} onOpenChange={setShowAddToCartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Added to Cart!</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              {quantity} {product.name}{quantity > 1 ? 's' : ''} added to your cart
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddToCartDialog(false)}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                setShowAddToCartDialog(false);
                setLocation('/cart');
              }}
              className="flex-1"
            >
              Go to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
