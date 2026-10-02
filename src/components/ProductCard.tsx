import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  onQuickView
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80';
  const secondaryImage = product.images[1] || primaryImage;

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.totalStock === 0) return;
    setIsAdding(true);
    // Find first available variant or pass product
    const availableVariant = product.variants?.find(v => v.stockQuantity > 0) || product.variants?.[0];
    addItem(product, availableVariant, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const availableSizes = Array.from(new Set(product.variants?.map(v => v.size) || []));

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#EFE6EE] hover:border-[#ED96D7] transition-all duration-300 hover:shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onNavigate('product', { id: product.slug || product.id })}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-[#F7F3EE]">
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <span className="bg-[#8E1EA2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#ED96D7] text-[#231826] text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              New Arrival
            </span>
          )}
          {product.isBestSeller && !discountPercent && (
            <span className="bg-[#C654C3] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              Best Seller
            </span>
          )}
          {product.totalStock === 0 && (
            <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            inWishlist
              ? 'bg-[#8E1EA2] text-white shadow-md'
              : 'bg-white/80 hover:bg-white text-[#2D232E] hover:text-[#8E1EA2] shadow-xs'
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-[#FFC0C0]' : ''}`} />
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-[#231826] text-xs font-medium rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-[#8E1EA2]" />
            <span>Quick View</span>
          </button>

          {product.totalStock > 0 && (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="py-2 px-3 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-medium rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
              aria-label="Add to Cart"
            >
              {isAdding ? (
                <Check className="w-4 h-4 text-[#FFC0C0]" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Product Details Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Fabric */}
        <div className="flex items-center justify-between text-[11px] text-[#8E8191] mb-1">
          <span className="uppercase tracking-wider font-medium truncate">
            {product.categoryName || 'Garments'}
          </span>
          <span className="truncate max-w-[120px] text-right text-[10px]">
            {product.fabric.split('&')[0]}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-medium text-sm text-[#231826] line-clamp-1 group-hover:text-[#8E1EA2] transition-colors mb-1.5">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 text-[11px] text-[#8E8191] mb-2.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-medium text-[#231826]">{product.averageRating.toFixed(1)}</span>
          <span>({product.reviewCount || 0})</span>
        </div>

        {/* Price & Sizes */}
        <div className="mt-auto pt-2 border-t border-[#EFE6EE]/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-[#8E1EA2]">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                Rs. {product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Size Pills */}
          {availableSizes.length > 0 && (
            <div className="flex items-center gap-1">
              {availableSizes.slice(0, 3).map((sz, i) => (
                <span
                  key={i}
                  className="text-[9px] font-medium text-[#5A4E5C] bg-[#F7F3EE] px-1.5 py-0.5 rounded"
                >
                  {sz}
                </span>
              ))}
              {availableSizes.length > 3 && (
                <span className="text-[9px] text-[#8E8191]">+{availableSizes.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
