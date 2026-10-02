import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Package,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', { search: searchQuery.trim() });
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks: { label: string; page: string; params?: Record<string, string>; highlight?: boolean }[] = [
    { label: 'New Arrivals', page: 'shop', params: { newArrival: 'true' } },
    { label: 'Luxury Pret', page: 'shop', params: { category: 'luxury-pret' } },
    { label: '3-Piece Suits', page: 'shop', params: { category: 'three-piece-suits' } },
    { label: '2-Piece Suits', page: 'shop', params: { category: 'two-piece-suits' } },
    { label: 'Kurtis', page: 'shop', params: { category: 'kurtis' } },
    { label: 'Western Wear', page: 'shop', params: { category: 'western-wear' } },
    { label: 'Sale', page: 'shop', params: { category: 'sale' }, highlight: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFE6EE] shadow-xs transition-all">
      {/* Announcement Bar */}
      <div className="bg-[#8E1EA2] text-white text-xs font-medium py-2 px-4 text-center tracking-wider flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#FFC0C0] animate-pulse" />
        <span>
          Free Express Delivery across Pakistan on orders over <strong>PKR 5,000</strong> | Cash on Delivery Available
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#FFC0C0] animate-pulse hidden sm:inline" />
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2D232E] hover:text-[#8E1EA2] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#2D232E] hover:text-[#8E1EA2] transition-colors ml-1"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Brand Monogram & Name */}
          <div
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center cursor-pointer group text-center select-none"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-linear-to-tr from-[#8E1EA2] via-[#C654C3] to-[#ED96D7] flex items-center justify-center text-white text-xs font-serif font-bold shadow-xs">
                L
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#231826] group-hover:text-[#8E1EA2] transition-colors">
                Ladies Garments Comfort
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E8191] font-medium hidden sm:block">
              Style That Feels Like Comfort
            </span>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search kurtis, lawn, luxury pret..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-[#EFE6EE] bg-[#FCFAF8] focus:bg-white focus:outline-hidden focus:border-[#8E1EA2] transition-all"
              />
              <Search className="w-4 h-4 text-[#8E8191] absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Actions: Track, Wishlist, Account, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Track Order Direct Link */}
            <button
              onClick={() => onNavigate('track-order')}
              className="hidden md:flex items-center gap-1.5 text-xs font-medium text-[#5A4E5C] hover:text-[#8E1EA2] transition-colors px-2 py-1.5 rounded-md hover:bg-[#FCFAF8]"
            >
              <Package className="w-4 h-4 text-[#8E1EA2]" />
              <span>Track Order</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2 text-[#2D232E] hover:text-[#8E1EA2] transition-colors rounded-full hover:bg-[#FCFAF8]"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8E1EA2] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center gap-1 p-2 text-[#2D232E] hover:text-[#8E1EA2] transition-colors rounded-full hover:bg-[#FCFAF8]"
                aria-label="Account"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#ED96D7]"
                  />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
                <ChevronDown className="w-3.5 h-3.5 text-[#8E8191] hidden sm:block" />
              </button>

              {accountDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#EFE6EE] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-[#EFE6EE]">
                        <p className="text-xs text-[#8E8191]">Signed in as</p>
                        <p className="text-sm font-semibold text-[#231826] truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#8E1EA2] font-medium capitalize">{user?.role.replace('_', ' ')}</p>
                      </div>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setAccountDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-[#8E1EA2] hover:bg-[#FCFAF8] flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#8E1EA2]" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#5A4E5C] hover:bg-[#FCFAF8] flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-[#8E8191]" />
                        <span>My Account & Orders</span>
                      </button>

                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onNavigate('track-order');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#5A4E5C] hover:bg-[#FCFAF8] flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-[#8E8191]" />
                        <span>Live Order Tracking</span>
                      </button>

                      <div className="border-t border-[#EFE6EE] my-1"></div>

                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          logout();
                          onNavigate('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-xs text-[#5A4E5C] border-b border-[#EFE6EE]">
                        Welcome to Ladies Garments Comfort
                      </div>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onNavigate('login');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#8E1EA2] hover:bg-[#FCFAF8]"
                      >
                        Sign In / Register
                      </button>
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          onNavigate('track-order');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#5A4E5C] hover:bg-[#FCFAF8] flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-[#8E8191]" />
                        <span>Track an Order</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white rounded-full transition-colors shadow-xs flex items-center justify-center group"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-105 transition-transform" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#ED96D7] text-[#231826] text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center space-x-8 py-2.5 border-t border-[#EFE6EE]/60 text-xs font-medium tracking-wide">
          {navLinks.map((link, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(link.page, link.params)}
              className={`transition-colors py-1 relative hover:text-[#8E1EA2] ${
                link.highlight
                  ? 'text-[#8E1EA2] font-semibold flex items-center gap-1'
                  : 'text-[#2D232E]'
              }`}
            >
              {link.label}
              {link.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ED96D7] animate-ping" />
              )}
            </button>
          ))}
          <button
            onClick={() => onNavigate('contact')}
            className="text-[#5A4E5C] hover:text-[#8E1EA2] transition-colors py-1"
          >
            Contact & Support
          </button>
        </nav>
      </div>

      {/* Mobile Search Input when toggled */}
      {searchOpen && (
        <div className="lg:hidden p-4 bg-[#FCFAF8] border-b border-[#EFE6EE]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search kurtis, lawn, suits..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-[#EFE6EE] bg-white focus:outline-hidden focus:border-[#8E1EA2]"
              autoFocus
            />
            <Search className="w-4 h-4 text-[#8E8191] absolute left-3.5 top-3.5" />
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[116px] bottom-0 bg-white/95 backdrop-blur-md z-40 overflow-y-auto p-6 border-t border-[#EFE6EE] animate-in slide-in-from-top-4 duration-150">
          <div className="flex flex-col space-y-4">
            <p className="text-[11px] uppercase tracking-wider text-[#8E8191] font-semibold">Collections</p>
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(link.page, link.params);
                }}
                className={`text-left text-base py-2 border-b border-gray-100 flex items-center justify-between ${
                  link.highlight ? 'text-[#8E1EA2] font-semibold' : 'text-[#231826]'
                }`}
              >
                <span>{link.label}</span>
                {link.highlight && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#FFC0C0] text-[#8E1EA2] font-bold">
                    Special Offer
                  </span>
                )}
              </button>
            ))}

            <div className="pt-4 flex flex-col space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('track-order');
                }}
                className="w-full py-2.5 px-4 text-xs font-medium rounded-lg border border-[#8E1EA2] text-[#8E1EA2] flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Track Your Order</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('contact');
                }}
                className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-[#FCFAF8] text-[#5A4E5C] text-center"
              >
                Contact Customer Care
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="w-full py-2.5 px-4 text-xs font-medium rounded-lg bg-[#8E1EA2] text-white text-center"
                >
                  Admin Control Panel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
