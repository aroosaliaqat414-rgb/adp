import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Coupon } from '../../types';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState<number>(2000);
  const [maxDiscount, setMaxDiscount] = useState<number>(2000);
  const [usageLimit, setUsageLimit] = useState<number>(500);
  const [description, setDescription] = useState('');

  const loadCoupons = async () => {
    try {
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code,
        type,
        value: Number(value),
        minOrderAmount: Number(minOrder) || undefined,
        maxDiscountAmount: type === 'percentage' ? Number(maxDiscount) || undefined : undefined,
        usageLimit: Number(usageLimit) || undefined,
        description
      });
      setModalOpen(false);
      setCode('');
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this promotion?')) return;
    try {
      await api.deleteCoupon(id);
      loadCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#231826]">
            Discounts & Promotional Vouchers
          </h1>
          <p className="text-xs text-[#8E8191]">
            Create percentage discounts, fixed PKR credits, and seasonal campaign codes
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map(cpn => (
          <div key={cpn.id} className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-bold text-[#8E1EA2] bg-[#8E1EA2]/10 px-3 py-1 rounded-xl">
                {cpn.code}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                cpn.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {cpn.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div>
              <p className="text-sm font-bold text-[#231826]">
                {cpn.type === 'percentage' ? `${cpn.value}% Off Entire Order` : `Flat Rs. ${cpn.value.toLocaleString()} Off`}
              </p>
              <p className="text-xs text-gray-500 mt-1">{cpn.description}</p>
            </div>

            <div className="text-[11px] text-[#5A4E5C] pt-2 border-t border-[#EFE6EE] space-y-1">
              {cpn.minOrderAmount && (
                <p>Min Order: <strong className="font-mono">Rs. {cpn.minOrderAmount.toLocaleString()}</strong></p>
              )}
              <p>Redeemed: <strong className="font-mono text-[#8E1EA2]">{cpn.usageCount} times</strong> {cpn.usageLimit ? `/ ${cpn.usageLimit} limit` : ''}</p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => handleDelete(cpn.id)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#231826]">Create Promotion Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Coupon Code (e.g. SUMMER20) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Value ({type === 'percentage' ? '%' : 'PKR'}) *</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={e => setValue(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Min Order Amount (PKR)</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={e => setMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={e => setUsageLimit(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Campaign Note</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. 10% off for first-time shoppers"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#8E1EA2] text-white rounded-xl font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
