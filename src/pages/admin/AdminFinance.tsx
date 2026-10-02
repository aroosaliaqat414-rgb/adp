import React, { useState, useEffect } from 'react';
import { BarChart3, Download, DollarSign, Calendar, TrendingUp, CreditCard } from 'lucide-react';
import { api } from '../../services/api';
import { SalesReport } from '../../types';

export const AdminFinance: React.FC = () => {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [range, setRange] = useState<'today' | '7days' | '30days' | 'month' | 'all'>('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.getReports(range);
        setReport(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range]);

  const handleExportCSV = () => {
    if (!report) return;
    const lines = [
      'Financial BI Report - Ladies Garments Comfort',
      `Period,${range}`,
      `Gross Sales (PKR),${report.grossSales}`,
      `Discounts Given (PKR),${report.totalDiscountGiven}`,
      `Net Product Sales (PKR),${report.netSales}`,
      `Shipping Fees Collected (PKR),${report.totalShippingCollected}`,
      `Tax Collected (PKR),${report.totalTaxCollected}`,
      `Total Net Revenue (PKR),${report.totalRevenue}`,
      `Total Orders Completed,${report.totalOrders}`,
      `Average Order Value (PKR),${report.averageOrderValue}`
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LGC_Financial_Report_${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !report) {
    return <div className="p-12 text-center text-xs">Loading ledger...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#231826]">
            Billing & Financial Intelligence
          </h1>
          <p className="text-xs text-[#8E8191]">
            Revenue reconciliation, net earnings, sales tax, and courier dispatch recoveries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-[#EFE6EE] text-xs">
            {['today', '7days', '30days', 'month', 'all'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize ${
                  range === r ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                {r === '7days' ? '7 Days' : r === '30days' ? '30 Days' : r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Financial CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#8E8191]">Gross Merchandize Value</span>
          <p className="font-serif text-2xl font-bold text-[#231826]">Rs. {report.grossSales.toLocaleString()}</p>
          <span className="text-[10px] text-gray-400">Total catalog order value</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#8E8191]">Promo Discounts Absorbed</span>
          <p className="font-serif text-2xl font-bold text-amber-600">-Rs. {report.totalDiscountGiven.toLocaleString()}</p>
          <span className="text-[10px] text-gray-400">Coupon voucher usage</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#8E8191]">Shipping Fee Recoveries</span>
          <p className="font-serif text-2xl font-bold text-[#231826]">Rs. {report.totalShippingCollected.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600">Express delivery receipts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#8E8191]">Net Realized Revenue</span>
          <p className="font-serif text-2xl font-bold text-[#8E1EA2]">Rs. {report.totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Total Settled / Due</span>
        </div>
      </div>

      {/* Payment Channel Breakdown */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#231826]">
          Collection Channels & Settlement Records
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {report.paymentMethodBreakdown?.map((pm: any, i: number) => (
            <div key={i} className="p-4 rounded-2xl bg-[#FCFAF8] border border-[#EFE6EE] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#8E1EA2]">{pm.method}</span>
              <p className="font-serif text-xl font-bold text-[#231826]">Rs. {pm.total.toLocaleString()}</p>
              <p className="text-gray-500 font-mono">{pm.count} transactions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
