import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onNavigate: (page: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    coupon,
    couponError,
    isApplyingCoupon,
    cartOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');

  if (!cartOpen) return null;

  const freeThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeThreshold - (subtotal - discountAmount));
  const freeShippingProgress = Math.min(100, Math.round(((subtotal - discountAmount) / freeThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      const ok = await applyCoupon(couponCodeInput.trim());
      if (ok) setCouponCodeInput('');
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    onNavigate('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EFE6EE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8E1EA2]" />
            <h2 className="font-serif text-lg font-bold text-[#231826]">
              Your Shopping Bag ({itemCount})
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close Shopping Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#F8F4EE] px-5 py-3 border-b border-[#EFE6EE]">
          <div className="flex items-center justify-between text-xs font-medium text-[#231826] mb-1.5">
            <span className="flex items-center gap-1.5 text-[#8E1EA2]">
              <Sparkles className="w-3.5 h-3.5 text-[#C654C3]" />
              {remainingForFreeShipping === 0
                ? 'You unlocked FREE Express Delivery!'
                : `Add Rs. ${remainingForFreeShipping.toLocaleString()} more for FREE Express Delivery`}
            </span>
            <span className="font-bold">{freeShippingProgress}%</span>
          </div>
          <div className="w-full bg-[#EFE6EE] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-linear-to-r from-[#8E1EA2] to-[#ED96D7] h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FCFAF8] border border-[#EFE6EE] flex items-center justify-center text-[#8E8191]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#231826]">Your bag is empty</h3>
              <p className="text-xs text-[#8E8191] max-w-xs">
                Explore our signature lawn, unstitched collections, and luxury pret kurtis.
              </p>
              <button
                onClick={() => {
                  setCartOpen(false);
                  onNavigate('shop');
                }}
                className="px-6 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-full shadow-md transition-colors"
              >
                Shop New Arrivals
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex gap-3.5 p-3 rounded-2xl bg-[#FCFAF8] border border-[#EFE6EE] relative group"
              >
                {/* Image */}
                <div className="w-18 h-24 rounded-xl overflow-hidden bg-white shrink-0 shadow-2xs">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-xs font-semibold text-[#231826] line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8E8191]">
                      <span className="bg-white px-1.5 py-0.5 rounded border border-[#EFE6EE] font-medium text-[#231826]">
                        {item.size}
                      </span>
                      <span>{item.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Stepper */}
                    <div className="flex items-center bg-white border border-[#EFE6EE] rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#5A4E5C] hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#5A4E5C] hover:bg-gray-100 disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-xs font-bold text-[#8E1EA2]">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 transition-colors p-1"
                  aria-label="Remove Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#EFE6EE] bg-white space-y-4">
            {/* Coupon Code Section */}
            <div>
              {coupon ? (
                <div className="flex items-center justify-between bg-[#F8F4EE] border border-[#ED96D7] rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#8E1EA2]" />
                    <div>
                      <span className="font-bold text-[#8E1EA2] uppercase">{coupon.code}</span>
                      <span className="text-[#5A4E5C] ml-1.5">
                        (-Rs. {discountAmount.toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo or Voucher Code (e.g. WELCOME10)"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#EFE6EE] bg-[#FCFAF8] focus:bg-white focus:outline-hidden focus:border-[#8E1EA2] uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                    className="px-4 py-2 bg-[#231826] hover:bg-[#8E1EA2] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {couponError}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#5A4E5C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#231826]">Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping (Pakistan Express)</span>
                <span className="font-medium text-[#231826]">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                  ) : (
                    `Rs. ${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#231826] pt-2 border-t border-[#EFE6EE]">
                <span>Total Amount</span>
                <span className="text-[#8E1EA2] text-base">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCartOpen(false);
                  onNavigate('cart');
                }}
                className="w-full py-2 text-xs font-medium text-[#8E8191] hover:text-[#8E1EA2] transition-colors text-center"
              >
                View Full Bag Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
