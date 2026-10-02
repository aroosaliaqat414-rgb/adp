import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ExternalLink,
  AlertCircle,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';

interface OrderTrackingPageProps {
  initialQuery?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onPrintInvoice: (order: Order) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialQuery,
  onNavigate,
  onPrintInvoice
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const orders = await api.getOrders({ search: queryToSearch.trim() });
      if (orders && orders.length > 0) {
        setOrder(orders[0]);
      } else {
        // Try direct lookup
        const single = await api.getOrderById(queryToSearch.trim());
        setOrder(single);
      }
    } catch {
      setError('No matching order or tracking number found. Please verify your order number (e.g. LGC-2026-1042).');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Placed', desc: 'Received & Queued' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Approved for Processing' },
    { key: 'packed', label: 'Packed & QA', desc: 'In Luxury Box' },
    { key: 'shipped', label: 'Dispatched', desc: 'Handed to Courier' },
    { key: 'delivered', label: 'Delivered', desc: 'Signed & Received' }
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!order) return 'upcoming';
    const statusOrder: OrderStatus[] = [
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out_for_delivery',
      'delivered'
    ];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (order.orderStatus === 'cancelled') return 'cancelled';
    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header & Lookup Form */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-10 shadow-xs text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#8E1EA2]/10 text-[#8E1EA2] mx-auto flex items-center justify-center">
          <Truck className="w-7 h-7" />
        </div>

        <div>
          <h1 className="font-serif text-3xl font-bold text-[#231826]">
            Live Consignment Tracker
          </h1>
          <p className="text-xs text-[#8E8191] mt-1 max-w-md mx-auto">
            Track your luxury garment shipment status across Pakistan using your Order ID (e.g. <strong>LGC-2026-1042</strong>) or Consignment Number.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Enter Order # or Tracking Code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 text-xs px-4 py-3 rounded-xl border border-[#EFE6EE] bg-[#FCFAF8] focus:bg-white focus:outline-hidden focus:border-[#8E1EA2] font-mono"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm active:scale-98"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Track'}</span>
          </button>
        </form>

        {error && (
          <div className="max-w-md mx-auto p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Found Order Result */}
      {order && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Status Header Overview Card */}
          <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EFE6EE] gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8E8191] tracking-wider">
                  Order Details
                </span>
                <h2 className="font-mono text-xl font-bold text-[#8E1EA2] mt-0.5">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  order.orderStatus === 'delivered'
                    ? 'bg-emerald-100 text-emerald-700'
                    : order.orderStatus === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-purple-100 text-[#8E1EA2]'
                }`}>
                  Current Status: {order.orderStatus.replace('_', ' ')}
                </span>
                <button
                  onClick={() => onPrintInvoice(order)}
                  className="p-2 border border-[#EFE6EE] rounded-xl hover:bg-gray-50 text-gray-600"
                  title="Print Invoice"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper Timeline Bar */}
            <div className="py-8">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {statusSteps.map((step, idx) => {
                  const state = getStepStatus(step.key);
                  const isDone = state === 'completed';

                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-[#8E1EA2] text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className={`font-serif text-xs font-bold mt-2 ${
                        isDone ? 'text-[#231826]' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-[#8E8191] mt-0.5">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Dispatch Details */}
            {order.courierInfo && (
              <div className="p-4 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8E8191]">
                    Courier Partner:
                  </span>
                  <p className="font-semibold text-[#231826] mt-0.5">
                    {order.courierInfo.courierName} (Consignment: {order.courierInfo.trackingCode})
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8E8191]">
                      Est. Arrival:
                    </span>
                    <p className="font-bold text-emerald-600">
                      {order.courierInfo.estimatedDelivery}
                    </p>
                  </div>
                  {order.courierInfo.trackingUrl && (
                    <a
                      href={order.courierInfo.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#EFE6EE] text-[#8E1EA2] font-semibold text-[11px] hover:bg-[#8E1EA2] hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Carrier Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Audit Timeline */}
          <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
              Detailed Event Logs
            </h3>

            <div className="pt-6 relative pl-6 border-l-2 border-[#EFE6EE] space-y-6">
              {order.timeline?.map((evt, idx) => (
                <div key={idx} className="relative">
                  {/* Pin Dot */}
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#8E1EA2] border-4 border-white shadow-xs" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <span className="font-bold uppercase text-[#8E1EA2] tracking-wider">
                      {evt.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(evt.timestamp).toLocaleString('en-PK', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A4E5C] mt-1">{evt.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Items In Order */}
          <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
              Articles in Consignment
            </h3>
            <div className="divide-y divide-[#EFE6EE]/60">
              {order.items.map(it => (
                <div key={it.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={it.image} alt="" className="w-12 h-14 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-semibold text-[#231826]">{it.name}</h4>
                      <p className="text-[11px] text-[#8E8191]">
                        {it.size} / {it.color} • Qty: {it.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#8E1EA2]">
                    Rs. {it.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
