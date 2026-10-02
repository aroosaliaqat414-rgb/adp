import React, { useState } from 'react';
import { X, Star, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess
}) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide your honest feedback.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createReview({
        productId,
        rating,
        title: title.trim() || 'Verified Purchase Experience',
        comment: comment.trim(),
        images: imageUrl ? [imageUrl] : []
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Only verified delivered purchasers can review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-xl font-bold text-[#231826] mb-1">
          Write a Verified Review
        </h3>
        <p className="text-xs text-[#8E8191] mb-6">
          Sharing your experience with <strong>{productName}</strong>
        </p>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-[#231826]">
              Thank You for Your Review!
            </h4>
            <p className="text-xs text-[#5A4E5C]">
              Your verified feedback helps fellow women choose the perfect fit and comfort.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-[#231826] mb-1.5">
                Overall Quality & Comfort Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(rating)}
                    className="p-1 focus:outline-hidden"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#8E1EA2] ml-2">
                  {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Average' : 'Needs Improvement'}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#231826] mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Incredibly soft lawn, perfect drape!"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-[#231826] mb-1">
                Detailed Feedback *
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about the fabric feel, stitching precision, size fit, and how it felt wearing it..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                required
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-semibold text-[#231826] mb-1">
                Garment Photo (Optional Image URL)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Verified Review...' : 'Submit Verified Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
