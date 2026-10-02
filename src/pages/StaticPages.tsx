import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider">
          Our Heritage & Philosophy
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231826]">
          Style That Feels Like Comfort
        </h1>
        <p className="text-sm text-[#5A4E5C] max-w-2xl mx-auto leading-relaxed">
          Ladies Garments Comfort was founded on a simple realization: Pakistani women shouldn’t have to choose between ethereal high fashion and uncompromised physical ease.
        </p>
      </div>

      <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-lg border border-[#EFE6EE]">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&auto=format&fit=crop&q=80"
          alt="Boutique Workshop"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="p-6 bg-white rounded-3xl border border-[#EFE6EE] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="font-serif text-lg font-bold text-[#231826]">Artisanal Lawn</h3>
          <p className="text-xs text-[#5A4E5C] leading-relaxed">
            We exclusively use 80/80 luxury combed cotton yarns that stay whisper-soft in summer heat without turning transparent or brittle.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-[#EFE6EE] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="font-serif text-lg font-bold text-[#231826]">Ergonomic Tailoring</h3>
          <p className="text-xs text-[#5A4E5C] leading-relaxed">
            Our patterns feature natural armhole depth, relaxed bust allowances, and non-binding waistbands for effortless all-day movement.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-[#EFE6EE] space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="font-serif text-lg font-bold text-[#231826]">Fair Craftsmanship</h3>
          <p className="text-xs text-[#5A4E5C] leading-relaxed">
            Every motif, lace applique, and pearl button is attached with dignified wages in our ethical Lahore atelier.
          </p>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'order' | 'product' | 'return' | 'general'>('order');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ticket = await api.createTicket({
        name,
        email,
        phone,
        subject,
        category,
        message,
        userId: user?.id
      });
      setTicketNumber(ticket.ticketNumber);
      setMessage('');
      setSubject('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider">
          Customer Care & Studio Support
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231826]">
          We Are Here to Assist You
        </h1>
        <p className="text-xs sm:text-sm text-[#5A4E5C] max-w-md mx-auto">
          Need styling advice, size verification, or order dispatch details? Speak directly with our concierge team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Info Column */}
        <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6EE] space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#231826]">Concierge Studio</h3>

          <div className="space-y-4 text-xs text-[#5A4E5C]">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#8E1EA2] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#231826] block">Flagship Atelier</strong>
                <span>Plot 42, Main Boulevard, Gulberg III, Lahore, Pakistan</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#8E1EA2] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#231826] block">Phone & WhatsApp</strong>
                <span>+92 42 3578 9900 / +92 300 1234567</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#8E1EA2] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#231826] block">Direct Email</strong>
                <span>care@ladiesgarmentscomfort.com</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#8E1EA2] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#231826] block">Hours of Operation</strong>
                <span>Monday to Saturday: 10:00 AM – 9:00 PM PKT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Ticket Submission Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6EE]">
          <h3 className="font-serif text-lg font-bold text-[#231826] mb-1">
            Submit a Customer Inquiry Ticket
          </h3>
          <p className="text-xs text-[#8E8191] mb-6">
            Inquiries receive an official ticket ID and priority response from our stylists.
          </p>

          {ticketNumber ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-[#231826]">
                Ticket #{ticketNumber} Created
              </h4>
              <p className="text-xs text-[#5A4E5C]">
                Thank you! Our customer care representative has been notified and will reply shortly.
              </p>
              <button
                onClick={() => setTicketNumber(null)}
                className="mt-4 px-4 py-2 bg-[#8E1EA2] text-white text-xs font-semibold rounded-xl"
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#231826] mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#231826] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#231826] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#231826] mb-1">Topic Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE] bg-white cursor-pointer focus:outline-hidden focus:border-[#8E1EA2]"
                  >
                    <option value="order">Order Tracking & Dispatch</option>
                    <option value="product">Sizing & Custom Tailoring</option>
                    <option value="return">Exchange & Returns</option>
                    <option value="general">General Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#231826] mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Size advice for Gul-e-Maryam suit"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#231826] mb-1">Detailed Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide any order numbers or sizing concerns..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#8E1EA2] hover:bg-[#751786] text-white font-semibold rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Submitting Inquiry...' : 'Submit Support Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FAQsPage: React.FC = () => {
  const faqs = [
    {
      q: 'How long does nationwide delivery take in Pakistan?',
      a: 'Orders are processed within 24 business hours. Deliveries to Lahore, Karachi, Islamabad, and Rawalpindi typically arrive within 2-3 business days. Other regions take 3-5 business days via TCS Express or Leopards Courier.'
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes! Cash on Delivery is available across all cities, towns, and districts in Pakistan with no extra convenience fees.'
    },
    {
      q: 'What is your return and size exchange policy?',
      a: 'We offer an easy 14-day exchange policy. If the size or fit isn’t absolutely perfect, contact our customer support team and we will coordinate an exchange for the correct size.'
    },
    {
      q: 'How do I choose the right size?',
      a: 'Please view our detailed Size Guide on any product page. All our measurements reflect actual garment dimensions with generous margins for comfort and tailoring.'
    },
    {
      q: 'Are the fabrics 100% pure?',
      a: 'Yes. Every fabric is labeled transparently: pure combed lawn, pure raw silk, slub linen, or pure chiffon. We never misrepresent fabric blends.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl font-bold text-[#231826]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-[#8E8191]">
          Everything you need to know about purchasing, shipping, and exchanges.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#EFE6EE] space-y-2 text-xs">
            <h3 className="font-serif font-bold text-sm text-[#231826]">{faq.q}</h3>
            <p className="text-[#5A4E5C] leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6 text-xs text-[#5A4E5C] leading-relaxed">
      <h1 className="font-serif text-3xl font-bold text-[#231826] mb-4">
        Shipping & Delivery Policy
      </h1>
      <p>
        At <strong>Ladies Garments Comfort</strong>, we prioritize prompt, secure, and pristine delivery of every fashion piece.
      </p>
      <h3 className="font-serif text-base font-bold text-[#231826] pt-2">1. Delivery Charges:</h3>
      <p>
        • Orders above <strong>PKR 5,000</strong> receive <strong>FREE Express Delivery</strong> nationwide.<br />
        • Orders below PKR 5,000 are subject to a flat delivery charge of <strong>PKR 250</strong>.
      </p>
      <h3 className="font-serif text-base font-bold text-[#231826] pt-2">2. Courier Partners:</h3>
      <p>
        We partner exclusively with reputable couriers including TCS Express and Leopards Courier Service. Each package is assigned an end-to-end tracking code immediately upon packing.
      </p>
      <h3 className="font-serif text-base font-bold text-[#231826] pt-2">3. Damaged or Tampered Parcels:</h3>
      <p>
        If your parcel appears damaged or opened at delivery, please do not accept it from the courier rider and notify our support hotline immediately.
      </p>
    </div>
  );
};

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6 text-xs text-[#5A4E5C] leading-relaxed">
      <h1 className="font-serif text-3xl font-bold text-[#231826] mb-4">
        14-Day Return & Exchange Policy
      </h1>
      <p>
        Your satisfaction and comfort are paramount. If you are not completely enchanted by your fit or design, we gladly facilitate exchanges.
      </p>
      <h3 className="font-serif text-base font-bold text-[#231826] pt-2">1. Eligibility Criteria:</h3>
      <p>
        • The garment must be unworn, unwashed, and unstitched (if purchased as fabric).<br />
        • All original designer tags, safety seals, and packaging must be intact.<br />
        • Exchange request must be submitted within 14 calendar days of delivery.
      </p>
      <h3 className="font-serif text-base font-bold text-[#231826] pt-2">2. Exchange Process:</h3>
      <p>
        Contact care@ladiesgarmentscomfort.com or call +92 42 3578 9900 with your order number. Our team will assist you in selecting your replacement size.
      </p>
    </div>
  );
};
