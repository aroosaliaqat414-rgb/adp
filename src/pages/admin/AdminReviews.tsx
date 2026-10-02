import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Check, X, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Review } from '../../types';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const data = await api.getReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.updateReviewStatus(id, status);
      loadReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#231826]">
          Customer Review Moderation
        </h1>
        <p className="text-xs text-[#8E8191]">
          Verify verified customer reviews, photos, and ensure compliance before storefront display
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#EFE6EE] overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#FCFAF8] text-[#8E8191] uppercase text-[10px] border-b border-[#EFE6EE]">
            <tr>
              <th className="py-3 px-4">Garment</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Review Content</th>
              <th className="py-3 px-4">Verified Purchase</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE6EE]/60">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-[#FCFAF8]">
                <td className="py-3 px-4 font-semibold text-[#231826] max-w-[180px] truncate">
                  {r.productName}
                </td>
                <td className="py-3 px-4 text-gray-600">{r.userName}</td>
                <td className="py-3 px-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <p className="font-bold text-[#231826] line-clamp-1">{r.title}</p>
                  <p className="text-[#5A4E5C] text-[11px] line-clamp-2 mt-0.5">{r.comment}</p>
                  {r.images && r.images.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {r.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-8 h-8 rounded object-cover" />
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  {r.isVerifiedPurchase ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Buyer</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Unverified</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : r.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'approved')}
                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs"
                    title="Approve"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'rejected')}
                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs"
                    title="Reject"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
