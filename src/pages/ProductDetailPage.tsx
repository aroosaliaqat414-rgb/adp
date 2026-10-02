import React, { useState, useEffect } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Share2,
  ChevronRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { ReviewModal } from '../components/ReviewModal';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onOpenSizeGuide: () => void;
  onQuickView: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
  onOpenSizeGuide,
  onQuickView
}) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<(Product & { reviews: Review[] }) | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [added, setAdded] = useState<boolean>(false);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'care' | 'delivery'>('description');

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const data = await api.getProductById(productId);
      setProduct(data);
      setSelectedImage(data.images[0] || '');
      const firstAvailable = data.variants?.find(v => v.stockQuantity > 0) || data.variants?.[0] || null;
      setSelectedVariant(firstAvailable);

      // Fetch related products
      const related = await api.getProducts({ category: data.categoryId });
      setRelatedProducts(related.filter(p => p.id !== data.id).slice(0, 4));
    } catch (err) {
      console.error('Failed to load product details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-96 bg-[#F7F3EE] rounded-3xl max-w-xl mx-auto mb-4" />
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAt = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.totalStock;

  const discountPercent = currentCompareAt && currentCompareAt > currentPrice
    ? Math.round(((currentCompareAt - currentPrice) / currentCompareAt) * 100)
    : null;

  const sizes = Array.from(new Set(product.variants?.map(v => v.size) || ['Standard']));
  const colors = Array.from(new Set(product.variants?.map(v => v.color) || ['Standard']));

  const handleSizeChange = (sz: string) => {
    const match = product.variants?.find(
      v => v.size === sz && (selectedVariant ? v.color === selectedVariant.color : true)
    );
    if (match) {
      setSelectedVariant(match);
      if (quantity > match.stockQuantity) setQuantity(Math.max(1, match.stockQuantity));
    }
  };

  const handleColorChange = (clr: string) => {
    const match = product.variants?.find(
      v => v.color === clr && (selectedVariant ? v.size === selectedVariant.size : true)
    );
    if (match) {
      setSelectedVariant(match);
      if (match.image) setSelectedImage(match.image);
    }
  };

  const handleAddToCart = () => {
    if (currentStock <= 0 || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  };

  const handleBuyNow = () => {
    if (currentStock <= 0 || !selectedVariant) return;
    addItem(product, selectedVariant, quantity);
    onNavigate('checkout');
  };

  // Rating breakdown calculation
  const approvedReviews = product.reviews || [];
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  approvedReviews.forEach(r => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-[#8E8191]">
        <button onClick={() => onNavigate('home')} className="hover:text-[#8E1EA2]">Home</button>
        <span>/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-[#8E1EA2]">Catalog</button>
        <span>/</span>
        <button
          onClick={() => onNavigate('shop', { category: product.categoryId })}
          className="hover:text-[#8E1EA2]"
        >
          {product.categoryName || 'Garments'}
        </button>
        <span>/</span>
        <span className="text-[#231826] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Multi-Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 max-h-[620px] pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-28 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-[#F7F3EE] ${
                    selectedImage === img
                      ? 'border-[#8E1EA2] shadow-sm scale-98'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover object-top" />
                </button>
              ))}
            </div>
          )}

          {/* Main Visual with Zoom Focus */}
          <div className="flex-1 relative aspect-3/4 rounded-3xl overflow-hidden bg-[#F7F3EE] border border-[#EFE6EE] shadow-sm group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-110 cursor-zoom-in"
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-[#8E1EA2] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Save {discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Right: Purchasing Details */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#8E8191] mb-1">
                <span className="uppercase tracking-widest font-semibold text-[#8E1EA2]">
                  {product.categoryName}
                </span>
                <span className="font-mono">SKU: {selectedVariant?.sku || product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231826] leading-tight">
                {product.name}
              </h1>

              {/* Star Rating Breakdown Link */}
              <div className="flex items-center gap-2 mt-2 text-xs text-[#8E8191]">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.averageRating) ? 'fill-current' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#231826]">{product.averageRating.toFixed(1)}</span>
                <a href="#reviews" className="hover:text-[#8E1EA2] underline ml-1">
                  ({approvedReviews.length} Verified Customer Reviews)
                </a>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-4 rounded-2xl bg-[#FCFAF8] border border-[#EFE6EE] flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#8E1EA2]">
                  Rs. {currentPrice.toLocaleString()}
                </span>
                {currentCompareAt && currentCompareAt > currentPrice && (
                  <span className="text-base text-gray-400 line-through">
                    Rs. {currentCompareAt.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Tax Inclusive (PKR)
              </span>
            </div>

            {/* Fabric Highlight */}
            <div className="text-xs text-[#5A4E5C]">
              <strong className="text-[#231826]">Fabric:</strong> {product.fabric}
            </div>

            {/* Color Swatches */}
            {colors.length > 0 && colors[0] !== 'Standard' && (
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-[#231826] mb-2">
                  <span>Color: <strong className="text-[#8E1EA2]">{selectedVariant?.color}</strong></span>
                </div>
                <div className="flex gap-2">
                  {colors.map((clr, i) => (
                    <button
                      key={i}
                      onClick={() => handleColorChange(clr)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedVariant?.color === clr
                          ? 'border-[#8E1EA2] bg-[#8E1EA2]/10 text-[#8E1EA2] font-bold'
                          : 'border-[#EFE6EE] text-[#5A4E5C] hover:border-gray-300'
                      }`}
                    >
                      {clr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#231826] mb-2">
                <span>Select Size: <strong className="text-[#8E1EA2]">{selectedVariant?.size}</strong></span>
                <button
                  onClick={onOpenSizeGuide}
                  className="text-[#8E1EA2] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fit Chart</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((sz, i) => {
                  const v = product.variants?.find(variant => variant.size === sz);
                  const isAvailable = v ? v.stockQuantity > 0 : true;

                  return (
                    <button
                      key={i}
                      disabled={!isAvailable}
                      onClick={() => handleSizeChange(sz)}
                      className={`w-12 h-12 rounded-xl text-xs font-bold flex flex-col items-center justify-center border transition-all ${
                        selectedVariant?.size === sz
                          ? 'border-[#8E1EA2] bg-[#8E1EA2] text-white shadow-xs'
                          : isAvailable
                          ? 'border-[#EFE6EE] bg-white text-[#231826] hover:border-[#8E1EA2]'
                          : 'border-dashed border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                      }`}
                    >
                      <span>{sz}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real Stock Status */}
            <div className="text-xs">
              {currentStock > 0 ? (
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock ({currentStock} ready to ship)</span>
                </div>
              ) : (
                <div className="text-red-500 font-semibold">
                  Currently out of stock in this variation
                </div>
              )}
            </div>

            {/* Quantity Stepper & Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#EFE6EE] rounded-xl overflow-hidden bg-[#FCFAF8]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || currentStock <= 0}
                    className="w-10 h-11 text-base font-bold text-[#5A4E5C] hover:bg-gray-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-[#231826]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="w-10 h-11 text-base font-bold text-[#5A4E5C] hover:bg-gray-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="flex-1 h-11 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:bg-gray-300 active:scale-98"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-[#FFC0C0]" />
                      <span>Added to Your Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                    inWishlist
                      ? 'border-[#8E1EA2] bg-[#8E1EA2] text-white'
                      : 'border-[#EFE6EE] text-[#231826] hover:border-[#8E1EA2]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current text-[#FFC0C0]' : ''}`} />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="w-full py-3 bg-[#231826] hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-40 active:scale-98"
              >
                Instant Checkout (Buy Now)
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EFE6EE] text-[11px] text-[#5A4E5C]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8E1EA2]" />
                <span>Express 2-4 Day Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#8E1EA2]" />
                <span>14-Day Free Exchanges</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs (Description, Specs, Care, Shipping) */}
      <section className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-10 shadow-xs">
        <div className="flex border-b border-[#EFE6EE] gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('description')}
            className={`py-2 transition-colors relative ${
              activeTab === 'description'
                ? 'text-[#8E1EA2] border-b-2 border-[#8E1EA2]'
                : 'text-[#8E8191] hover:text-[#231826]'
            }`}
          >
            Product Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`py-2 transition-colors relative ${
              activeTab === 'specifications'
                ? 'text-[#8E1EA2] border-b-2 border-[#8E1EA2]'
                : 'text-[#8E8191] hover:text-[#231826]'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('care')}
            className={`py-2 transition-colors relative ${
              activeTab === 'care'
                ? 'text-[#8E1EA2] border-b-2 border-[#8E1EA2]'
                : 'text-[#8E8191] hover:text-[#231826]'
            }`}
          >
            Care Instructions
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-2 transition-colors relative ${
              activeTab === 'delivery'
                ? 'text-[#8E1EA2] border-b-2 border-[#8E1EA2]'
                : 'text-[#8E8191] hover:text-[#231826]'
            }`}
          >
            Shipping & Return Policy
          </button>
        </div>

        <div className="py-6 text-xs sm:text-sm text-[#5A4E5C] leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-4 max-w-3xl">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FCFAF8] p-4 rounded-2xl border border-[#EFE6EE]">
                  <h4 className="font-semibold text-[#231826] text-xs mb-1">Comfort-Driven Tailoring</h4>
                  <p className="text-xs text-gray-500">
                    Engineered with breathable ease, armhole ease-margins, and non-restrictive waistbands for all-day comfort.
                  </p>
                </div>
                <div className="bg-[#FCFAF8] p-4 rounded-2xl border border-[#EFE6EE]">
                  <h4 className="font-semibold text-[#231826] text-xs mb-1">Authentic Materials</h4>
                  <p className="text-xs text-gray-500">
                    Tested for shrink-resistance, color fastness, and thread longevity in warm and humid conditions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-xl">
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-[#EFE6EE]">
                  <tr className="py-2.5">
                    <td className="py-2 font-semibold text-[#231826] w-1/3">Fabric</td>
                    <td className="py-2 text-[#5A4E5C]">{product.fabric}</td>
                  </tr>
                  {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                    <tr key={idx} className="py-2.5">
                      <td className="py-2 font-semibold text-[#231826] w-1/3">{key}</td>
                      <td className="py-2 text-[#5A4E5C]">{val}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 font-semibold text-[#231826]">SKU Base</td>
                    <td className="py-2 font-mono text-[#5A4E5C]">{product.sku}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3 max-w-xl">
              <p className="font-semibold text-[#231826]">Recommended Care Guidelines:</p>
              <p>{product.careInstructions}</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500 mt-2">
                <li>Wash with like colors in cold water.</li>
                <li>Do not tumble dry; line dry in shade to protect delicate dyes.</li>
                <li>Warm iron on reverse side of embroidery or laces.</li>
              </ul>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="space-y-4 max-w-2xl">
              <h4 className="font-semibold text-[#231826]">Nationwide Delivery Timeline:</h4>
              <p>
                Orders placed in Pakistan are dispatched within 24 hours via TCS Express or Leopards Courier. Major cities (Lahore, Karachi, Islamabad, Rawalpindi) typically arrive within 2-3 business days. Free shipping applies on all orders above PKR 5,000.
              </p>
              <h4 className="font-semibold text-[#231826] pt-2">14-Day Exchange Guarantee:</h4>
              <p>
                Unwashed, unworn garments with original tags intact can be exchanged for any alternate size or style within 14 days of delivery.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews" className="bg-[#FCFAF8] rounded-3xl border border-[#EFE6EE] p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EFE6EE] gap-4">
          <div>
            <span className="text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider">
              Community Ratings
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231826] mt-0.5">
              Verified Customer Reviews
            </h2>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write a Verified Review</span>
          </button>
        </div>

        {/* Rating Breakdown Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-[#EFE6EE]">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-[#EFE6EE] text-center">
            <span className="text-5xl font-serif font-bold text-[#231826]">
              {product.averageRating.toFixed(1)}
            </span>
            <div className="flex text-amber-400 my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.averageRating) ? 'fill-current' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#8E8191]">
              Based on {approvedReviews.length} verified purchases
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-8 space-y-2 flex flex-col justify-center">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingCounts[star] || 0;
              const pct = approvedReviews.length > 0 ? Math.round((count / approvedReviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-medium text-[#5A4E5C] flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-current text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-gray-400 font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-[#EFE6EE] pt-6 space-y-6">
          {approvedReviews.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#8E8191]">
              No reviews yet for this product. Customers who purchase and receive this order can submit the first verified feedback!
            </div>
          ) : (
            approvedReviews.map(rev => (
              <div key={rev.id} className="pt-6 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#ED96D7]/30 text-[#8E1EA2] font-bold text-xs flex items-center justify-center">
                      {rev.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-[#231826]">{rev.userName}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                          <Check className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-PK', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                <h4 className="font-semibold text-xs text-[#231826]">{rev.title}</h4>
                <p className="text-xs text-[#5A4E5C] leading-relaxed">{rev.comment}</p>

                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.images.map((img, i) => (
                      <div key={i} className="w-16 h-20 rounded-lg overflow-hidden border border-[#EFE6EE]">
                        <img src={img} alt="Customer upload" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="pt-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#231826]">
              You May Also Adore
            </h2>
            <button
              onClick={() => onNavigate('shop', { category: product.categoryId })}
              className="text-xs font-semibold text-[#8E1EA2] hover:underline"
            >
              View More in {product.categoryName} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard
                key={rel.id}
                product={rel}
                onNavigate={onNavigate}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </section>
      )}

      {/* Review Modal Trigger */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        productId={product.id}
        productName={product.name}
        onSuccess={fetchProduct}
      />
    </div>
  );
};
