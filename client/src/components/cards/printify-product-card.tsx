import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingCart } from "lucide-react";

interface PrintifyVariant {
  id: number;
  price: number;
  is_enabled: boolean;
  title: string;
}

interface PrintifyImage {
  src: string;
  variant_ids: number[];
  position: string;
  is_default: boolean;
}

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: PrintifyImage[];
  visible: boolean;
  is_locked: boolean;
  printifyUrl: string;
  variants: PrintifyVariant[];
}

interface PrintifyProductCardProps {
  product: PrintifyProduct;
}

export default function PrintifyProductCard({ product }: PrintifyProductCardProps) {
  // Get the default/first image
  const defaultImage = product.images.find(img => img.is_default) || product.images[0];
  
  // Get the price range from variants
  const enabledVariants = product.variants.filter(v => v.is_enabled);
  const prices = enabledVariants.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const priceText = minPrice === maxPrice 
    ? `$${minPrice.toFixed(2)}`
    : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {defaultImage && (
          <img
            src={defaultImage.src}
            alt={product.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-stone-800 font-semibold">
            {priceText}
          </Badge>
        </div>
        
        {/* Quick shop button - appears on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => window.open(product.printifyUrl, '_blank')}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shop Now
          </Button>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-stone-800 group-hover:text-primary transition-colors duration-300">
          {product.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {product.description && (
          <p className="text-stone-600 text-sm leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
        
        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{product.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Variants info */}
        <div className="text-sm text-stone-500">
          {enabledVariants.length} variant{enabledVariants.length !== 1 ? 's' : ''} available
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            onClick={() => window.open(product.printifyUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Store
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}