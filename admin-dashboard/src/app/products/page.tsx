'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { apiClient } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import {
  Plus,
  Package,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [isEligibleForRewards, setIsEligibleForRewards] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/products/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data?.url) {
        setImageUrl(res.data.url);
      } else {
        throw new Error('No image URL returned from upload');
      }
    } catch (err: any) {
      console.warn('Backend upload attempted, falling back to direct storage:', err);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        setImageUrl(data.publicUrl);
      } catch (fallbackErr: any) {
        setFormError('Failed to upload image: ' + (err.response?.data?.error || err.message || 'Unknown error'));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/products/admin/all');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      setCategories(res.data || []);
      if (res.data?.length > 0) setCategoryId(res.data[0].id);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    try {
      // 1. Create product
      const res = await apiClient.post('/products', {
        name,
        description,
        selling_price: parseFloat(sellingPrice),
        mrp: mrp ? parseFloat(mrp) : parseFloat(sellingPrice),
        sku: sku || `SKU-${Date.now()}`,
        category_id: categoryId || undefined,
        stock_quantity: parseInt(stockQuantity),
        is_eligible_for_rewards: isEligibleForRewards,
      });

      const newProd = res.data;

      // 2. Add photo if URL provided
      if (imageUrl) {
        await apiClient.post(`/products/${newProd.id}/images`, {
          url: imageUrl,
          is_primary: true,
        });
      }

      // 3. Mark active
      await apiClient.patch(`/products/${newProd.id}`, {
        status: 'active',
      });

      setShowAddModal(false);
      resetForm();
      loadProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product: any) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await apiClient.patch(`/products/${product.id}`, { status: nextStatus });
      loadProducts();
    } catch (err) {
      console.error('Failed to update product status:', err);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      console.error('Failed to archive product:', err);
    }
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setName(p.name || '');
    setDescription(p.description || '');
    setSellingPrice(p.selling_price?.toString() || '');
    setMrp(p.mrp?.toString() || '');
    setSku(p.sku || '');
    setCategoryId(p.category_id || (p.categories?.id || ''));
    const stock = p.inventory?.[0]?.quantity ?? (p.inventory?.quantity ?? 0);
    setStockQuantity(stock.toString());
    setIsEligibleForRewards(p.is_eligible_for_rewards !== false);
    const existingImg = p.product_images?.[0]?.url || '';
    setImageUrl(existingImg);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setFormError(null);
    setSaving(true);

    try {
      await apiClient.patch(`/products/${editingProduct.id}`, {
        name,
        description,
        selling_price: parseFloat(sellingPrice),
        mrp: mrp ? parseFloat(mrp) : parseFloat(sellingPrice),
        sku,
        category_id: categoryId || undefined,
        stock_quantity: parseInt(stockQuantity),
        is_eligible_for_rewards: isEligibleForRewards,
      });

      if (imageUrl && (!editingProduct.product_images || editingProduct.product_images[0]?.url !== imageUrl)) {
        await apiClient.post(`/products/${editingProduct.id}/images`, {
          url: imageUrl,
          is_primary: true,
        });
      }

      setShowEditModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSellingPrice('');
    setMrp('');
    setSku('');
    setImageUrl('');
    setFormError(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole="admin" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Product Catalog & Inventory"
          subtitle="Publish products, upload imagery, configure stock, and manage eligible rewards"
          actionButton={
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          }
        />

        <div className="p-8">
          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">All Products</h3>
                <p className="text-xs text-slate-500 mt-0.5">Published products immediately appear in the GrowPlus Shopping App</p>
              </div>
              <button
                onClick={loadProducts}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading product catalog...</div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">No products created yet</h4>
                <p className="text-xs text-slate-400 mt-1">Add your first product to start populating the catalog.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                >
                  Create Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Product Details</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Selling Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Rewards Eligible</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{p.description}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.sku || 'N/A'}</td>
                        <td className="px-6 py-4">{p.categories?.name || 'General'}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          ₹{Number(p.selling_price).toLocaleString('en-IN')}
                          {p.mrp && Number(p.mrp) > Number(p.selling_price) && (
                            <span className="ml-1.5 text-xs text-slate-400 line-through">₹{p.mrp}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              (p.inventory?.[0]?.quantity ?? 0) <= 10
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {p.inventory?.[0]?.quantity ?? 0} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.is_eligible_for_rewards ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span>Eligible</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                              p.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {p.status === 'active' ? '● Active' : '○ Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => setPreviewProduct(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-100"
                            title="Edit Product & Inventory"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchive(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            title="Archive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Add New Product</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Complete specifications and product highlights..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="2999"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      placeholder="4999"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Inventory Quantity</label>
                    <input
                      type="number"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="100"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Photo (Upload or URL)</label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium border border-slate-300 flex items-center space-x-1.5 transition">
                      <Upload className="w-4 h-4 text-slate-600" />
                      <span>{uploadingImage ? 'Uploading...' : 'Browse'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 flex items-center space-x-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <img src={imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded border border-slate-300" />
                      <span className="text-xs text-emerald-600 font-medium truncate flex-1">Image attached: {imageUrl}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Upload directly to Supabase Storage 'products' bucket or enter secure CDN URL</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="rewards-eligible"
                    checked={isEligibleForRewards}
                    onChange={(e) => setIsEligibleForRewards(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="rewards-eligible" className="text-sm font-medium text-slate-700">
                    Eligible for GrowPlus Referral Rewards
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {saving ? 'Publishing...' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Product & Inventory</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{editingProduct.sku}</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProduct} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={mrp}
                      onChange={(e) => setMrp(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Inventory Quantity in Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Photo (Upload or URL)</label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium border border-slate-300 flex items-center space-x-1.5 transition">
                      <Upload className="w-4 h-4 text-slate-600" />
                      <span>{uploadingImage ? '...' : 'Browse'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="mt-2 flex items-center space-x-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <img src={imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded border border-slate-300" />
                      <span className="text-xs text-emerald-600 font-medium truncate flex-1">{imageUrl}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit-rewards-eligible"
                    checked={isEligibleForRewards}
                    onChange={(e) => setIsEligibleForRewards(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="edit-rewards-eligible" className="text-sm font-medium text-slate-700">
                    Eligible for GrowPlus Referral Rewards
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Save Product & Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Preview Modal */}
        {previewProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Mobile App Preview</span>
                <button onClick={() => setPreviewProduct(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="mt-4">
                <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                  {previewProduct.product_images?.[0]?.url ? (
                    <img
                      src={previewProduct.product_images[0].url}
                      alt={previewProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-12 h-12 text-slate-300" />
                  )}
                </div>

                <h4 className="text-lg font-bold text-slate-900">{previewProduct.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{previewProduct.description}</p>

                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900">₹{previewProduct.selling_price}</span>
                  {previewProduct.mrp && (
                    <span className="text-sm text-slate-400 line-through">₹{previewProduct.mrp}</span>
                  )}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                  <div><span className="font-semibold">Category:</span> {previewProduct.categories?.name || 'General'}</div>
                  <div><span className="font-semibold">Stock:</span> {previewProduct.inventory?.[0]?.quantity ?? 0} units available</div>
                  <div>
                    <span className="font-semibold">Rewards status:</span>{' '}
                    {previewProduct.is_eligible_for_rewards ? 'Eligible for referral credit' : 'Standard'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
