import React from 'react';
import {
  CheckCircle2,
  Package,
  Printer,
  ArrowRight,
  Truck,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onPrintInvoice: (order: Order) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigate,
  onPrintInvoice
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Success Celebration Card */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-8 sm:p-12 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="inline-block text-[11px] font-bold text-[#8E1EA2] uppercase tracking-wider bg-[#8E1EA2]/10 px-3 py-1 rounded-full">
          Order Confirmed & Placed
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#231826]">
          Thank You, {order.customerName}!
        </h1>

        <p className="text-xs sm:text-sm text-[#5A4E5C] max-w-lg mx-auto leading-relaxed">
          We have received your order for <strong>Ladies Garments Comfort</strong>. A confirmation SMS & email have been dispatched with your consignment tracking number.
        </p>

        {/* Essential Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-2xl mx-auto text-left">
          <div className="bg-[#FCFAF8] p-4 rounded-2xl border border-[#EFE6EE]">
            <p className="text-[10px] uppercase font-bold text-[#8E8191]">Order Number</p>
            <p className="font-mono text-sm font-bold text-[#8E1EA2] mt-0.5">{order.orderNumber}</p>
          </div>
          <div className="bg-[#FCFAF8] p-4 rounded-2xl border border-[#EFE6EE]">
            <p className="text-[10px] uppercase font-bold text-[#8E8191]">Tracking Code</p>
            <p className="font-mono text-sm font-bold text-[#231826] mt-0.5">{order.trackingNumber}</p>
          </div>
          <div className="bg-[#FCFAF8] p-4 rounded-2xl border border-[#EFE6EE]">
            <p className="text-[10px] uppercase font-bold text-[#8E8191]">Est. Delivery</p>
            <p className="text-xs font-bold text-emerald-600 mt-0.5">
              {order.courierInfo?.estimatedDelivery || 'Within 2-4 Days'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('track-order', { query: order.trackingNumber })}
            className="px-6 py-3 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Package className="w-4 h-4" />
            <span>Track Order Status</span>
          </button>

          <button
            onClick={() => onPrintInvoice(order)}
            className="px-6 py-3 bg-white hover:bg-[#FCFAF8] text-[#231826] border border-[#EFE6EE] text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-[#8E1EA2]" />
            <span>Print Tax Invoice</span>
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3 text-xs font-semibold text-[#8E1EA2] hover:underline"
          >
            Continue Shopping →
          </button>
        </div>
      </div>

      {/* Order Summary & Shipping Recap */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
          Order Snapshot & Delivery Destination
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Shipping destination */}
          <div className="space-y-2 text-xs text-[#5A4E5C]">
            <div className="flex items-center gap-2 font-bold text-[#231826]">
              <MapPin className="w-4 h-4 text-[#8E1EA2]" />
              <span>Delivery Address</span>
            </div>
            <p className="font-medium text-[#231826]">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.provinceOrState} {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-400">Phone: {order.customerPhone}</p>
          </div>

          {/* Payment recap */}
          <div className="space-y-2 text-xs text-[#5A4E5C]">
            <div className="font-bold text-[#231826]">Payment Details:</div>
            <p className="capitalize">
              Method: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'card' ? 'Online Card' : 'Direct Bank Transfer'}</strong>
            </p>
            <p>
              Status: <span className="font-bold uppercase text-[#8E1EA2]">{order.paymentStatus}</span>
            </p>
            <p className="pt-2 text-sm font-bold text-[#231826]">
              Total Paid / Due: <span className="text-[#8E1EA2]">Rs. {order.total.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Item List */}
        <div className="mt-8 pt-6 border-t border-[#EFE6EE] space-y-3">
          <p className="text-xs font-bold text-[#231826]">Items in Package:</p>
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
                <span className="font-bold font-mono text-[#8E1EA2]">
                  Rs. {it.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
