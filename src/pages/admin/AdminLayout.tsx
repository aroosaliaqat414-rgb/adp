import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Tag,
  BarChart3,
  Star,
  LifeBuoy,
  Globe,
  Settings,
  ArrowLeft,
  Bell,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onExitAdmin,
  children
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Fulfillment', icon: Package },
    { id: 'products', label: 'Products & Variants', icon: ShoppingBag },
    { id: 'inventory', label: 'Stock & Inventory', icon: Layers },
    { id: 'customers', label: 'Customer Accounts', icon: Users },
    { id: 'coupons', label: 'Discounts & Coupons', icon: Tag },
    { id: 'finance', label: 'Sales & Financial BI', icon: BarChart3 },
    { id: 'reviews', label: 'Review Moderation', icon: Star },
    { id: 'support', label: 'Support Inquiries', icon: LifeBuoy },
    { id: 'cms', label: 'CMS & Banners', icon: Globe },
    { id: 'settings', label: 'Store Configuration', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EE] flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#EFE6EE] sticky top-0 z-30 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8E1EA2] hover:text-[#751786] px-3 py-1.5 rounded-lg border border-[#ED96D7] hover:bg-[#8E1EA2]/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#8E1EA2] text-white flex items-center justify-center text-xs font-serif font-bold">
              L
            </span>
            <span className="font-serif text-lg font-bold text-[#231826] hidden sm:inline">
              Ladies Garments Comfort
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-[#8E1EA2] text-white px-2 py-0.5 rounded-full ml-1">
              Admin Portal
            </span>
          </div>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block text-xs">
            <p className="font-semibold text-[#231826]">{user?.name}</p>
            <p className="text-[10px] text-[#8E1EA2] font-medium capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
            alt=""
            className="w-8 h-8 rounded-full object-cover border border-[#ED96D7]"
          />
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r border-[#EFE6EE] p-4 hidden md:flex flex-col justify-between shrink-0 overflow-y-auto">
          <nav className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#8E8191] px-3 py-2">
              Management Modules
            </div>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8E1EA2] text-white shadow-xs'
                      : 'text-[#5A4E5C] hover:bg-[#FCFAF8] hover:text-[#231826]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-[#EFE6EE] text-[11px] text-[#8E8191]">
            <p className="font-semibold text-[#231826]">Ladies Garments Comfort</p>
            <p>Version 2.4 • Production Ready</p>
          </div>
        </aside>

        {/* Mobile Horizontal Tabs */}
        <div className="md:hidden bg-white border-b border-[#EFE6EE] px-2 flex overflow-x-auto py-2 gap-1 text-xs shrink-0 w-full">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium text-xs ${
                currentTab === item.id ? 'bg-[#8E1EA2] text-white' : 'text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
