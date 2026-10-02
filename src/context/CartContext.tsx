import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { api } from '../services/api';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  coupon: Coupon | null;
  couponError: string | null;
  isApplyingCoupon: boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'lgc_cart_items';
const COUPON_STORAGE_KEY = 'lgc_cart_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {}
  }, [coupon]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Recalculate discount whenever subtotal or coupon changes
  useEffect(() => {
    if (!coupon || subtotal === 0) {
      setDiscountAmount(0);
      return;
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      setCouponError(`Min order Rs. ${coupon.minOrderAmount.toLocaleString()} needed for coupon.`);
      setDiscountAmount(0);
      return;
    }

    setCouponError(null);
    let disc = 0;
    if (coupon.type === 'percentage') {
      disc = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount && disc > coupon.maxDiscountAmount) {
        disc = coupon.maxDiscountAmount;
      }
    } else {
      disc = Math.min(coupon.value, subtotal);
    }
    setDiscountAmount(Math.round(disc));
  }, [coupon, subtotal]);

  // Shipping calculation (free over PKR 5000 or Rs. 250 standard)
  const freeThreshold = 5000;
  const standardShipping = 250;
  const shippingFee = (subtotal - discountAmount) >= freeThreshold || items.length === 0 ? 0 : standardShipping;
  const taxAmount = 0; // Tax included or 0% default
  const total = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount);
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);

  const addItem = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const selectedVariant = variant || (product.variants && product.variants[0]);
    const variantId = selectedVariant ? selectedVariant.id : '';
    const size = selectedVariant ? selectedVariant.size : 'Standard';
    const color = selectedVariant ? selectedVariant.color : 'Standard';
    const price = selectedVariant ? selectedVariant.price : product.price;
    const maxStock = selectedVariant ? selectedVariant.stockQuantity : product.totalStock;
    const image = (selectedVariant && selectedVariant.image) || product.images[0];

    setItems(prevItems => {
      const existingIdx = prevItems.findIndex(
        it => it.productId === product.id && it.variantId === variantId
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(maxStock, updated[existingIdx].quantity + quantity);
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          maxStock
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `ci_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          variantId,
          name: product.name,
          slug: product.slug,
          price,
          compareAtPrice: selectedVariant?.compareAtPrice || product.compareAtPrice,
          size,
          color,
          fabric: product.fabric,
          image,
          quantity: Math.min(maxStock, Math.max(1, quantity)),
          maxStock
        };
        return [...prevItems, newItem];
      }
    });

    setCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(it => it.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev =>
      prev.map(it => {
        if (it.id === itemId) {
          return { ...it, quantity: Math.min(it.maxStock, quantity) };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setDiscountAmount(0);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code.trim(), subtotal);
      if (res.valid) {
        setCoupon(res.coupon);
        setDiscountAmount(res.discountAmount);
        setIsApplyingCoupon(false);
        return true;
      }
      return false;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
      setIsApplyingCoupon(false);
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        total,
        coupon,
        couponError,
        isApplyingCoupon,
        cartOpen,
        setCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
