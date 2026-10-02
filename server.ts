import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Seeding
import { seedDatabase } from './src/server/seedData.ts';

function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = seedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read db.json, recreating with initial seed', err);
    const initialData = seedDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

let db = loadDatabase();

function saveDatabase() {
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

// Simple token authentication simulation
function generateToken(user: any) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyToken(tokenHeader?: string) {
  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) return null;
  const token = tokenHeader.split(' ')[1];
  try {
    const json = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Request logger in dev
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Auth Middleware
  const requireAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const decoded = verifyToken(authHeader);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }
    const user = db.users.find((u: any) => u.id === decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found or session expired.' });
    }
    req.user = user;
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    requireAuth(req, res, () => {
      const allowedRoles = [
        'super_admin',
        'store_manager',
        'order_manager',
        'inventory_manager',
        'marketing_manager',
        'support_staff'
      ];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
      }
      next();
    });
  };

  // -------------------------------------------------------------
  // AUTHENTICATION APIS
  // -------------------------------------------------------------
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      email: normalizedEmail,
      passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
      phone: phone || '',
      role: 'customer',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      addresses: [],
      createdAt: new Date().toISOString(),
      totalSpent: 0,
      orderCount: 0,
      tags: ['New Customer']
    };

    db.users.push(newUser);
    saveDatabase();

    const token = generateToken(newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({ user: safeUser, token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const user = db.users.find(
      (u: any) => u.email.toLowerCase() === normalizedEmail && u.passwordHash === hash
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, token });
  });

  app.get('/api/auth/me', requireAuth, (req: any, res) => {
    const { passwordHash: _, ...safeUser } = req.user;
    return res.json({ user: safeUser });
  });

  app.put('/api/auth/profile', requireAuth, (req: any, res) => {
    const { name, phone, avatar } = req.body;
    const user = db.users.find((u: any) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;

    saveDatabase();
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  app.put('/api/auth/password', requireAuth, (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = db.users.find((u: any) => u.id === req.user.id);
    const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (user.passwordHash !== currentHash) {
      return res.status(400).json({ error: 'Incorrect current password.' });
    }
    user.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
    saveDatabase();
    return res.json({ success: true, message: 'Password updated successfully.' });
  });

  // Saved Addresses
  app.post('/api/auth/addresses', requireAuth, (req: any, res) => {
    const address = req.body;
    const user = db.users.find((u: any) => u.id === req.user.id);
    const newAddress = {
      id: `addr_${Date.now()}`,
      ...address,
      isDefault: user.addresses.length === 0 ? true : !!address.isDefault
    };

    if (newAddress.isDefault) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
    }
    user.addresses.push(newAddress);
    saveDatabase();
    return res.json({ addresses: user.addresses });
  });

  app.delete('/api/auth/addresses/:id', requireAuth, (req: any, res) => {
    const user = db.users.find((u: any) => u.id === req.user.id);
    user.addresses = user.addresses.filter((a: any) => a.id !== req.params.id);
    if (user.addresses.length > 0 && !user.addresses.some((a: any) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }
    saveDatabase();
    return res.json({ addresses: user.addresses });
  });

  // -------------------------------------------------------------
  // STORE SETTINGS APIS
  // -------------------------------------------------------------
  app.get('/api/settings', (req, res) => {
    res.json(db.storeSettings);
  });

  app.put('/api/settings', requireAdmin, (req, res) => {
    db.storeSettings = { ...db.storeSettings, ...req.body };
    saveDatabase();
    res.json(db.storeSettings);
  });

  // -------------------------------------------------------------
  // CATEGORIES & COLLECTIONS APIS
  // -------------------------------------------------------------
  app.get('/api/categories', (req, res) => {
    const categoriesWithCount = db.categories.map((cat: any) => {
      const count = db.products.filter(
        (p: any) => p.categoryId === cat.id && p.status === 'active'
      ).length;
      return { ...cat, itemCount: count };
    });
    res.json(categoriesWithCount);
  });

  app.post('/api/categories', requireAdmin, (req, res) => {
    const { name, slug, description, image, order } = req.body;
    const newCategory = {
      id: `cat_${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80',
      order: order || db.categories.length + 1,
      isActive: true
    };
    db.categories.push(newCategory);
    saveDatabase();
    res.status(201).json(newCategory);
  });

  app.put('/api/categories/:id', requireAdmin, (req, res) => {
    const idx = db.categories.findIndex((c: any) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });
    db.categories[idx] = { ...db.categories[idx], ...req.body };
    saveDatabase();
    res.json(db.categories[idx]);
  });

  app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    db.categories = db.categories.filter((c: any) => c.id !== req.params.id);
    saveDatabase();
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // PRODUCTS & VARIATION APIS
  // -------------------------------------------------------------
  app.get('/api/products', (req, res) => {
    const {
      category,
      collection,
      search,
      size,
      color,
      fabric,
      minPrice,
      maxPrice,
      sort,
      status,
      featured,
      newArrival,
      bestSeller
    } = req.query;

    let filtered = [...db.products];

    // Filter by active status unless requested by admin
    if (status) {
      filtered = filtered.filter((p: any) => p.status === status);
    } else {
      filtered = filtered.filter((p: any) => p.status === 'active');
    }

    if (category) {
      const cat = db.categories.find(
        (c: any) => c.slug === category || c.id === category || c.name.toLowerCase() === (category as string).toLowerCase()
      );
      if (cat) {
        filtered = filtered.filter((p: any) => p.categoryId === cat.id);
      }
    }

    if (collection) {
      filtered = filtered.filter((p: any) => p.collectionId === collection);
    }

    if (featured === 'true') {
      filtered = filtered.filter((p: any) => p.isFeatured);
    }

    if (newArrival === 'true') {
      filtered = filtered.filter((p: any) => p.isNewArrival);
    }

    if (bestSeller === 'true') {
      filtered = filtered.filter((p: any) => p.isBestSeller);
    }

    if (fabric) {
      filtered = filtered.filter((p: any) =>
        p.fabric.toLowerCase().includes((fabric as string).toLowerCase())
      );
    }

    if (size) {
      filtered = filtered.filter((p: any) =>
        p.variants && p.variants.some((v: any) => v.size.toLowerCase() === (size as string).toLowerCase() && v.stockQuantity > 0)
      );
    }

    if (color) {
      filtered = filtered.filter((p: any) =>
        p.variants && p.variants.some((v: any) => v.color.toLowerCase().includes((color as string).toLowerCase()))
      );
    }

    if (minPrice) {
      filtered = filtered.filter((p: any) => p.price >= parseFloat(minPrice as string));
    }

    if (maxPrice) {
      filtered = filtered.filter((p: any) => p.price <= parseFloat(maxPrice as string));
    }

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'popularity':
      case 'bestseller':
        filtered.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Attach category name
    const enriched = filtered.map((p: any) => {
      const cat = db.categories.find((c: any) => c.id === p.categoryId);
      return {
        ...p,
        categoryName: cat ? cat.name : 'Uncategorized'
      };
    });

    res.json(enriched);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.products.find(
      (p: any) => p.id === req.params.id || p.slug === req.params.id
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const cat = db.categories.find((c: any) => c.id === product.categoryId);
    const approvedReviews = db.reviews.filter(
      (r: any) => r.productId === product.id && r.status === 'approved'
    );
    res.json({
      ...product,
      categoryName: cat ? cat.name : 'Uncategorized',
      reviews: approvedReviews
    });
  });

  app.post('/api/products', requireAdmin, (req: any, res) => {
    const data = req.body;
    const id = `prod_${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Variants validation and sku generation
    const variants = (data.variants || []).map((v: any, index: number) => ({
      id: v.id || `var_${id}_${index}`,
      productId: id,
      title: v.title || `${v.color || 'Standard'} / ${v.size || 'M'}`,
      size: v.size || 'M',
      color: v.color || 'Standard',
      colorHex: v.colorHex || '#8E1EA2',
      sku: v.sku || `${data.sku || 'SKU'}-${v.size || 'M'}`,
      price: v.price || data.price,
      compareAtPrice: v.compareAtPrice || data.compareAtPrice,
      stockQuantity: parseInt(v.stockQuantity || 0, 10),
      isAvailable: parseInt(v.stockQuantity || 0, 10) > 0
    }));

    const totalStock = variants.length > 0
      ? variants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0)
      : parseInt(data.totalStock || 0, 10);

    const newProduct = {
      id,
      name: data.name,
      slug,
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      categoryId: data.categoryId || (db.categories[0] ? db.categories[0].id : ''),
      price: parseFloat(data.price),
      compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
      costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
      sku: data.sku || `LGC-${Date.now().toString().slice(-4)}`,
      barcode: data.barcode || '',
      images: data.images && data.images.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
      ],
      status: data.status || 'active',
      isFeatured: !!data.isFeatured,
      isNewArrival: data.isNewArrival !== undefined ? !!data.isNewArrival : true,
      isBestSeller: !!data.isBestSeller,
      fabric: data.fabric || 'Pure Cotton / Lawn',
      careInstructions: data.careInstructions || 'Dry clean recommended. Gentle hand wash in cold water.',
      specifications: data.specifications || {},
      tags: data.tags || ['Ethnic', 'Comfort', 'Ready to wear'],
      totalStock,
      lowStockThreshold: data.lowStockThreshold ? parseInt(data.lowStockThreshold, 10) : 5,
      averageRating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants
    };

    db.products.unshift(newProduct);

    // Record initial inventory transaction
    if (totalStock > 0) {
      db.inventoryTransactions.push({
        id: `tx_${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'stock_in',
        quantity: totalStock,
        previousStock: 0,
        newStock: totalStock,
        reason: 'Initial Product Stock Creation',
        createdAt: new Date().toISOString(),
        createdBy: req.user.name
      });
    }

    saveDatabase();
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', requireAdmin, (req, res) => {
    const idx = db.products.findIndex((p: any) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const existing = db.products[idx];
    const updatedVariants = req.body.variants ? req.body.variants.map((v: any, index: number) => ({
      ...v,
      id: v.id || `var_${existing.id}_${index}`,
      productId: existing.id,
      stockQuantity: parseInt(v.stockQuantity || 0, 10),
      isAvailable: parseInt(v.stockQuantity || 0, 10) > 0
    })) : existing.variants;

    const totalStock = updatedVariants.length > 0
      ? updatedVariants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0)
      : (req.body.totalStock !== undefined ? parseInt(req.body.totalStock, 10) : existing.totalStock);

    db.products[idx] = {
      ...existing,
      ...req.body,
      variants: updatedVariants,
      totalStock,
      updatedAt: new Date().toISOString()
    };

    saveDatabase();
    res.json(db.products[idx]);
  });

  app.delete('/api/products/:id', requireAdmin, (req, res) => {
    db.products = db.products.filter((p: any) => p.id !== req.params.id);
    saveDatabase();
    res.json({ success: true });
  });

  // Duplicate product
  app.post('/api/products/:id/duplicate', requireAdmin, (req, res) => {
    const existing = db.products.find((p: any) => p.id === req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const id = `prod_${Date.now()}`;
    const duplicated = {
      ...existing,
      id,
      name: `${existing.name} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${existing.sku}-CPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: existing.variants.map((v: any, i: number) => ({
        ...v,
        id: `var_${id}_${i}`,
        productId: id,
        sku: `${v.sku}-CPY`
      }))
    };

    db.products.unshift(duplicated);
    saveDatabase();
    res.status(201).json(duplicated);
  });

  // -------------------------------------------------------------
  // COUPONS & DISCOUNTS APIS
  // -------------------------------------------------------------
  app.get('/api/coupons', (req, res) => {
    res.json(db.coupons);
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

    const coupon = db.coupons.find(
      (c: any) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive
    );

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid or expired coupon code.' });
    }

    const now = new Date();
    if (new Date(coupon.endDate) < now) {
      return res.status(400).json({ error: 'This coupon has expired.' });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit has been reached.' });
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        error: `Minimum order amount of Rs. ${coupon.minOrderAmount.toLocaleString()} required for this coupon.`
      });
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return res.json({
      valid: true,
      coupon,
      discountAmount: Math.round(discountAmount)
    });
  });

  app.post('/api/coupons', requireAdmin, (req, res) => {
    const newCoupon = {
      id: `cpn_${Date.now()}`,
      code: req.body.code.toUpperCase().trim(),
      type: req.body.type || 'percentage',
      value: parseFloat(req.body.value),
      minOrderAmount: req.body.minOrderAmount ? parseFloat(req.body.minOrderAmount) : undefined,
      maxDiscountAmount: req.body.maxDiscountAmount ? parseFloat(req.body.maxDiscountAmount) : undefined,
      startDate: req.body.startDate || new Date().toISOString(),
      endDate: req.body.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      usageLimit: req.body.usageLimit ? parseInt(req.body.usageLimit, 10) : undefined,
      usageCount: 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      description: req.body.description || ''
    };
    db.coupons.push(newCoupon);
    saveDatabase();
    res.status(201).json(newCoupon);
  });

  app.delete('/api/coupons/:id', requireAdmin, (req, res) => {
    db.coupons = db.coupons.filter((c: any) => c.id !== req.params.id);
    saveDatabase();
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // ORDERS & CHECKOUT APIS
  // -------------------------------------------------------------
  app.post('/api/orders', (req, res) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      couponCode,
      paymentMethod,
      customerNotes,
      isGuest,
      cardDetails,
      bankReference
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order fields.' });
    }

    // 1. Stock verification & variant lookup
    for (const item of items) {
      const prod = db.products.find((p: any) => p.id === item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.name}` });
      }
      if (item.variantId) {
        const variant = prod.variants.find((v: any) => v.id === item.variantId);
        if (!variant || variant.stockQuantity < item.quantity) {
          return res.status(400).json({
            error: `Insufficient stock for ${item.name} (${item.size}/${item.color}). Available: ${variant ? variant.stockQuantity : 0}`
          });
        }
      } else if (prod.totalStock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.name}. Available: ${prod.totalStock}`
        });
      }
    }

    // 2. Pricing calculations
    const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.quantity, 0);

    let discountAmount = 0;
    if (couponCode) {
      const coupon = db.coupons.find(
        (c: any) => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.isActive
      );
      if (coupon) {
        if (coupon.type === 'percentage') {
          discountAmount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = Math.min(coupon.value, subtotal);
        }
        discountAmount = Math.round(discountAmount);
        coupon.usageCount = (coupon.usageCount || 0) + 1;
      }
    }

    const freeThreshold = db.storeSettings.freeShippingThreshold || 5000;
    const shippingFee = (subtotal - discountAmount) >= freeThreshold ? 0 : (db.storeSettings.standardShippingFee || 250);
    const taxRate = db.storeSettings.taxRatePercentage || 0;
    const taxAmount = Math.round(((subtotal - discountAmount) * taxRate) / 100);
    const total = subtotal - discountAmount + shippingFee + taxAmount;

    // 3. Unique order identifiers
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `${db.storeSettings.orderNumberPrefix || 'LGC'}-${new Date().getFullYear()}-${randomSuffix}`;
    const trackingNumber = `TRK-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;

    // Payment status handling
    let paymentStatus = 'pending';
    let paymentDetails: any = {};

    if (paymentMethod === 'card') {
      paymentStatus = 'paid';
      paymentDetails = {
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        cardLast4: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '4242',
        gateway: 'Simulated 3DS Gateway'
      };
    } else if (paymentMethod === 'bank_transfer') {
      paymentStatus = 'pending';
      paymentDetails = {
        bankReference: bankReference || 'PENDING_VERIFICATION',
        receiptUrl: ''
      };
    } else {
      // COD
      paymentStatus = 'pending';
    }

    const orderId = `ord_${Date.now()}`;
    const newOrder = {
      id: orderId,
      orderNumber,
      trackingNumber,
      userId: req.body.userId || null,
      isGuest: !!isGuest,
      customerName,
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone,
      shippingAddress,
      items: items.map((it: any) => ({
        id: `oi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        productId: it.productId,
        variantId: it.variantId || '',
        name: it.name,
        sku: it.sku || 'SKU',
        size: it.size || 'Standard',
        color: it.color || 'Standard',
        image: it.image,
        price: it.price,
        quantity: it.quantity,
        total: it.price * it.quantity
      })),
      subtotal,
      discountAmount,
      couponCode: discountAmount > 0 ? couponCode : undefined,
      taxAmount,
      shippingFee,
      total,
      currency: db.storeSettings.currency || 'PKR',
      paymentMethod,
      paymentStatus,
      paymentDetails,
      orderStatus: 'confirmed',
      timeline: [
        {
          id: `evt_${Date.now()}`,
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer.'
        },
        {
          id: `evt_${Date.now() + 1}`,
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          note: paymentMethod === 'card' ? 'Payment confirmed automatically.' : 'Order confirmed and ready for packing.'
        }
      ],
      courierInfo: {
        courierName: 'TCS Express Pakistan',
        trackingCode: trackingNumber,
        trackingUrl: `https://www.tcsexpress.com/tracking?track=${trackingNumber}`,
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-PK', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        })
      },
      customerNotes: customerNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 4. Safe stock decrement & inventory transaction recording
    for (const item of items) {
      const prod = db.products.find((p: any) => p.id === item.productId);
      if (prod) {
        if (item.variantId) {
          const variant = prod.variants.find((v: any) => v.id === item.variantId);
          if (variant) {
            const prev = variant.stockQuantity;
            variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
            variant.isAvailable = variant.stockQuantity > 0;
            db.inventoryTransactions.push({
              id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              productId: prod.id,
              variantId: variant.id,
              productName: prod.name,
              variantTitle: variant.title,
              type: 'stock_out',
              quantity: item.quantity,
              previousStock: prev,
              newStock: variant.stockQuantity,
              reason: `Order ${orderNumber}`,
              referenceId: orderNumber,
              createdAt: new Date().toISOString()
            });
          }
        }
        const prevTotal = prod.totalStock;
        prod.totalStock = prod.variants && prod.variants.length > 0
          ? prod.variants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0)
          : Math.max(0, prod.totalStock - item.quantity);
      }
    }

    // 5. Update customer spending metrics if registered user
    if (newOrder.userId) {
      const user = db.users.find((u: any) => u.id === newOrder.userId);
      if (user) {
        user.totalSpent = (user.totalSpent || 0) + total;
        user.orderCount = (user.orderCount || 0) + 1;
      }
    }

    // 6. In-app Admin notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      forAdmin: true,
      title: `New Order: ${orderNumber}`,
      message: `${customerName} placed order for Rs. ${total.toLocaleString()} (${items.length} items).`,
      type: 'order',
      isRead: false,
      link: `/admin/orders`,
      createdAt: new Date().toISOString()
    });

    db.orders.unshift(newOrder);
    saveDatabase();

    return res.status(201).json(newOrder);
  });

  app.get('/api/orders', (req, res) => {
    const authHeader = req.headers.authorization;
    const decoded = verifyToken(authHeader);
    const { status, search, userId } = req.query;

    let ordersList = [...db.orders];

    // If user is not admin, restrict to their own orders or guest lookup
    if (decoded) {
      const user = db.users.find((u: any) => u.id === decoded.id);
      const isStaff = user && ['super_admin', 'store_manager', 'order_manager'].includes(user.role);
      if (!isStaff) {
        ordersList = ordersList.filter((o: any) => o.userId === decoded.id || o.customerEmail.toLowerCase() === decoded.email.toLowerCase());
      }
    } else if (userId) {
      ordersList = ordersList.filter((o: any) => o.userId === userId);
    } else {
      // Guest can search by tracking code or order number query
      if (!search) {
        return res.status(401).json({ error: 'Please sign in or provide an order number.' });
      }
    }

    if (status && status !== 'all') {
      ordersList = ordersList.filter((o: any) => o.orderStatus === status);
    }

    if (search) {
      const q = (search as string).toLowerCase().trim();
      ordersList = ordersList.filter(
        (o: any) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.trackingNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
      );
    }

    ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(ordersList);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.orders.find(
      (o: any) => o.id === req.params.id || o.orderNumber === req.params.id || o.trackingNumber === req.params.id
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });

  app.put('/api/orders/:id/status', requireAdmin, (req: any, res) => {
    const order = db.orders.find((o: any) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const { status, note, courierName, trackingCode, paymentStatus } = req.body;
    const prevStatus = order.orderStatus;

    if (status) {
      order.orderStatus = status;
      order.timeline.push({
        id: `evt_${Date.now()}`,
        status,
        timestamp: new Date().toISOString(),
        note: note || `Order status updated to ${status}`,
        updatedBy: req.user.name
      });

      // Stock restoration on cancellation or return
      if (['cancelled', 'returned'].includes(status) && !['cancelled', 'returned'].includes(prevStatus)) {
        for (const item of order.items) {
          const prod = db.products.find((p: any) => p.id === item.productId);
          if (prod) {
            if (item.variantId) {
              const variant = prod.variants.find((v: any) => v.id === item.variantId);
              if (variant) {
                const prev = variant.stockQuantity;
                variant.stockQuantity += item.quantity;
                variant.isAvailable = true;
                db.inventoryTransactions.push({
                  id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  productId: prod.id,
                  variantId: variant.id,
                  productName: prod.name,
                  variantTitle: variant.title,
                  type: 'order_cancellation',
                  quantity: item.quantity,
                  previousStock: prev,
                  newStock: variant.stockQuantity,
                  reason: `Stock restored from order ${order.orderNumber} (${status})`,
                  referenceId: order.orderNumber,
                  createdAt: new Date().toISOString(),
                  createdBy: req.user.name
                });
              }
            }
            prod.totalStock = prod.variants && prod.variants.length > 0
              ? prod.variants.reduce((sum: number, v: any) => sum + v.stockQuantity, 0)
              : prod.totalStock + item.quantity;
          }
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (courierName || trackingCode) {
      order.courierInfo = {
        courierName: courierName || order.courierInfo?.courierName || 'TCS Express Pakistan',
        trackingCode: trackingCode || order.courierInfo?.trackingCode || order.trackingNumber,
        trackingUrl: `https://www.tcsexpress.com/tracking?track=${trackingCode || order.trackingNumber}`,
        estimatedDelivery: order.courierInfo?.estimatedDelivery || '3-5 Business Days'
      };
    }

    order.updatedAt = new Date().toISOString();
    saveDatabase();

    return res.json(order);
  });

  // -------------------------------------------------------------
  // REVIEWS & RATINGS APIS (Only for delivered purchases)
  // -------------------------------------------------------------
  app.get('/api/reviews', (req, res) => {
    const { productId, status } = req.query;
    let list = [...db.reviews];
    if (productId) {
      list = list.filter((r: any) => r.productId === productId);
    }
    if (status) {
      list = list.filter((r: any) => r.status === status);
    }
    res.json(list);
  });

  app.post('/api/reviews', requireAuth, (req: any, res) => {
    const { productId, rating, title, comment, images } = req.body;
    const userId = req.user.id;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product, rating (1-5), and review text are required.' });
    }

    // Verify customer has a DELIVERED order for this product
    const eligibleOrder = db.orders.find(
      (o: any) =>
        (o.userId === userId || o.customerEmail.toLowerCase() === req.user.email.toLowerCase()) &&
        o.orderStatus === 'delivered' &&
        o.items.some((it: any) => it.productId === productId)
    );

    if (!eligibleOrder) {
      return res.status(403).json({
        error: 'Only customers who purchased and received this product can leave a verified review.'
      });
    }

    // Prevent duplicate review for the same product by user
    const existing = db.reviews.find((r: any) => r.productId === productId && r.userId === userId);
    if (existing) {
      // Allow editing existing review
      existing.rating = parseInt(rating, 10);
      existing.title = title || '';
      existing.comment = comment;
      existing.images = images || existing.images;
      existing.status = 'approved'; // auto-approved or pending based on policy
      saveDatabase();
      return res.json(existing);
    }

    const prod = db.products.find((p: any) => p.id === productId);

    const newReview = {
      id: `rev_${Date.now()}`,
      productId,
      productName: prod ? prod.name : 'Garment',
      orderId: eligibleOrder.id,
      userId,
      userName: req.user.name,
      rating: parseInt(rating, 10),
      title: title || 'Verified Purchase Review',
      comment,
      images: images || [],
      isVerifiedPurchase: true,
      status: 'approved', // instant live for great UX, can be moderated in admin
      createdAt: new Date().toISOString()
    };

    db.reviews.unshift(newReview);

    // Update product average rating & review count
    if (prod) {
      const prodApprovedReviews = db.reviews.filter((r: any) => r.productId === productId && r.status === 'approved');
      const sum = prodApprovedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      prod.reviewCount = prodApprovedReviews.length;
      prod.averageRating = prod.reviewCount > 0 ? parseFloat((sum / prod.reviewCount).toFixed(1)) : 5.0;
    }

    saveDatabase();
    return res.status(201).json(newReview);
  });

  app.put('/api/reviews/:id/status', requireAdmin, (req, res) => {
    const rev = db.reviews.find((r: any) => r.id === req.params.id);
    if (!rev) return res.status(404).json({ error: 'Review not found' });

    rev.status = req.body.status;
    const prod = db.products.find((p: any) => p.id === rev.productId);
    if (prod) {
      const prodApprovedReviews = db.reviews.filter((r: any) => r.productId === rev.productId && r.status === 'approved');
      const sum = prodApprovedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
      prod.reviewCount = prodApprovedReviews.length;
      prod.averageRating = prod.reviewCount > 0 ? parseFloat((sum / prod.reviewCount).toFixed(1)) : 5.0;
    }

    saveDatabase();
    res.json(rev);
  });

  // -------------------------------------------------------------
  // INVENTORY & STOCK MANAGEMENT APIS
  // -------------------------------------------------------------
  app.get('/api/inventory', requireAdmin, (req, res) => {
    const inventoryList = db.products.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      totalStock: p.totalStock,
      lowStockThreshold: p.lowStockThreshold || 5,
      isLowStock: p.totalStock <= (p.lowStockThreshold || 5) && p.totalStock > 0,
      isOutOfStock: p.totalStock === 0,
      costPrice: p.costPrice || (p.price * 0.5),
      sellingPrice: p.price,
      variants: p.variants || []
    }));

    // Calculate total valuation
    const totalValuation = inventoryList.reduce(
      (sum: number, p: any) => sum + p.totalStock * p.costPrice,
      0
    );

    res.json({
      items: inventoryList,
      totalValuation: Math.round(totalValuation),
      transactions: db.inventoryTransactions.slice(-50).reverse()
    });
  });

  app.post('/api/inventory/adjustment', requireAdmin, (req: any, res) => {
    const { productId, variantId, type, quantity, reason } = req.body;
    const prod = db.products.find((p: any) => p.id === productId);
    if (!prod) return res.status(404).json({ error: 'Product not found' });

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Valid positive quantity required.' });
    }

    let prevStock = 0;
    let newStock = 0;
    let variantTitle = '';

    if (variantId) {
      const variant = prod.variants.find((v: any) => v.id === variantId);
      if (!variant) return res.status(404).json({ error: 'Variant not found' });
      prevStock = variant.stockQuantity;
      variantTitle = variant.title;

      if (type === 'stock_in') {
        newStock = prevStock + qty;
      } else if (type === 'stock_out') {
        newStock = Math.max(0, prevStock - qty);
      } else {
        // Direct set/adjustment
        newStock = qty;
      }
      variant.stockQuantity = newStock;
      variant.isAvailable = newStock > 0;
      prod.totalStock = prod.variants.reduce((s: number, v: any) => s + v.stockQuantity, 0);
    } else {
      prevStock = prod.totalStock;
      if (type === 'stock_in') {
        newStock = prevStock + qty;
      } else if (type === 'stock_out') {
        newStock = Math.max(0, prevStock - qty);
      } else {
        newStock = qty;
      }
      prod.totalStock = newStock;
    }

    db.inventoryTransactions.push({
      id: `tx_${Date.now()}`,
      productId: prod.id,
      variantId,
      productName: prod.name,
      variantTitle,
      type,
      quantity: qty,
      previousStock: prevStock,
      newStock,
      reason: reason || 'Manual Admin Inventory Adjustment',
      createdAt: new Date().toISOString(),
      createdBy: req.user.name
    });

    saveDatabase();
    res.json({ success: true, newStock, totalStock: prod.totalStock });
  });

  // -------------------------------------------------------------
  // CUSTOMER MANAGEMENT & TICKETS APIS
  // -------------------------------------------------------------
  app.get('/api/customers', requireAdmin, (req, res) => {
    const customers = db.users
      .filter((u: any) => u.role === 'customer')
      .map((u: any) => {
        const userOrders = db.orders.filter(
          (o: any) => o.userId === u.id || o.customerEmail.toLowerCase() === u.email.toLowerCase()
        );
        const totalSpent = userOrders.reduce((sum: number, o: any) => sum + o.total, 0);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar,
          createdAt: u.createdAt,
          orderCount: userOrders.length,
          totalSpent,
          tags: u.tags || ['Customer'],
          addresses: u.addresses || []
        };
      });
    res.json(customers);
  });

  // Support Tickets
  app.get('/api/support/tickets', (req, res) => {
    const authHeader = req.headers.authorization;
    const decoded = verifyToken(authHeader);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const user = db.users.find((u: any) => u.id === decoded.id);
    const isStaff = user && ['super_admin', 'store_manager', 'support_staff'].includes(user.role);

    if (isStaff) {
      return res.json(db.supportTickets);
    }
    const userTickets = db.supportTickets.filter(
      (t: any) => t.userId === user.id || t.customerEmail.toLowerCase() === user.email.toLowerCase()
    );
    res.json(userTickets);
  });

  app.post('/api/support/tickets', (req, res) => {
    const { name, email, phone, subject, category, message, userId } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }

    const ticketNumber = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber,
      userId: userId || null,
      customerName: name,
      customerEmail: email.toLowerCase().trim(),
      customerPhone: phone || '',
      subject,
      category: category || 'general',
      status: 'open',
      priority: 'medium',
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'customer',
          senderName: name,
          message,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.supportTickets.unshift(newTicket);
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      forAdmin: true,
      title: `Support Ticket: ${ticketNumber}`,
      message: `Inquiry from ${name}: "${subject}"`,
      type: 'support',
      isRead: false,
      link: '/admin/support',
      createdAt: new Date().toISOString()
    });

    saveDatabase();
    res.status(201).json(newTicket);
  });

  app.post('/api/support/tickets/:id/reply', (req, res) => {
    const ticket = db.supportTickets.find((t: any) => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const { message, senderName, sender } = req.body;
    if (!message) return res.status(400).json({ error: 'Message cannot be empty' });

    ticket.messages.push({
      id: `msg_${Date.now()}`,
      sender: sender || 'staff',
      senderName: senderName || 'Support Team',
      message,
      timestamp: new Date().toISOString()
    });

    if (sender === 'staff' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    ticket.updatedAt = new Date().toISOString();
    saveDatabase();

    res.json(ticket);
  });

  app.put('/api/support/tickets/:id/status', requireAdmin, (req, res) => {
    const ticket = db.supportTickets.find((t: any) => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.status = req.body.status;
    ticket.updatedAt = new Date().toISOString();
    saveDatabase();
    res.json(ticket);
  });

  // -------------------------------------------------------------
  // MARKETING, NEWSLETTER & CMS APIS
  // -------------------------------------------------------------
  app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required.' });
    }
    const normalized = email.toLowerCase().trim();
    const existing = db.newsletterSubscribers.find((s: any) => s.email === normalized);
    if (existing) {
      return res.json({ message: 'You are already subscribed to our luxury newsletter!' });
    }

    db.newsletterSubscribers.unshift({
      id: `sub_${Date.now()}`,
      email: normalized,
      subscribedAt: new Date().toISOString(),
      isActive: true
    });
    saveDatabase();
    res.status(201).json({ message: 'Thank you for subscribing to Ladies Garments Comfort.' });
  });

  app.get('/api/newsletter/subscribers', requireAdmin, (req, res) => {
    res.json(db.newsletterSubscribers);
  });

  app.get('/api/cms/banners', (req, res) => {
    res.json(db.heroBanners || []);
  });

  app.put('/api/cms/banners', requireAdmin, (req, res) => {
    db.heroBanners = req.body;
    saveDatabase();
    res.json(db.heroBanners);
  });

  // Notifications API
  app.get('/api/notifications', (req, res) => {
    const authHeader = req.headers.authorization;
    const decoded = verifyToken(authHeader);
    if (!decoded) return res.json([]);
    const user = db.users.find((u: any) => u.id === decoded.id);
    const isStaff = user && ['super_admin', 'store_manager', 'order_manager'].includes(user.role);

    if (isStaff) {
      return res.json(db.notifications.filter((n: any) => n.forAdmin));
    }
    return res.json(db.notifications.filter((n: any) => n.userId === user.id));
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const notif = db.notifications.find((n: any) => n.id === req.params.id);
    if (notif) notif.isRead = true;
    saveDatabase();
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // ANALYTICS & FINANCIAL BI REPORTS APIS (Real database metrics)
  // -------------------------------------------------------------
  app.get('/api/analytics/reports', requireAdmin, (req, res) => {
    const { range } = req.query; // 'today', '7days', '30days', 'month', 'all'
    const now = new Date();
    let cutoff = new Date(0);

    if (range === 'today') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7days') {
      cutoff = new Date(now.getTime() - 7 * 86400000);
    } else if (range === '30days') {
      cutoff = new Date(now.getTime() - 30 * 86400000);
    } else if (range === 'month') {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filteredOrders = db.orders.filter(
      (o: any) => new Date(o.createdAt) >= cutoff && o.orderStatus !== 'cancelled'
    );

    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const grossSales = filteredOrders.reduce((sum: number, o: any) => sum + o.subtotal, 0);
    const totalDiscountGiven = filteredOrders.reduce((sum: number, o: any) => sum + (o.discountAmount || 0), 0);
    const totalTaxCollected = filteredOrders.reduce((sum: number, o: any) => sum + (o.taxAmount || 0), 0);
    const totalShippingCollected = filteredOrders.reduce((sum: number, o: any) => sum + (o.shippingFee || 0), 0);
    const netSales = grossSales - totalDiscountGiven;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Order status counts across all orders
    const orderStatusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      packed: 0,
      shipped: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
      return_requested: 0,
      returned: 0,
      refunded: 0
    };
    db.orders.forEach((o: any) => {
      orderStatusCounts[o.orderStatus] = (orderStatusCounts[o.orderStatus] || 0) + 1;
    });

    // Daily sales last 7 or 14 days
    const dailySalesMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toISOString().slice(0, 10);
      dailySalesMap[dateKey] = {
        date: d.toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: 0,
        orders: 0
      };
    }
    filteredOrders.forEach((o: any) => {
      const dateKey = o.createdAt.slice(0, 10);
      if (dailySalesMap[dateKey]) {
        dailySalesMap[dateKey].revenue += o.total;
        dailySalesMap[dateKey].orders += 1;
      }
    });

    // Category sales
    const categorySalesMap: Record<string, { categoryName: string; revenue: number; count: number }> = {};
    filteredOrders.forEach((o: any) => {
      o.items.forEach((it: any) => {
        const prod = db.products.find((p: any) => p.id === it.productId);
        const cat = prod ? db.categories.find((c: any) => c.id === prod.categoryId) : null;
        const catName = cat ? cat.name : 'Other Garments';
        if (!categorySalesMap[catName]) {
          categorySalesMap[catName] = { categoryName: catName, revenue: 0, count: 0 };
        }
        categorySalesMap[catName].revenue += it.price * it.quantity;
        categorySalesMap[catName].count += it.quantity;
      });
    });

    // Payment method breakdown
    const paymentMap: Record<string, { method: string; count: number; total: number }> = {
      cod: { method: 'Cash on Delivery', count: 0, total: 0 },
      card: { method: 'Credit/Debit Card', count: 0, total: 0 },
      bank_transfer: { method: 'Bank Transfer', count: 0, total: 0 }
    };
    filteredOrders.forEach((o: any) => {
      const m = o.paymentMethod || 'cod';
      if (paymentMap[m]) {
        paymentMap[m].count += 1;
        paymentMap[m].total += o.total;
      }
    });

    // Top selling products
    const productSalesMap: Record<string, { id: string; name: string; sku: string; unitsSold: number; revenue: number }> = {};
    filteredOrders.forEach((o: any) => {
      o.items.forEach((it: any) => {
        if (!productSalesMap[it.productId]) {
          productSalesMap[it.productId] = {
            id: it.productId,
            name: it.name,
            sku: it.sku,
            unitsSold: 0,
            revenue: 0
          };
        }
        productSalesMap[it.productId].unitsSold += it.quantity;
        productSalesMap[it.productId].revenue += it.price * it.quantity;
      });
    });
    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    res.json({
      totalRevenue,
      grossSales,
      netSales,
      totalOrders,
      averageOrderValue,
      totalDiscountGiven,
      totalTaxCollected,
      totalShippingCollected,
      orderStatusCounts,
      dailySales: Object.values(dailySalesMap),
      categorySales: Object.values(categorySalesMap),
      paymentMethodBreakdown: Object.values(paymentMap),
      topSellingProducts,
      totalCustomers: db.users.filter((u: any) => u.role === 'customer').length,
      totalProducts: db.products.length,
      lowStockCount: db.products.filter((p: any) => p.totalStock <= (p.lowStockThreshold || 5) && p.totalStock > 0).length,
      outOfStockCount: db.products.filter((p: any) => p.totalStock === 0).length
    });
  });

  // -------------------------------------------------------------
  // VITE OR STATIC FRONTEND SERVING
  // -------------------------------------------------------------
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ladies Garments Comfort Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
