import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Mail, ExternalLink, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { HeroBanner } from '../../types';

export const AdminCMS: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; subscribedAt: string }[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [bList, sList] = await Promise.all([
          api.getBanners(),
          api.getNewsletterSubscribers()
        ]);
        setBanners(bList);
        setSubscribers(sList);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleUpdateBanners = async () => {
    try {
      await api.updateBanners(banners);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const addBanner = () => {
    setBanners([
      ...banners,
      {
        id: `banner_${Date.now()}`,
        title: 'New Fashion Edition',
        subtitle: 'Uncompromising luxury and everyday comfort.',
        badge: 'EXCLUSIVE DROP',
        ctaText: 'Shop Collection',
        ctaLink: '/shop',
        imageUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=1600&auto=format&fit=crop&q=80',
        isActive: true
      }
    ]);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#231826]">
            Content Management (CMS) & Audience
          </h1>
          <p className="text-xs text-[#8E8191]">
            Manage storefront hero banners, seasonal spotlights, and email subscribers
          </p>
        </div>

        <button
          onClick={handleUpdateBanners}
          className="px-5 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          {saved ? 'Saved Changes!' : 'Publish CMS Changes'}
        </button>
      </div>

      {/* Hero Banners Editor */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE6EE]">
          <h2 className="font-serif text-lg font-bold text-[#231826]">
            Homepage Hero Banners ({banners.length})
          </h2>
          <button
            onClick={addBanner}
            className="px-3 py-1.5 border border-[#8E1EA2] text-[#8E1EA2] rounded-lg text-xs font-semibold hover:bg-[#8E1EA2] hover:text-white"
          >
            + Add Hero Banner
          </button>
        </div>

        <div className="space-y-6">
          {banners.map((b, i) => (
            <div key={b.id} className="p-5 rounded-2xl bg-[#FCFAF8] border border-[#EFE6EE] space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Headline Text</label>
                  <input
                    type="text"
                    value={b.title}
                    onChange={e => {
                      const updated = [...banners];
                      updated[i].title = e.target.value;
                      setBanners(updated);
                    }}
                    className="w-full p-2 border rounded-xl bg-white font-serif font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Collection Badge</label>
                  <input
                    type="text"
                    value={b.badge || ''}
                    onChange={e => {
                      const updated = [...banners];
                      updated[i].badge = e.target.value;
                      setBanners(updated);
                    }}
                    className="w-full p-2 border rounded-xl bg-white uppercase font-mono text-[11px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold mb-1">Supporting Text</label>
                  <input
                    type="text"
                    value={b.subtitle}
                    onChange={e => {
                      const updated = [...banners];
                      updated[i].subtitle = e.target.value;
                      setBanners(updated);
                    }}
                    className="w-full p-2 border rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    value={b.ctaText}
                    onChange={e => {
                      const updated = [...banners];
                      updated[i].ctaText = e.target.value;
                      setBanners(updated);
                    }}
                    className="w-full p-2 border rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">High-Res Banner Image URL</label>
                  <input
                    type="url"
                    value={b.imageUrl}
                    onChange={e => {
                      const updated = [...banners];
                      updated[i].imageUrl = e.target.value;
                      setBanners(updated);
                    }}
                    className="w-full p-2 border rounded-xl bg-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setBanners(banners.filter((_, idx) => idx !== i))}
                  className="text-red-500 hover:underline text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Banner</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Subscribers List */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#231826] flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#8E1EA2]" />
          <span>VIP Newsletter Subscribers ({subscribers.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase text-[#8E8191] border-b">
              <tr>
                <th className="py-2.5 px-3">Subscriber Email</th>
                <th className="py-2.5 px-3">Date Subscribed</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map(s => (
                <tr key={s.id}>
                  <td className="py-2.5 px-3 font-semibold text-[#231826]">{s.email}</td>
                  <td className="py-2.5 px-3 text-gray-500">
                    {new Date(s.subscribedAt).toLocaleDateString('en-PK')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold">
                      Subscribed (Consent Granted)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
