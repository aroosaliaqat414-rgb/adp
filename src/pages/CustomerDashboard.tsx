import React, { useState, useEffect } from 'react';
import {
  Package,
  Heart,
  MapPin,
  Star,
  Settings,
  Lock,
  LogOut,
  Bell,
  CheckCircle2,
  Trash2,
  Plus,
  Eye,
  ShoppingBag,
  Clock,
  Printer,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Order, Product, Review, Notification, Address } from '../types';
import { ReviewModal } from '../components/ReviewModal';

interface CustomerDashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onPrintInvoice: (order: Order) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigate,
  onPrintInvoice
}) => {
  const { user, logout, updateProfile, addAddress, deleteAddress } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'wishlist' | 'addresses' | 'reviews' | 'profile' | 'password' | 'notifications'
  >('overview');

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile edit states
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password change states
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // New Address states
  const [newAddrModalOpen, setNewAddrModalOpen] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrApartment, setAddrApartment] = useState('');
  const [addrCity, setAddrCity] = useState('Lahore');
  const [addrProvince, setAddrProvince] = useState('Punjab');
  const [addrZip, setAddrZip] = useState('');

  // Review modal state
  const [reviewModalProduct, setReviewModalProduct] = useState<{ id: string; name: string } | null>(null);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const [ordList, allProds, notifs] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getNotifications()
      ]);
      setOrders(ordList);
      setWishlistProducts(allProds.filter(p => wishlistIds.includes(p.id)));
      setNotifications(notifs);

      // fetch user reviews
      const revs = await api.getReviews();
      setUserReviews(revs.filter(r => r.userId === user.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user, wishlistIds]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ name: nameInput, phone: phoneInput });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    try {
      await api.changePassword({ currentPassword: currPass, newPassword: newPass });
      setPassMsg('Password changed successfully!');
      setCurrPass('');
      setNewPass('');
      setTimeout(() => setPassMsg(null), 3000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password.');
    }
  };

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAddress({
      fullName: addrName || user?.name,
      phone: addrPhone || user?.phone,
      street: addrStreet,
      apartment: addrApartment,
      city: addrCity,
      provinceOrState: addrProvince,
      postalCode: addrZip,
      country: 'Pakistan',
      isDefault: false
    });
    setNewAddrModalOpen(false);
    setAddrStreet('');
    setAddrApartment('');
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold mb-2">Please Sign In</h2>
        <p className="text-xs text-[#8E8191] mb-6">You must be logged in to view your account dashboard.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 bg-[#8E1EA2] text-white text-xs font-semibold rounded-full shadow-md hover:bg-[#751786]"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#ED96D7] shadow-xs"
          />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E1EA2] tracking-wider">
              Ladies Comfort VIP Client
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#231826]">{user.name}</h1>
            <p className="text-xs text-[#8E8191]">{user.email} • {user.phone || 'No phone set'}</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            onNavigate('home');
          }}
          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="bg-white rounded-2xl border border-[#EFE6EE] p-3 shadow-xs space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'orders' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>My Orders</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'wishlist' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>My Wishlist</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/20">
                {wishlistProducts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'addresses' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'reviews' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>My Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'notifications' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              {notifications.some(n => !n.isRead) && (
                <span className="w-2 h-2 rounded-full bg-[#ED96D7]" />
              )}
            </button>

            <div className="border-t border-[#EFE6EE] my-1" />

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'profile' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'password' ? 'bg-[#8E1EA2] text-white shadow-xs' : 'text-[#5A4E5C] hover:bg-[#FCFAF8]'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Change Password</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#8E8191]">Total Orders</span>
                  <p className="font-serif text-3xl font-bold text-[#8E1EA2] mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#8E8191]">Total Wardrobe Spend</span>
                  <p className="font-serif text-3xl font-bold text-[#231826] mt-1">Rs. {totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-[#EFE6EE] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-[#8E8191]">Saved Wishlist Items</span>
                  <p className="font-serif text-3xl font-bold text-[#C654C3] mt-1">{wishlistProducts.length}</p>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#EFE6EE]">
                  <h3 className="font-serif text-lg font-bold text-[#231826]">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#8E1EA2] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#8E8191] py-4 text-center">No orders placed yet.</p>
                ) : (
                  <div className="divide-y divide-[#EFE6EE]/60">
                    {orders.slice(0, 3).map(ord => (
                      <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#8E1EA2]">{ord.orderNumber}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              ord.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-[#8E1EA2]'
                            }`}>
                              {ord.orderStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-500 mt-1">
                            {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'} • Rs. {ord.total.toLocaleString()} • {ord.shippingAddress.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate('track-order', { query: ord.trackingNumber })}
                            className="px-3 py-1.5 bg-[#8E1EA2] text-white rounded-lg text-xs font-semibold hover:bg-[#751786]"
                          >
                            Track
                          </button>
                          <button
                            onClick={() => onPrintInvoice(ord)}
                            className="p-1.5 border border-[#EFE6EE] rounded-lg text-gray-500 hover:text-black"
                            title="Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
                Order History & Consignments
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#8E8191]">
                  You have not placed any orders yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(ord => (
                    <div key={ord.id} className="p-5 rounded-2xl bg-[#FCFAF8] border border-[#EFE6EE] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#EFE6EE] gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-[#8E1EA2]">{ord.orderNumber}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-[#8E1EA2]'
                            }`}>
                              {ord.orderStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })} • Tracking: <span className="font-mono text-[#231826] font-semibold">{ord.trackingNumber}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate('track-order', { query: ord.trackingNumber })}
                            className="px-3.5 py-1.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl"
                          >
                            Live Tracking
                          </button>
                          <button
                            onClick={() => onPrintInvoice(ord)}
                            className="px-3.5 py-1.5 border border-[#EFE6EE] bg-white hover:bg-gray-50 text-[#231826] text-xs font-semibold rounded-xl flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5 text-[#8E1EA2]" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-3">
                        {ord.items.map(it => (
                          <div key={it.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img src={it.image} alt="" className="w-12 h-14 rounded-lg object-cover" />
                              <div>
                                <h4 className="font-semibold text-[#231826]">{it.name}</h4>
                                <p className="text-[11px] text-[#8E8191]">
                                  {it.size} / {it.color} • Qty: {it.quantity} • Rs. {it.price.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Verified Review CTA if order is DELIVERED */}
                            {ord.orderStatus === 'delivered' && (
                              <button
                                onClick={() => setReviewModalProduct({ id: it.productId, name: it.name })}
                                className="px-3 py-1 bg-white border border-[#8E1EA2] text-[#8E1EA2] hover:bg-[#8E1EA2] hover:text-white rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                Write Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-[#EFE6EE] flex justify-between items-center text-xs">
                        <span className="text-[#8E8191]">
                          Payment: <strong className="uppercase text-[#231826]">{ord.paymentMethod} ({ord.paymentStatus})</strong>
                        </span>
                        <span className="font-bold text-sm text-[#8E1EA2]">
                          Total: Rs. {ord.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
                My Saved Wishlist ({wishlistProducts.length})
              </h3>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#8E8191]">
                  You have not added any pieces to your wishlist yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map(p => (
                    <div key={p.id} className="relative group border border-[#EFE6EE] rounded-2xl p-3 bg-[#FCFAF8] flex flex-col justify-between">
                      <div className="aspect-3/4 rounded-xl overflow-hidden bg-white mb-3">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-serif text-xs font-bold text-[#231826] line-clamp-1">{p.name}</h4>
                      <p className="text-xs font-bold text-[#8E1EA2] mt-1">Rs. {p.price.toLocaleString()}</p>

                      <div className="flex gap-2 mt-3 pt-2 border-t border-[#EFE6EE]">
                        <button
                          onClick={() => {
                            addItem(p, p.variants?.[0], 1);
                            toggleWishlist(p.id);
                          }}
                          className="flex-1 py-1.5 bg-[#8E1EA2] text-white text-[11px] font-semibold rounded-lg hover:bg-[#751786]"
                        >
                          Move to Bag
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg border border-[#EFE6EE]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EFE6EE]">
                <h3 className="font-serif text-xl font-bold text-[#231826]">
                  Saved Delivery Addresses
                </h3>
                <button
                  onClick={() => setNewAddrModalOpen(true)}
                  className="px-4 py-2 bg-[#8E1EA2] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses?.map(addr => (
                  <div key={addr.id} className="p-4 rounded-2xl border border-[#EFE6EE] bg-[#FCFAF8] text-xs relative space-y-1">
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold text-[#8E1EA2] bg-[#8E1EA2]/10 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                    <p className="font-bold text-[#231826]">{addr.fullName}</p>
                    <p className="text-gray-600">{addr.street}</p>
                    {addr.apartment && <p className="text-gray-600">{addr.apartment}</p>}
                    <p className="text-gray-600">{addr.city}, {addr.provinceOrState} {addr.postalCode}</p>
                    <p className="text-gray-400 mt-1">Phone: {addr.phone}</p>

                    <div className="pt-3 border-t border-gray-200 mt-2 flex justify-end">
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-[11px] text-red-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Address</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MY REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
                My Verified Customer Reviews
              </h3>

              {userReviews.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#8E8191]">
                  You have not submitted any reviews yet. After an order is delivered, you can rate and review your garments from the "My Orders" tab!
                </div>
              ) : (
                <div className="space-y-4">
                  {userReviews.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl bg-[#FCFAF8] border border-[#EFE6EE] space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#231826]">{r.productName}</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Status: {r.status}
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="font-semibold text-[#8E1EA2]">{r.title}</p>
                      <p className="text-[#5A4E5C]">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
                In-App Notifications
              </h3>
              {notifications.length === 0 ? (
                <p className="text-xs text-[#8E8191] text-center py-8">No notifications at this time.</p>
              ) : (
                <div className="divide-y divide-[#EFE6EE]">
                  {notifications.map(n => (
                    <div key={n.id} className="py-3 flex items-start gap-3 text-xs">
                      <Bell className="w-4 h-4 text-[#8E1EA2] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-[#231826]">{n.title}</h4>
                        <p className="text-gray-500 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
                Personal Account Profile
              </h3>

              {profileMsg && (
                <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  {profileMsg}
                </p>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-[#231826] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231826] mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 8: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-3xl border border-[#EFE6EE] p-6 sm:p-8 shadow-xs space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#231826] pb-4 border-b border-[#EFE6EE]">
                Update Account Password
              </h3>

              {passMsg && (
                <p className="text-xs text-emerald-600 font-semibold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  {passMsg}
                </p>
              )}

              {passError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-3 rounded-xl border border-red-200">
                  {passError}
                </p>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-[#231826] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currPass}
                    onChange={e => setCurrPass(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#231826] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#EFE6EE] focus:outline-hidden focus:border-[#8E1EA2]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Add Address Modal */}
      {newAddrModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#231826]">Add New Address</h3>
            <form onSubmit={handleAddNewAddress} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                value={addrName}
                onChange={e => setAddrName(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={addrPhone}
                onChange={e => setAddrPhone(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="Street Address, House #"
                value={addrStreet}
                onChange={e => setAddrStreet(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
                required
              />
              <input
                type="text"
                placeholder="City"
                value={addrCity}
                onChange={e => setAddrCity(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAddrModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8E1EA2] text-white rounded-xl font-bold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal Trigger */}
      {reviewModalProduct && (
        <ReviewModal
          isOpen={!!reviewModalProduct}
          onClose={() => setReviewModalProduct(null)}
          productId={reviewModalProduct.id}
          productName={reviewModalProduct.name}
          onSuccess={fetchUserData}
        />
      )}
    </div>
  );
};
