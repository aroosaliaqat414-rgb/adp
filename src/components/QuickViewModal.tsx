import React, { useState } from 'react';
import { X, Star, ShoppingBag, Check, ShieldCheck, Ruler } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onOpenSizeGuide: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onNavigate,
  onOpenSizeGuide
}) => {
  if (!product) return null;

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.[0] || {
      id: 'default',
      productId: product.id,
      title: 'Standard',
      size: 'M',
      color: 'Standard',
      sku: product.sku,
      price: product.price,
      stockQuantity: product.totalStock,
      isAvailable: product.totalStock > 0
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const availableSizes = Array.from(new Set(product.variants?.map(v => v.size) || ['Standard']));
  const availableColors = Array.from(new Set(product.variants?.map(v => v.color) || ['Standard']));

  const handleSizeSelect = (size: string) => {
    const match = product.variants?.find(
      v => v.size === size && (v.color === selectedVariant.color || true)
    );
    if (match) {
      setSelectedVariant(match);
      if (quantity > match.stockQuantity) setQuantity(Math.max(1, match.stockQuantity));
    }
  };

  const handleColorSelect = (color: string) => {
    const match = product.variants?.find(
      v => v.color === color && (v.size === selectedVariant.size || true)
    );
    if (match) {
      setSelectedVariant(match);
      if (match.image) setSelectedImage(match.image);
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant.stockQuantity <= 0) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-[#231826] bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery View */}
          <div className="p-6 bg-[#FCFAF8] flex flex-col justify-between">
            <div className="aspect-3/4 rounded-2xl overflow-hidden bg-white shadow-xs mb-4">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === img ? 'border-[#8E1EA2] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Selectors */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8E8191] mb-1">
                <span className="uppercase tracking-wider font-semibold text-[#8E1EA2]">
                  {product.categoryName || 'Garments'}
                </span>
                <span>SKU: {selectedVariant.sku || product.sku}</span>
              </div>

              <h2 className="font-serif text-xl font-bold text-[#231826] mb-2 leading-tight">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs text-[#8E8191] mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.round(product.averageRating) ? 'fill-current' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-[#231826]">{product.averageRating.toFixed(1)}</span>
                <span>({product.reviewCount} customer reviews)</span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-[#8E1EA2]">
                  Rs. {selectedVariant.price.toLocaleString()}
                </span>
                {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                  <span className="text-sm text-gray-400 line-through">
                    Rs. {selectedVariant.compareAtPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#5A4E5C] leading-relaxed mb-4 line-clamp-2">
                {product.shortDescription || product.description}
              </p>

              {/* Color Selection */}
              {availableColors.length > 0 && availableColors[0] !== 'Standard' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs font-medium text-[#231826] mb-2">
                    <span>Color: <strong className="text-[#8E1EA2]">{selectedVariant.color}</strong></span>
                  </div>
                  <div className="flex gap-2">
                    {availableColors.map((clr, i) => (
                      <button
                        key={i}
                        onClick={() => handleColorSelect(clr)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          selectedVariant.color === clr
                            ? 'border-[#8E1EA2] bg-[#8E1EA2]/5 text-[#8E1EA2]'
                            : 'border-[#EFE6EE] text-[#5A4E5C] hover:border-gray-300'
                        }`}
                      >
                        {clr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs font-medium text-[#231826] mb-2">
                  <span>Size: <strong className="text-[#8E1EA2]">{selectedVariant.size}</strong></span>
                  <button
                    onClick={onOpenSizeGuide}
                    className="text-[#8E1EA2] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz, i) => {
                    const variantForSize = product.variants?.find(v => v.size === sz);
                    const isAvailable = variantForSize ? variantForSize.stockQuantity > 0 : true;

                    return (
                      <button
                        key={i}
                        disabled={!isAvailable}
                        onClick={() => handleSizeSelect(sz)}
                        className={`w-10 h-10 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${
                          selectedVariant.size === sz
                            ? 'border-[#8E1EA2] bg-[#8E1EA2] text-white shadow-xs'
                            : isAvailable
                            ? 'border-[#EFE6EE] text-[#231826] hover:border-[#8E1EA2]'
                            : 'border-dashed border-gray-200 text-gray-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Indicator */}
              <div className="text-xs mb-4">
                {selectedVariant.stockQuantity > 0 ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({selectedVariant.stockQuantity} available)
                  </span>
                ) : (
                  <span className="text-red-500 font-medium">Out of stock in selected size</span>
                )}
              </div>
            </div>

            {/* Actions: Quantity + Add to Cart */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#EFE6EE] rounded-xl overflow-hidden bg-[#FCFAF8]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || selectedVariant.stockQuantity <= 0}
                    className="w-9 h-10 text-sm font-bold text-[#5A4E5C] hover:bg-gray-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-semibold text-[#231826]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))}
                    disabled={quantity >= selectedVariant.stockQuantity}
                    className="w-9 h-10 text-sm font-bold text-[#5A4E5C] hover:bg-gray-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add To Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedVariant.stockQuantity <= 0 || added}
                  className="flex-1 h-10 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:bg-gray-300 active:scale-98"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-[#FFC0C0]" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag - Rs. {(selectedVariant.price * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>

              {/* View Full Details Link */}
              <button
                onClick={() => {
                  onClose();
                  onNavigate('product', { id: product.slug || product.id });
                }}
                className="w-full text-center text-xs text-[#8E1EA2] hover:underline font-medium py-1"
              >
                View Full Product Details, Fabric & Reviews →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
