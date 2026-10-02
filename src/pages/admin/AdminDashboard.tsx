import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  DollarSign,
  Users,
  ShoppingBag,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { SalesReport, Order } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [range, setRange] = useState<'today' | '7days' | '30days' | 'month' | 'all'>('30days');
  const [report, setReport] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [rep, ords] = await Promise.all([
        api.getReports(range),
        api.getOrders()
      ]);
      setReport(rep);
      setRecentOrders(ords.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [range]);

  if (loading || !report) {
    return (
      <div className="py-20 text-center animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4" />
        <div className="h-48 bg-white rounded-3xl max-w-4xl mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#231826]">
            Business Intelligence & Overview
          </h1>
          <p className="text-xs text-[#8E8191] mt-0.5">
            Real-time transaction and inventory analytics for Ladies Garments Comfort
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-[#EFE6EE] shadow-xs text-xs self-start sm:self-auto">
          {[
            { id: 'today', label: 'Today' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'month', label: 'This Month' },
            { id: 'all', label: 'All Time' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRange(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                range === tab.id
                  ? 'bg-[#8E1EA2] text-white shadow-xs'
                  : 'text-[#5A4E5C] hover:text-[#231826]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#8E8191]">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-[#8E1EA2]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#8E1EA2]">
            Rs. {report.totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Net Sales: Rs. {report.netSales.toLocaleString()}</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#8E8191]">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Orders</span>
            <Package className="w-4 h-4 text-[#C654C3]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#231826]">
            {report.totalOrders}
          </p>
          <span className="text-[11px] text-gray-500">AOV: Rs. {report.averageOrderValue.toLocaleString()}</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#8E8191]">
            <span className="text-[11px] uppercase font-bold tracking-wider">Customers</span>
            <Users className="w-4 h-4 text-[#ED96D7]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#231826]">
            {report.totalCustomers}
          </p>
          <span className="text-[11px] text-[#8E8191]">Registered VIP Accounts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#8E8191]">
            <span className="text-[11px] uppercase font-bold tracking-wider">Catalog Inventory</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#231826]">
            {report.totalProducts}
          </p>
          <div className="flex items-center gap-2 text-[11px]">
            {report.lowStockCount > 0 && (
              <span className="text-amber-600 font-bold">{report.lowStockCount} Low</span>
            )}
            {report.outOfStockCount > 0 && (
              <span className="text-red-500 font-bold">• {report.outOfStockCount} Out</span>
            )}
            {report.lowStockCount === 0 && report.outOfStockCount === 0 && (
              <span className="text-emerald-600 font-medium">All Healthy Stock</span>
            )}
          </div>
        </div>
      </div>

      {/* Operational Order Status Pipeline */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-base font-bold text-[#231826]">
          Fulfillment Pipeline Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE]">
            <span className="text-[10px] uppercase font-bold text-amber-600">Pending</span>
            <p className="text-xl font-bold font-mono text-[#231826] mt-0.5">
              {report.orderStatusCounts?.pending || 0}
            </p>
          </div>
          <div className="p-3 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE]">
            <span className="text-[10px] uppercase font-bold text-[#8E1EA2]">Confirmed</span>
            <p className="text-xl font-bold font-mono text-[#8E1EA2] mt-0.5">
              {report.orderStatusCounts?.confirmed || 0}
            </p>
          </div>
          <div className="p-3 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE]">
            <span className="text-[10px] uppercase font-bold text-indigo-600">Packed</span>
            <p className="text-xl font-bold font-mono text-[#231826] mt-0.5">
              {report.orderStatusCounts?.packed || 0}
            </p>
          </div>
          <div className="p-3 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE]">
            <span className="text-[10px] uppercase font-bold text-blue-600">Dispatched</span>
            <p className="text-xl font-bold font-mono text-[#231826] mt-0.5">
              {report.orderStatusCounts?.shipped || 0}
            </p>
          </div>
          <div className="p-3 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE]">
            <span className="text-[10px] uppercase font-bold text-emerald-600">Delivered</span>
            <p className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
              {report.orderStatusCounts?.delivered || 0}
            </p>
          </div>
          <div className="p-3 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE]">
            <span className="text-[10px] uppercase font-bold text-red-500">Cancelled</span>
            <p className="text-xl font-bold font-mono text-red-500 mt-0.5">
              {report.orderStatusCounts?.cancelled || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Daily Sales Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Revenue Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-[#231826]">
              Daily Revenue Trend
            </h3>
            <span className="text-xs text-[#8E8191]">PKR Sales</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2">
            {report.dailySales?.map((day: any, idx: number) => {
              const maxRev = Math.max(...report.dailySales.map((d: any) => d.revenue), 1000);
              const heightPct = Math.max(8, Math.round((day.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-mono text-[#8E1EA2] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Rs. {day.revenue > 0 ? (day.revenue / 1000).toFixed(1) + 'k' : '0'}
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-linear-to-t from-[#8E1EA2] to-[#ED96D7] rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">
                    {day.date.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#231826]">
            Sales by Category
          </h3>
          <div className="space-y-3 pt-2">
            {report.categorySales?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No category sales in this period.</p>
            ) : (
              report.categorySales?.map((cat: any, i: number) => {
                const totalCatSales = report.categorySales.reduce((s: number, c: any) => s + c.revenue, 0);
                const pct = totalCatSales > 0 ? Math.round((cat.revenue / totalCatSales) * 100) : 0;
                return (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-[#231826]">{cat.categoryName}</span>
                      <span className="font-mono text-[#8E1EA2]">Rs. {cat.revenue.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#EFE6EE] h-2 rounded-full overflow-hidden">
                      <div className="bg-[#8E1EA2] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row: Best-Sellers & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Best-Selling Leaderboard */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFE6EE]">
            <h3 className="font-serif text-base font-bold text-[#231826]">
              Top Selling Garments
            </h3>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-semibold text-[#8E1EA2] hover:underline"
            >
              Manage Products →
            </button>
          </div>

          <div className="divide-y divide-[#EFE6EE]/60 text-xs">
            {report.topSellingProducts?.map((p: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#231826]">{p.name}</h4>
                  <p className="text-[11px] text-[#8E8191] font-mono">SKU: {p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#8E1EA2]">{p.unitsSold} units sold</p>
                  <p className="text-[11px] text-gray-500 font-mono">Rs. {p.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#231826] pb-3 border-b border-[#EFE6EE]">
            Payment Method Split
          </h3>
          <div className="space-y-3 pt-2 text-xs">
            {report.paymentMethodBreakdown?.map((pm: any, i: number) => (
              <div key={i} className="p-3 bg-[#FCFAF8] rounded-2xl border border-[#EFE6EE] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#231826]">{pm.method}</p>
                  <p className="text-[11px] text-gray-500">{pm.count} orders</p>
                </div>
                <span className="font-bold text-[#8E1EA2] font-mono">
                  Rs. {pm.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table with Quick Jump */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE6EE]">
          <h3 className="font-serif text-base font-bold text-[#231826]">
            Recent Orders Activity
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-[#8E1EA2] hover:underline"
          >
            Open All Orders ({report.totalOrders}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase text-[#8E8191] border-b border-[#EFE6EE]">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6EE]/60">
              {recentOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-[#FCFAF8]">
                  <td className="py-3 px-3 font-mono font-bold text-[#8E1EA2]">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold text-[#231826]">{ord.customerName}</p>
                    <p className="text-[10px] text-gray-400">{ord.customerEmail}</p>
                  </td>
                  <td className="py-3 px-3 text-gray-600">{ord.shippingAddress.city}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      ord.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-[#8E1EA2]'
                    }`}>
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 capitalize">
                    {ord.paymentMethod} ({ord.paymentStatus})
                  </td>
                  <td className="py-3 px-3 text-right font-bold font-mono text-[#8E1EA2]">
                    Rs. {ord.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigateTab('orders', { orderId: ord.id })}
                      className="px-2.5 py-1 bg-white border border-[#EFE6EE] rounded-lg text-[11px] font-semibold text-[#8E1EA2] hover:bg-[#8E1EA2] hover:text-white transition-colors"
                    >
                      Manage
                    </button>
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
