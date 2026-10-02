import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Printer,
  XCircle,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';

interface AdminOrdersProps {
  initialOrderId?: string;
  onPrintInvoice: (order: Order) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ initialOrderId, onPrintInvoice }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Status Update Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [courierName, setCourierName] = useState('TCS Express Pakistan');
  const [trackingCode, setTrackingCode] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined
      });
      setOrders(data);
      if (initialOrderId) {
        const found = data.find(o => o.id === initialOrderId);
        if (found) {
          openStatusModal(found);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const openStatusModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.orderStatus);
    setStatusNote(`Status progressed to ${ord.orderStatus}`);
    setCourierName(ord.courierInfo?.courierName || 'TCS Express Pakistan');
    setTrackingCode(ord.courierInfo?.trackingCode || ord.trackingNumber);
    setModalOpen(true);
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await api.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        note: statusNote,
        courierName,
        trackingCode
      });
      setModalOpen(false);
      loadOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = [
      'Order Number',
      'Tracking Number',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'City',
      'Status',
      'Payment Method',
      'Payment Status',
      'Items Count',
      'Subtotal',
      'Discount',
      'Total'
    ];

    const rows = orders.map(o => [
      o.orderNumber,
      o.trackingNumber,
      new Date(o.createdAt).toLocaleDateString('en-PK'),
      `"${o.customerName}"`,
      o.customerEmail,
      o.customerPhone,
      `"${o.shippingAddress.city}"`,
      o.orderStatus,
      o.paymentMethod,
      o.paymentStatus,
      o.items.length,
      o.subtotal,
      o.discountAmount,
      o.total
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LGC_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#231826]">
            Orders & Courier Fulfillment
          </h1>
          <p className="text-xs text-[#8E8191]">
            Track delivery progress, update consignments, and issue customer invoices
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 bg-white border border-[#EFE6EE] hover:bg-gray-50 text-[#231826] text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#8E1EA2]" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE6EE] flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, tracking code, client name, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs font-semibold p-2 border border-[#EFE6EE] rounded-xl bg-white w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FCFAF8] text-[#8E8191] uppercase text-[10px] border-b border-[#EFE6EE]">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Date Placed</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6EE]/60">
              {orders.map(ord => (
                <tr key={ord.id} className="hover:bg-[#FCFAF8] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#8E1EA2]">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {new Date(ord.createdAt).toLocaleDateString('en-PK')}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-[#231826]">{ord.customerName}</p>
                    <p className="text-[10px] text-gray-400">{ord.customerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600">{ord.shippingAddress.city}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#8E1EA2]">
                    Rs. {ord.total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize">{ord.paymentMethod}</span>{' '}
                    <span className="text-[10px] font-mono text-gray-400">({ord.paymentStatus})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      ord.orderStatus === 'delivered'
                        ? 'bg-emerald-50 text-emerald-700'
                        : ord.orderStatus === 'cancelled'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-purple-50 text-[#8E1EA2]'
                    }`}>
                      {ord.orderStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => openStatusModal(ord)}
                      className="px-2.5 py-1 bg-[#8E1EA2] text-white rounded-lg text-[11px] font-semibold hover:bg-[#751786]"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => onPrintInvoice(ord)}
                      className="p-1 border border-[#EFE6EE] rounded-lg text-gray-600 hover:text-black"
                      title="Print Invoice"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Update Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#231826]">
              Update Order Status: {selectedOrder.orderNumber}
            </h3>

            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">New Fulfillment Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 border rounded-xl bg-white font-bold text-[#8E1EA2]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled (Restores Stock)</option>
                  <option value="returned">Returned (Restores Stock)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={e => setCourierName(e.target.value)}
                  placeholder="e.g. TCS Express Pakistan or Leopards"
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Consignment Tracking Code</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={e => setTrackingCode(e.target.value)}
                  placeholder="e.g. TRK-984210"
                  className="w-full p-2.5 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Status Event Note (Logged in Timeline)</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={e => setStatusNote(e.target.value)}
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
                  className="px-6 py-2 bg-[#8E1EA2] text-white rounded-xl font-bold shadow-xs hover:bg-[#751786]"
                >
                  Confirm & Notify Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
