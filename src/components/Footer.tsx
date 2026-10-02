import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onOpenSizeGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenSizeGuide }) => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    try {
      const res = await api.subscribeNewsletter(email);
      setSubscribeStatus(res.message || 'Thank you for joining our luxury circle!');
      setEmail('');
    } catch {
      setSubscribeStatus('Thank you for subscribing to our updates.');
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#231826] text-white pt-16 pb-12 border-t border-[#3A2A3D]">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#3A2A3D]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="flex items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8E1EA2]/20 flex items-center justify-center shrink-0 border border-[#8E1EA2]/40 text-[#ED96D7]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#FFC0C0]">Nationwide Delivery</h4>
              <p className="text-xs text-gray-400 mt-1">Free express shipping across Pakistan on orders over PKR 5,000.</p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8E1EA2]/20 flex items-center justify-center shrink-0 border border-[#8E1EA2]/40 text-[#ED96D7]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#FFC0C0]">14-Day Easy Exchange</h4>
              <p className="text-xs text-gray-400 mt-1">Hassle-free size replacement and returns for guaranteed peace of mind.</p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8E1EA2]/20 flex items-center justify-center shrink-0 border border-[#8E1EA2]/40 text-[#ED96D7]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#FFC0C0]">100% Pure Fabrics</h4>
              <p className="text-xs text-gray-400 mt-1">Authentic combed lawn, pure mulberry silk, and handloom textures.</p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8E1EA2]/20 flex items-center justify-center shrink-0 border border-[#8E1EA2]/40 text-[#ED96D7]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#FFC0C0]">Cash on Delivery</h4>
              <p className="text-xs text-gray-400 mt-1">Pay comfortably at your doorstep or via encrypted bank transfer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-linear-to-tr from-[#8E1EA2] via-[#C654C3] to-[#ED96D7] flex items-center justify-center text-white text-sm font-serif font-bold shadow-xs">
                L
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Ladies Garments Comfort
              </span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Discover elegant everyday fashion designed to make every moment feel beautiful. Engineered with artisanal attention to fit, breathability, and timeless Pakistani craftsmanship.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-[#ED96D7] uppercase tracking-wider mb-2">
                Join Our VIP Circle
              </p>
              <form onSubmit={handleSubscribe} className="flex max-w-sm">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-[#2D2031] text-xs text-white px-3.5 py-2.5 rounded-l-lg border border-[#4A3850] focus:outline-hidden focus:border-[#ED96D7] flex-1 placeholder:text-gray-400"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#8E1EA2] hover:bg-[#751786] text-white px-4 py-2.5 rounded-r-lg text-xs font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? '...' : <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
              {subscribeStatus && (
                <p className="text-[11px] text-[#FFC0C0] mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#ED96D7]" />
                  {subscribeStatus}
                </p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wide text-[#FFC0C0] uppercase mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate('shop', { newArrival: 'true' })} className="hover:text-[#ED96D7] transition-colors">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'luxury-pret' })} className="hover:text-[#ED96D7] transition-colors">
                  Luxury Pret
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'three-piece-suits' })} className="hover:text-[#ED96D7] transition-colors">
                  3-Piece Suits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'two-piece-suits' })} className="hover:text-[#ED96D7] transition-colors">
                  2-Piece Co-Ords
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'kurtis' })} className="hover:text-[#ED96D7] transition-colors">
                  Everyday Kurtis
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'western-wear' })} className="hover:text-[#ED96D7] transition-colors">
                  Western Wear
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'sale' })} className="text-[#ED96D7] font-semibold hover:underline">
                  Seasonal Sale (Up to 40% Off)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wide text-[#FFC0C0] uppercase mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-[#ED96D7] transition-colors">
                  Track Your Order
                </button>
              </li>
              <li>
                <button onClick={onOpenSizeGuide} className="hover:text-[#ED96D7] transition-colors">
                  Size Guide & Measurements
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping-policy')} className="hover:text-[#ED96D7] transition-colors">
                  Shipping & Delivery Info
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('returns-policy')} className="hover:text-[#ED96D7] transition-colors">
                  Return & Exchange Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faqs')} className="hover:text-[#ED96D7] transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#ED96D7] transition-colors">
                  Contact Support & Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wide text-[#FFC0C0] uppercase mb-4">
              Flagship Studio
            </h4>
            <ul className="space-y-3 text-xs text-gray-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#ED96D7] shrink-0 mt-0.5" />
                <span>Plot 42, Main Boulevard, Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#ED96D7] shrink-0" />
                <span>+92 42 3578 9900</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#ED96D7] shrink-0" />
                <span>care@ladiesgarmentscomfort.com</span>
              </li>
              <li className="pt-2">
                <p className="text-[11px] text-gray-400">Hours: Mon - Sat: 10:00 AM - 9:00 PM PKT</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Payments & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#3A2A3D] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <div>
          © {new Date().getFullYear()} Ladies Garments Comfort Pvt Ltd. All rights reserved.
        </div>

        {/* Accepted Payment Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 bg-[#2D2031] rounded text-[10px] border border-[#4A3850] text-gray-300 font-medium">
            Cash on Delivery
          </span>
          <span className="px-2 py-1 bg-[#2D2031] rounded text-[10px] border border-[#4A3850] text-gray-300 font-medium">
            Visa / Mastercard
          </span>
          <span className="px-2 py-1 bg-[#2D2031] rounded text-[10px] border border-[#4A3850] text-gray-300 font-medium">
            Meezan Bank IBAN
          </span>
          <span className="px-2 py-1 bg-[#2D2031] rounded text-[10px] border border-[#4A3850] text-gray-300 font-medium">
            JazzCash / EasyPaisa
          </span>
        </div>
      </div>
    </footer>
  );
};
