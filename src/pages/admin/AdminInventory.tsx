import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  AlertTriangle,
  Search,
  DollarSign,
  History,
  Plus
} from 'lucide-react';
import { api } from '../../services/api';
import { InventoryTransaction } from '../../types';

export const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [totalValuation, setTotalValuation] = useState<number>(0);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [search, setSearch] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');
  const [adjustQuantity, setAdjustQuantity] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('New shipment arrival');

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setItems(data.items);
      setTotalValuation(data.totalValuation);
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openAdjustmentModal = (p: any) => {
    setSelectedProduct(p);
    setSelectedVariantId(p.variants?.[0]?.id || '');
    setAdjustType('stock_in');
    setAdjustQuantity(10);
    setAdjustReason('Shipment replenishment from Lahore atelier');
    setModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await api.adjustInventory({
        productId: selectedProduct.id,
        variantId: selectedVariantId || undefined,
        type: adjustType,
        quantity: Number(adjustQuantity),
        reason: adjustReason
      });
      setModalOpen(false);
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(it => {
    const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase()) || it.sku.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStock === 'low') return it.isLowStock;
    if (filterStock === 'out') return it.isOutOfStock;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#231826]">
            Inventory & Stock Auditing
          </h1>
          <p className="text-xs text-[#8E8191]">
            Track SKU-level stock movement, valuations, and replenishment logs
          </p>
        </div>

        {/* Valuation Card */}
        <div className="bg-white p-3.5 px-5 rounded-2xl border border-[#EFE6EE] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8E1EA2]/10 text-[#8E1EA2] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E8191]">
              Inventory Cost Valuation
            </span>
            <p className="font-serif text-lg font-bold text-[#231826]">
              Rs. {totalValuation.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EFE6EE]">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search stock by garment title or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterStock('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filterStock === 'all' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterStock('low')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filterStock === 'low' ? 'bg-amber-500 text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-gray-100'
            }`}
          >
            Low Stock Alerts
          </button>
          <button
            onClick={() => setFilterStock('out')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              filterStock === 'out' ? 'bg-red-500 text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-gray-100'
            }`}
          >
            Out of Stock
          </button>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FCFAF8] text-[#8E8191] uppercase text-[10px] border-b border-[#EFE6EE]">
              <tr>
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Base SKU</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Stock on Hand</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6EE]/60">
              {filteredItems.map(it => (
                <tr key={it.id} className="hover:bg-[#FCFAF8] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#231826]">
                    {it.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-500">{it.sku}</td>
                  <td className="py-3 px-4 font-mono">Rs. {it.sellingPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">Rs. {it.costPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-sm text-[#231826]">{it.totalStock}</span> units
                  </td>
                  <td className="py-3 px-4">
                    {it.isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        Out of Stock
                      </span>
                    ) : it.isLowStock ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        Low Stock (≤{it.lowStockThreshold})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Optimal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openAdjustmentModal(it)}
                      className="px-3 py-1.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-[11px] font-semibold rounded-lg shadow-2xs"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Transactions Audit Trail */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#231826] flex items-center gap-2">
          <History className="w-5 h-5 text-[#8E1EA2]" />
          <span>Audit Trail: Recent Stock Ledger Transactions</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase text-[#8E8191] border-b border-[#EFE6EE]">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Variant</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Before → After</th>
                <th className="py-2.5 px-3">Reason / Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6EE]/60 font-mono">
              {transactions.slice(0, 10).map((tx, idx) => (
                <tr key={idx} className="hover:bg-[#FCFAF8]">
                  <td className="py-2.5 px-3 text-gray-500 font-sans">
                    {new Date(tx.createdAt).toLocaleString('en-PK')}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-[#231826]">{tx.productName}</td>
                  <td className="py-2.5 px-3 font-sans text-gray-600">{tx.variantTitle || 'All'}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      tx.type === 'stock_in' ? 'bg-emerald-50 text-emerald-700' : tx.type === 'stock_out' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-[#8E1EA2]'
                    }`}>
                      {tx.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    {tx.type === 'stock_in' ? `+${tx.quantity}` : `-${tx.quantity}`}
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">
                    {tx.previousStock} → {tx.newStock}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-gray-600">{tx.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#231826]">
              Adjust Stock: {selectedProduct.name}
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              {selectedProduct.variants?.length > 0 && (
                <div>
                  <label className="block font-semibold mb-1">Target Variant</label>
                  <select
                    value={selectedVariantId}
                    onChange={e => setSelectedVariantId(e.target.value)}
                    className="w-full p-2.5 border rounded-xl bg-white"
                  >
                    {selectedProduct.variants.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.size} / {v.color} (Current: {v.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Action Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('stock_in')}
                    className={`p-2 rounded-xl font-bold border ${adjustType === 'stock_in' ? 'bg-[#8E1EA2] text-white' : 'border-gray-200'}`}
                  >
                    + Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('stock_out')}
                    className={`p-2 rounded-xl font-bold border ${adjustType === 'stock_out' ? 'bg-red-500 text-white' : 'border-gray-200'}`}
                  >
                    - Stock Out
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('adjustment')}
                    className={`p-2 rounded-xl font-bold border ${adjustType === 'adjustment' ? 'bg-indigo-600 text-white' : 'border-gray-200'}`}
                  >
                    Set Count
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {adjustType === 'adjustment' ? 'New Exact Stock Level' : 'Quantity to Add / Deduct'}
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustQuantity}
                  onChange={e => setAdjustQuantity(Number(e.target.value))}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Reason / Note *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Workshop intake or defect scrap"
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
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
