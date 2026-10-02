import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Tag,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, PaymentMethod, Address } from '../types';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onNavigate: (page: string) => void;
}

const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Abbottabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Wah Cantt',
  'Gujrat',
  'Kasur',
  'Other City'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderSuccess, onNavigate }) => {
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
    couponError,
    clearCart
  } = useCart();

  const { user, isAuthenticated } = useAuth();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || '');
  const [apartment, setApartment] = useState(user?.addresses?.[0]?.apartment || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || 'Lahore');
  const [provinceOrState, setProvinceOrState] = useState(user?.addresses?.[0]?.provinceOrState || 'Punjab');
  const [postalCode, setPostalCode] = useState(user?.addresses?.[0]?.postalCode || '');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [bankReference, setBankReference] = useState('');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');

  // Processing & Error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#231826]">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-[#8E8191]">
          Please add items to your bag before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 bg-[#8E1EA2] text-white text-xs font-semibold rounded-full shadow-md hover:bg-[#751786]"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      await applyCoupon(couponCodeInput.trim());
      setCouponCodeInput('');
    }
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setCustomerName(addr.fullName);
    setCustomerPhone(addr.phone);
    setStreet(addr.street);
    setApartment(addr.apartment || '');
    setCity(addr.city);
    setProvinceOrState(addr.provinceOrState);
    setPostalCode(addr.postalCode || '');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName || !customerEmail || !customerPhone || !street || !city) {
      setErrorMessage('Please fill in all required shipping and contact details.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        setErrorMessage('Please enter your card number, expiry date, and CVC.');
        return;
      }
    }

    if (paymentMethod === 'bank_transfer') {
      if (!bankReference) {
        setErrorMessage('Please provide your bank transfer deposit reference or transaction ID.');
        return;
      }
    }

    setLoading(true);

    try {
      const shippingAddress: Address = {
        id: `addr_${Date.now()}`,
        fullName: customerName,
        phone: customerPhone,
        street,
        apartment,
        city,
        provinceOrState,
        postalCode,
        country: 'Pakistan',
        isDefault: false
      };

      const orderPayload = {
        userId: user ? user.id : null,
        isGuest: !isAuthenticated,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items,
        couponCode: coupon?.code,
        paymentMethod,
        customerNotes,
        cardDetails: paymentMethod === 'card' ? { cardNumber, cardHolder } : undefined,
        bankReference: paymentMethod === 'bank_transfer' ? bankReference : undefined
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(createdOrder);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please review stock and details.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-[#231826]">
          Secure Checkout
        </h1>
        <p className="text-xs text-[#8E8191] mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#8E1EA2]" />
          <span>256-Bit SSL Encrypted & Verified Order Processing</span>
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Unable to process order:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Shipping & Payment details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer / Saved Address Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6EE]">
              <h2 className="font-serif text-lg font-bold text-[#231826] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#8E1EA2] text-white text-xs font-mono flex items-center justify-center">
                  1
                </span>
                <span>Contact & Delivery Address</span>
              </h2>

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-xs font-semibold text-[#8E1EA2] hover:underline"
                >
                  Sign in for saved addresses
                </button>
              )}
            </div>

            {/* Saved Addresses for Authenticated Users */}
            {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#231826]">Use Saved Address:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        street === addr.street && city === addr.city
                          ? 'border-[#8E1EA2] bg-[#8E1EA2]/5 text-[#231826]'
                          : 'border-[#EFE6EE] hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-[#231826]">{addr.fullName}</div>
                      <div className="text-gray-500 mt-0.5 truncate">{addr.street}, {addr.city}</div>
                      <div className="text-[#8E1EA2] text-[10px] font-semibold mt-1">Select Address</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Aroosa Liaqat"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Email Address (For Order Tracking) *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Mobile Phone Number (For Courier) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Complete Street Address, House / Sector *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. House 42, Street 8, Sector F-8/2"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Apartment / Suite / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={e => setApartment(e.target.value)}
                  placeholder="e.g. Apt 3B, near Mall"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  City (Pakistan) *
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2] bg-white cursor-pointer"
                >
                  {PAKISTAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Province / Region *
                </label>
                <select
                  value={provinceOrState}
                  onChange={e => setProvinceOrState(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2] bg-white cursor-pointer"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                  <option value="Azad Kashmir">Azad Kashmir</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Postal / Zip Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="e.g. 54000"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#231826] mb-1">
                  Delivery Instructions / Order Notes
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="Special instructions for rider, calling before arrival, gate code..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-6">
            <div className="pb-4 border-b border-[#EFE6EE]">
              <h2 className="font-serif text-lg font-bold text-[#231826] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#8E1EA2] text-white text-xs font-mono flex items-center justify-center">
                  2
                </span>
                <span>Payment Method</span>
              </h2>
            </div>

            <div className="space-y-3">
              {/* Cash On Delivery */}
              <label
                className={`flex items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#8E1EA2] bg-[#8E1EA2]/5 shadow-xs'
                    : 'border-[#EFE6EE] hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-[#8E1EA2] mt-1 mr-3.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#231826] flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#8E1EA2]" />
                      <span>Cash on Delivery (COD)</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A4E5C] mt-1 leading-relaxed">
                    Pay safely in cash to the TCS / Leopards courier rider when your garment package is delivered to your doorstep.
                  </p>
                </div>
              </label>

              {/* Online Card Simulation */}
              <label
                className={`flex items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-[#8E1EA2] bg-[#8E1EA2]/5 shadow-xs'
                    : 'border-[#EFE6EE] hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-[#8E1EA2] mt-1 mr-3.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#231826] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#8E1EA2]" />
                      <span>Credit or Debit Card (Visa / Mastercard)</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">3DS Verified</span>
                  </div>
                  <p className="text-[11px] text-[#5A4E5C] mt-1">
                    Pay securely using any local or international debit/credit card with instant confirmation.
                  </p>

                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-4 border-t border-[#ED96D7]/40 space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#231826] mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={e => setCardHolder(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#EFE6EE] bg-white focus:outline-hidden focus:border-[#8E1EA2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#231826] mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="4242 •••• •••• 4242"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#EFE6EE] bg-white font-mono focus:outline-hidden focus:border-[#8E1EA2]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#231826] mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-[#EFE6EE] bg-white font-mono focus:outline-hidden focus:border-[#8E1EA2]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#231826] mb-1">
                            CVC / CVV
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvc}
                            onChange={e => setCardCvc(e.target.value)}
                            placeholder="•••"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-[#EFE6EE] bg-white font-mono focus:outline-hidden focus:border-[#8E1EA2]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Direct Bank Transfer */}
              <label
                className={`flex items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#8E1EA2] bg-[#8E1EA2]/5 shadow-xs'
                    : 'border-[#EFE6EE] hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="accent-[#8E1EA2] mt-1 mr-3.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#231826] flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#8E1EA2]" />
                      <span>Direct Bank Transfer (Meezan Bank IBAN)</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A4E5C] mt-1">
                    Transfer directly from your banking app (Meezan, Alfalah, HBL, JazzCash, etc.) to our corporate account.
                  </p>

                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 pt-4 border-t border-[#ED96D7]/40 space-y-3 bg-[#FCFAF8] p-3.5 rounded-xl text-xs">
                      <div className="text-[11px] text-[#5A4E5C] space-y-1">
                        <p><strong className="text-[#231826]">Bank:</strong> Meezan Bank Limited (Gulberg Lahore)</p>
                        <p><strong className="text-[#231826]">Account Title:</strong> Ladies Garments Comfort Pvt Ltd</p>
                        <p><strong className="text-[#231826]">Account Number:</strong> 02010108945621</p>
                        <p><strong className="text-[#231826]">IBAN:</strong> PK45MEZN0002010108945621</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#231826] mb-1">
                          Deposit Reference Number or Transaction ID *
                        </label>
                        <input
                          type="text"
                          value={bankReference}
                          onChange={e => setBankReference(e.target.value)}
                          placeholder="e.g. FT-9842109 or Sender Account"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#EFE6EE] bg-white focus:outline-hidden focus:border-[#8E1EA2]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Pricing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#EFE6EE] shadow-sm space-y-6 sticky top-28">
            <h3 className="font-serif text-lg font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Line Items Snapshot */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-[#EFE6EE]/60">
              {items.map(it => (
                <div key={it.id} className="pt-3 first:pt-0 flex gap-3 text-xs">
                  <div className="w-14 h-18 rounded-lg overflow-hidden bg-[#FCFAF8] shrink-0 border border-[#EFE6EE]">
                    <img src={it.image} alt="" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-semibold text-[#231826] line-clamp-1">{it.name}</h4>
                      <p className="text-[11px] text-[#8E8191]">Size: {it.size} | Color: {it.color}</p>
                      <p className="text-[11px] text-gray-500">Qty: {it.quantity}</p>
                    </div>
                    <span className="font-bold text-[#8E1EA2]">
                      Rs. {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Coupon Section */}
            <div className="pt-2">
              {coupon ? (
                <div className="flex items-center justify-between bg-[#F8F4EE] border border-[#ED96D7] rounded-xl px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#8E1EA2]" />
                    <span className="font-bold text-[#8E1EA2] uppercase">{coupon.code}</span>
                    <span className="text-[#5A4E5C]">(-Rs. {discountAmount.toLocaleString()})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-[#EFE6EE] uppercase font-mono bg-[#FCFAF8]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-[#231826] text-white text-xs font-semibold rounded-xl hover:bg-[#8E1EA2] transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {couponError}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-[#5A4E5C] pt-4 border-t border-[#EFE6EE]">
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
                <span>Standard Delivery (Pakistan)</span>
                <span className="font-medium text-[#231826]">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-[10px]">Free Shipping</span>
                  ) : (
                    `Rs. ${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#231826] pt-3 border-t border-[#EFE6EE]">
                <span>Total Amount</span>
                <span className="text-[#8E1EA2] text-xl">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-bold rounded-2xl shadow-lg shadow-[#8E1EA2]/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Securing Your Order...</span>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guaranteed Authentic Fabric • Free 14-Day Exchanges</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
