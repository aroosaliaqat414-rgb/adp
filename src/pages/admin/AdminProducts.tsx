import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  Layers,
  Sparkles,
  AlertCircle,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, Category, ProductVariant } from '../../types';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(4500);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(5500);
  const [costPrice, setCostPrice] = useState<number>(2200);
  const [sku, setSku] = useState('');
  const [fabric, setFabric] = useState('100% Pure Lawn');
  const [careInstructions, setCareInstructions] = useState('Gentle hand wash cold.');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  // Multi-variants
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: 'var_s',
      productId: '',
      title: 'Standard / S',
      size: 'S',
      color: 'Standard',
      sku: 'SKU-S',
      price: 4500,
      stockQuantity: 10,
      isAvailable: true
    },
    {
      id: 'var_m',
      productId: '',
      title: 'Standard / M',
      size: 'M',
      color: 'Standard',
      sku: 'SKU-M',
      price: 4500,
      stockQuantity: 15,
      isAvailable: true
    },
    {
      id: 'var_l',
      productId: '',
      title: 'Standard / L',
      size: 'L',
      color: 'Standard',
      sku: 'SKU-L',
      price: 4500,
      stockQuantity: 10,
      isAvailable: true
    }
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.getProducts({ status: 'all' }),
        api.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setShortDesc('');
    setPrice(4500);
    setCompareAtPrice(5500);
    setCostPrice(2200);
    setSku(`LGC-${Date.now().toString().slice(-4)}`);
    setFabric('Pure Combed Lawn');
    setCareInstructions('Hand wash with mild detergent.');
    setImages([
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
    ]);
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setStatus('active');
    setVariants([
      { id: 'v1', productId: '', title: 'Standard / S', size: 'S', color: 'Standard', sku: 'SKU-S', price: 4500, stockQuantity: 8, isAvailable: true },
      { id: 'v2', productId: '', title: 'Standard / M', size: 'M', color: 'Standard', sku: 'SKU-M', price: 4500, stockQuantity: 12, isAvailable: true },
      { id: 'v3', productId: '', title: 'Standard / L', size: 'L', color: 'Standard', sku: 'SKU-L', price: 4500, stockQuantity: 8, isAvailable: true }
    ]);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setShortDesc(p.shortDescription || '');
    setCategoryId(p.categoryId);
    setPrice(p.price);
    setCompareAtPrice(p.compareAtPrice || 0);
    setCostPrice(p.costPrice || p.price * 0.5);
    setSku(p.sku);
    setFabric(p.fabric);
    setCareInstructions(p.careInstructions);
    setImages(p.images);
    setIsFeatured(p.isFeatured);
    setIsNewArrival(p.isNewArrival);
    setIsBestSeller(p.isBestSeller);
    setStatus(p.status === 'archived' ? 'draft' : p.status);
    setVariants(p.variants || []);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      shortDescription: shortDesc,
      categoryId,
      price: Number(price),
      compareAtPrice: Number(compareAtPrice) || null,
      costPrice: Number(costPrice) || null,
      sku,
      fabric,
      careInstructions,
      images,
      isFeatured,
      isNewArrival,
      isBestSeller,
      status,
      variants
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateProduct(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const addVariantRow = () => {
    setVariants([
      ...variants,
      {
        id: `var_${Date.now()}`,
        productId: editingProduct?.id || '',
        title: 'New Variant',
        size: 'M',
        color: 'Standard',
        sku: `${sku || 'SKU'}-${variants.length + 1}`,
        price,
        stockQuantity: 5,
        isAvailable: true
      }
    ]);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#231826]">
            Garment Catalog & Variations
          </h1>
          <p className="text-xs text-[#8E8191]">
            Create and edit women's clothing, multi-size variants, and stock
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#8E1EA2] hover:bg-[#751786] text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EFE6EE] flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by product name, SKU, or collection..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-xs focus:outline-hidden"
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border border-[#EFE6EE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FCFAF8] text-[#8E8191] uppercase text-[10px] border-b border-[#EFE6EE]">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SKU Base</th>
                <th className="py-3 px-4">Price (PKR)</th>
                <th className="py-3 px-4">Total Stock</th>
                <th className="py-3 px-4">Variants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE6EE]/60">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-[#FCFAF8] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-12 rounded-lg object-cover" />
                      <div>
                        <span className="font-semibold text-[#231826] line-clamp-1">{p.name}</span>
                        <span className="text-[10px] text-gray-400">{p.fabric}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#5A4E5C] font-medium">{p.categoryName}</td>
                  <td className="py-3 px-4 font-mono text-gray-500">{p.sku}</td>
                  <td className="py-3 px-4 font-bold text-[#8E1EA2] font-mono">
                    Rs. {p.price.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`font-bold ${p.totalStock === 0 ? 'text-red-500' : p.totalStock <= 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {p.totalStock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {p.variants?.length || 0} variations
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      p.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-[#8E1EA2]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-indigo-600"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE6EE]">
              <h2 className="font-serif text-xl font-bold text-[#231826]">
                {editingProduct ? 'Edit Garment Product' : 'Add New Garment Product'}
              </h2>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE] bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Base SKU *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Selling Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Compare-At / Regular Price (PKR)</label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={e => setCompareAtPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Cost of Goods (PKR)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={e => setCostPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Fabric Composition</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={e => setFabric(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#EFE6EE]"
                  />
                </div>
              </div>

              {/* Variations Grid */}
              <div className="p-4 rounded-2xl bg-[#FCFAF8] border border-[#EFE6EE] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#231826]">
                    Product Variations (Sizes, Colors, Stock)
                  </h4>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="px-3 py-1 bg-[#8E1EA2] text-white rounded-lg text-xs font-semibold"
                  >
                    + Add Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-[#EFE6EE]">
                      <input
                        type="text"
                        placeholder="Size (S, M, L)"
                        value={v.size}
                        onChange={e => {
                          const updated = [...variants];
                          updated[i].size = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-20 p-1.5 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Color"
                        value={v.color}
                        onChange={e => {
                          const updated = [...variants];
                          updated[i].color = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-28 p-1.5 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Variant SKU"
                        value={v.sku}
                        onChange={e => {
                          const updated = [...variants];
                          updated[i].sku = e.target.value;
                          setVariants(updated);
                        }}
                        className="flex-1 p-1.5 border rounded-lg font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={v.stockQuantity}
                        onChange={e => {
                          const updated = [...variants];
                          updated[i].stockQuantity = Number(e.target.value);
                          setVariants(updated);
                        }}
                        className="w-20 p-1.5 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={e => {
                          const updated = [...variants];
                          updated[i].price = Number(e.target.value);
                          setVariants(updated);
                        }}
                        className="w-24 p-1.5 border rounded-lg font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Images Manager */}
              <div>
                <label className="block font-semibold mb-1">Product Images</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-[#EFE6EE]"
                  />
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="px-3 py-2 bg-gray-800 text-white rounded-xl"
                  >
                    Add URL
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto py-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-20 rounded-xl overflow-hidden border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges / Visibility */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="accent-[#8E1EA2]"
                  />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={e => setIsNewArrival(e.target.checked)}
                    className="accent-[#8E1EA2]"
                  />
                  <span>New Arrival Badge</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={e => setIsBestSeller(e.target.checked)}
                    className="accent-[#8E1EA2]"
                  />
                  <span>Bestseller Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#EFE6EE]">
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
