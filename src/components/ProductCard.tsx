import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ShoppingCart } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  featured?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductCard({
  product,
  onAddToCart,
  className,
}: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Card
      className={cn(
        "group border-border/50 bg-card overflow-hidden transition-all duration-300 card-elevated",
        className,
      )}
    >
      <div className="product-image-wrap relative aspect-square bg-muted/30">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Discount badge */}
        {discount > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5"
          >
            -{discount}%
          </Badge>
        )}
        {/* Featured badge */}
        {product.featured && !discount && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-primary/90 text-primary-foreground"
          >
            Featured
          </Badge>
        )}
        {/* Quick add button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            size="sm"
            className="h-8 w-8 p-0 rounded-full shadow-lg bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product._id);
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4">
        {/* Category */}
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {product.category}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold leading-tight line-clamp-2 mb-1.5 text-card-foreground">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-1.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-muted-foreground">
              {product.rating}
            </span>
            {product.reviewCount && (
              <span className="text-xs text-muted-foreground/70">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart (mobile) */}
        <Button
          size="sm"
          variant="outline"
          className="w-full mt-3 h-8 text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
          onClick={() => onAddToCart?.(product._id)}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
