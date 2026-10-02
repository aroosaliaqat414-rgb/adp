import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../types';

interface InvoicePrintModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Actions Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EFE6EE] print:hidden">
          <div className="text-xs font-semibold text-[#8E1EA2] uppercase tracking-wider">
            Official Tax Invoice & Dispatch Slip
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="bg-white p-2 text-[#231826] text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-[#8E1EA2] flex items-center justify-center text-white text-xs font-serif font-bold">
                  L
                </span>
                <span className="font-serif text-xl font-bold text-[#8E1EA2]">
                  Ladies Garments Comfort
                </span>
              </div>
              <p className="text-[11px] text-[#5A4E5C]">Style That Feels Like Comfort</p>
              <p className="text-[10px] text-gray-500 mt-1">Plot 42, Main Boulevard, Gulberg III, Lahore, Pakistan</p>
              <p className="text-[10px] text-gray-500">NTN: 8941203-7 | STRN: 3277876123456</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-[#231826]">INVOICE</span>
              <p className="font-mono text-xs font-semibold text-[#8E1EA2] mt-0.5">
                {order.orderNumber}
              </p>
              <p className="text-[11px] text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              <p className="text-[11px] text-gray-500 font-mono">
                Tracking: {order.trackingNumber}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-2 gap-6 border-b border-gray-200 pb-6 mb-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Billed & Shipped To</p>
              <p className="font-semibold text-sm">{order.customerName}</p>
              <p className="text-gray-600 mt-0.5">{order.shippingAddress.street}</p>
              {order.shippingAddress.apartment && (
                <p className="text-gray-600">{order.shippingAddress.apartment}</p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.provinceOrState} {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600 mt-1">Phone: {order.customerPhone}</p>
              <p className="text-gray-600">Email: {order.customerEmail}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Payment & Dispatch</p>
              <p className="font-semibold capitalize">
                Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod === 'card' ? 'Online Card (Verified)' : 'Bank Transfer'}
              </p>
              <p className="text-gray-600 mt-0.5">
                Payment Status: <strong className="uppercase font-semibold text-[#8E1EA2]">{order.paymentStatus}</strong>
              </p>
              <p className="text-gray-600">
                Fulfillment: <strong className="capitalize">{order.orderStatus}</strong>
              </p>
              <p className="text-gray-600 mt-1">
                Courier: {order.courierInfo?.courierName || 'TCS Express'}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left border-collapse mb-6">
            <thead>
              <tr className="border-b border-gray-300 text-[10px] uppercase text-gray-500">
                <th className="py-2">Item Description</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Variant</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {order.items.map((it, idx) => (
                <tr key={idx} className="py-2">
                  <td className="py-2.5 font-medium">{it.name}</td>
                  <td className="py-2.5 font-mono text-[11px] text-gray-500">{it.sku}</td>
                  <td className="py-2.5 text-gray-600">{it.size} / {it.color}</td>
                  <td className="py-2.5 text-center">{it.quantity}</td>
                  <td className="py-2.5 text-right font-mono">Rs. {it.price.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-bold font-mono">Rs. {it.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div className="flex justify-end border-t border-gray-200 pt-4 mb-6">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span className="font-mono font-medium">-Rs. {order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping Charges:</span>
                <span className="font-mono font-medium">
                  {order.shippingFee === 0 ? 'Free' : `Rs. ${order.shippingFee.toLocaleString()}`}
                </span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span className="font-mono font-medium">Rs. {order.taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-gray-300 pt-2 text-[#231826]">
                <span>Total Payable:</span>
                <span className="font-mono text-[#8E1EA2]">Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-6 border-t border-gray-200 text-[10px] text-gray-400">
            Thank you for shopping with Ladies Garments Comfort. For exchanges or inquiries, please contact care@ladiesgarmentscomfort.com or call +92 42 3578 9900 within 14 days of receipt.
          </div>
        </div>
      </div>
    </div>
  );
};
