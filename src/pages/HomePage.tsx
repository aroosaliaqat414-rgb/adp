import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onQuickView: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickView }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, products] = await Promise.all([
          api.getCategories(),
          api.getProducts()
        ]);
        setCategories(cats);
        setNewArrivals(products.filter(p => p.isNewArrival).slice(0, 4));
        setBestSellers(products.filter(p => p.isBestSeller).slice(0, 4));
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#FCFAF8] via-[#F9F5F1] to-[#FCFAF8] py-12 md:py-20 lg:py-24 border-b border-[#EFE6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EFE6EE] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#8E1EA2]" />
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8E1EA2]">
                  Spring / Summer 2026 Collection
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#231826] leading-[1.12]">
                Style That Feels <br className="hidden sm:inline" />
                <span className="italic font-normal text-[#8E1EA2]">Like Comfort</span>
              </h1>

              <p className="text-sm sm:text-base text-[#5A4E5C] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover elegant everyday fashion designed to make every moment feel beautiful. From pure combed lawn suits to effortlessly chic luxury pret, crafted with timeless Pakistani tailoring.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold tracking-wide shadow-lg shadow-[#8E1EA2]/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('shop', { category: 'luxury-pret' })}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-[#FCFAF8] text-[#231826] border border-[#EFE6EE] text-xs font-semibold tracking-wide shadow-xs transition-colors"
                >
                  Explore Collection
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 border-t border-[#EFE6EE]/70 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#5A4E5C]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#8E1EA2]" />
                  <span>100% Pure Fabrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8E1EA2]" />
                  <span>Express Courier Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span>4.9 / 5 Customer Rating</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80"
                    alt="Luxury Pret Ensemble"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-[#FFC0C0]">
                      Noor-e-Bahar Edition
                    </span>
                    <h3 className="font-serif text-xl font-bold mt-0.5">
                      Pure Raw Silk & Delicate Organza
                    </h3>
                  </div>
                </div>

                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#EFE6EE] hidden sm:flex items-center gap-3.5 max-w-xs animate-in fade-in slide-in-from-bottom-6 duration-300">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#F7F3EE]">
                    <img
                      src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&auto=format&fit=crop&q=80"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8E1EA2] uppercase">Bestseller</span>
                    <p className="text-xs font-semibold text-[#231826] line-clamp-1">Gul-e-Maryam 3-Piece</p>
                    <p className="text-xs text-[#8E1EA2] font-bold mt-0.5">Rs. 8,450</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Departments</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231826]">
              Shop By Category
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-semibold text-[#8E1EA2] hover:text-[#751786] flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.slice(0, 10).map(cat => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', { category: cat.slug })}
              className="group cursor-pointer flex flex-col items-center text-center"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F3EE] mb-3 border border-[#EFE6EE] group-hover:border-[#ED96D7] transition-all duration-300 shadow-xs group-hover:shadow-md">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              </div>
              <h3 className="font-serif text-sm font-semibold text-[#231826] group-hover:text-[#8E1EA2] transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-[#8E8191] mt-0.5">
                {cat.itemCount ? `${cat.itemCount} items` : 'Explore'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Just Dropped</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231826]">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { newArrival: 'true' })}
            className="text-xs font-semibold text-[#8E1EA2] hover:text-[#751786] flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Browse New Additions</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* Promotional Banner Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-[#231826] via-[#3A223E] to-[#8E1EA2] p-8 sm:p-12 md:p-16 text-white shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#ED96D7]/20 border border-[#ED96D7]/30 text-[#FFC0C0] text-[11px] font-bold uppercase tracking-wider">
              Exclusive Welcome Offer
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Enjoy 10% Off Your First Luxury Garment
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Experience the uncompromised softness of pure Pakistani lawn and raw silk pret. Use voucher code <strong className="font-mono text-[#FFC0C0] bg-white/10 px-2 py-0.5 rounded">WELCOME10</strong> at checkout.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="px-8 py-3.5 rounded-full bg-white hover:bg-[#F9F5F1] text-[#231826] text-xs font-bold tracking-wide shadow-md transition-all active:scale-98"
              >
                Shop With Promo Code
              </button>
            </div>
          </div>

          {/* Decorative motif overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=1000&auto=format&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Best-Selling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#231826]">
              Most Loved Pieces
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { bestSeller: 'true' })}
            className="text-xs font-semibold text-[#8E1EA2] hover:text-[#751786] flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Bestsellers</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onNavigate={onNavigate}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="bg-[#F8F4EE] py-16 sm:py-20 border-y border-[#EFE6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider">
              Real Experiences
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#231826] mt-1">
              Loved by Women Across Pakistan
            </h2>
            <p className="text-xs text-[#5A4E5C] mt-2">
              Every design is engineered around one promise: style that never sacrifices physical comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-[#EFE6EE] space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#5A4E5C] leading-relaxed italic">
                "The Gul-e-Maryam 3-piece lawn is extraordinary. I have sensitive skin, and usually formal embroidery scratches. Here, the mulmul lining and pure combed weave felt soft from morning till evening."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ED96D7]/30 flex items-center justify-center font-bold text-[#8E1EA2] text-xs">
                  AL
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#231826]">Aroosa Liaqat</h4>
                  <p className="text-[10px] text-emerald-600 font-medium">Verified Buyer • Islamabad</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-[#EFE6EE] space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#5A4E5C] leading-relaxed italic">
                "Ordered the Raw Silk Kurti for a family dinner. The pearl details and finish are on par with bespoke designer boutiques in Gulberg, but delivered right to Karachi in two days."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ED96D7]/30 flex items-center justify-center font-bold text-[#8E1EA2] text-xs">
                  HS
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#231826]">Hira Shah</h4>
                  <p className="text-[10px] text-emerald-600 font-medium">Verified Buyer • Karachi</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-[#EFE6EE] space-y-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#5A4E5C] leading-relaxed italic">
                "The sizing accuracy is what made me a loyal customer. Using their size guide, the medium trousers fit flawlessly with no tight waistbands or short inseams. Pure everyday comfort."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ED96D7]/30 flex items-center justify-center font-bold text-[#8E1EA2] text-xs">
                  MB
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#231826]">Maira Bukhari</h4>
                  <p className="text-[10px] text-emerald-600 font-medium">Verified Buyer • Lahore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery / Boutique Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center max-w-md mx-auto mb-8">
          <span className="text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider">
            @LadiesGarmentsComfort
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#231826] mt-1">
            Follow Our Fashion Journal
          </h2>
          <p className="text-xs text-[#8E8191] mt-1">
            Tag us in your moments of comfort using #LGCStyle
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xs relative group">
            <img
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-[#8E1EA2]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xs relative group">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-[#8E1EA2]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xs relative group">
            <img
              src="https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&auto=format&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-[#8E1EA2]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>
          <div className="aspect-square rounded-2xl overflow-hidden shadow-xs relative group">
            <img
              src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80"
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-[#8E1EA2]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
