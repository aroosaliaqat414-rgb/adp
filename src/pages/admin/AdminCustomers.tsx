import React, { useState, useEffect } from 'react';
import { Users, Search, DollarSign, Package, Mail, Phone, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#231826]">
          Customer Accounts & Profiles
        </h1>
        <p className="text-xs text-[#8E8191]">
          View verified clients, lifetime order frequency, and wardrobe spend
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#EFE6EE] flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs focus:outline-hidden"
        />
      </div>

      <div className="bg-white rounded-3xl border border-[#EFE6EE] overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#FCFAF8] text-[#8E8191] uppercase text-[10px] border-b border-[#EFE6EE]">
            <tr>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4">Registered Date</th>
              <th className="py-3 px-4">Total Orders</th>
              <th className="py-3 px-4 font-right">Lifetime Spend</th>
              <th className="py-3 px-4">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFE6EE]/60">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[#FCFAF8]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <div>
                      <span className="font-semibold text-[#231826]">{c.name}</span>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <p className="text-gray-600">{c.email}</p>
                  <p className="text-[11px] text-gray-400">{c.phone || 'No phone set'}</p>
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString('en-PK')}
                </td>
                <td className="py-3 px-4 font-bold font-mono">
                  {c.orderCount || 0} orders
                </td>
                <td className="py-3 px-4 font-bold font-mono text-[#8E1EA2]">
                  Rs. {(c.totalSpent || 0).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    {(c.tags || ['Customer']).map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-[#ED96D7]/20 text-[#8E1EA2] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
