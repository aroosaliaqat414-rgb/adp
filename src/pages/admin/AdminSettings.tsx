import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Building } from 'lucide-react';
import { api } from '../../services/api';
import { StoreSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-xs">Loading store configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#231826]">
            Store Operational Settings
          </h1>
          <p className="text-xs text-[#8E8191]">
            Configure currency, Pakistan shipping rates, tax rates, and corporate banking
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saved ? 'Saved Successfully!' : 'Save Store Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        {/* Brand & Identity */}
        <div className="bg-white p-6 rounded-3xl border border-[#EFE6EE] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-[#231826] pb-2 border-b">
            Brand Identity
          </h3>

          <div>
            <label className="block font-semibold mb-1">Store Name</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={e => setSettings({ ...settings, storeName: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Brand Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Official Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Phone / WhatsApp Line</label>
            <input
              type="text"
              value={settings.supportPhone}
              onChange={e => setSettings({ ...settings, supportPhone: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Flagship Studio Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={e => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2.5 border rounded-xl"
            />
          </div>
        </div>

        {/* Currency & Logistics */}
        <div className="bg-white p-6 rounded-3xl border border-[#EFE6EE] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-[#231826] pb-2 border-b">
            Logistics & Pakistan Currency Rates
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Currency Code</label>
              <input
                type="text"
                value={settings.currency}
                onChange={e => setSettings({ ...settings, currency: e.target.value })}
                className="w-full p-2.5 border rounded-xl font-mono uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={e => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full p-2.5 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Standard Delivery Fee (PKR)</label>
              <input
                type="number"
                value={settings.standardShippingFee}
                onChange={e => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Free Shipping Threshold (PKR)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={e => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Tax Rate Percentage (%)</label>
              <input
                type="number"
                value={settings.taxRatePercentage}
                onChange={e => setSettings({ ...settings, taxRatePercentage: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Exchange Window (Days)</label>
              <input
                type="number"
                value={settings.returnWindowDays}
                onChange={e => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
                className="w-full p-2.5 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Order Prefix</label>
            <input
              type="text"
              value={settings.orderNumberPrefix}
              onChange={e => setSettings({ ...settings, orderNumberPrefix: e.target.value })}
              className="w-full p-2.5 border rounded-xl font-mono"
            />
          </div>
        </div>

        {/* Bank Details for Direct Bank Transfer */}
        <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-[#EFE6EE] space-y-4 shadow-xs">
          <h3 className="font-serif text-base font-bold text-[#231826] pb-2 border-b flex items-center gap-2">
            <Building className="w-4 h-4 text-[#8E1EA2]" />
            <span>Bank Transfer Settlement Account</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Bank Name</label>
              <input
                type="text"
                value={settings.bankDetails?.bankName}
                onChange={e => setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, bankName: e.target.value }
                })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Account Title</label>
              <input
                type="text"
                value={settings.bankDetails?.accountTitle}
                onChange={e => setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, accountTitle: e.target.value }
                })}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">IBAN (International Account)</label>
              <input
                type="text"
                value={settings.bankDetails?.iban}
                onChange={e => setSettings({
                  ...settings,
                  bankDetails: { ...settings.bankDetails, iban: e.target.value }
                })}
                className="w-full p-2.5 border rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
