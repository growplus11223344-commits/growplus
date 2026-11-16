"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  DIRECT_SELLING_PRODUCTS,
  DirectSellingProduct,
} from "@/data/directSellingProducts";
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Star,
  Search,
  Filter,
  Check,
  ArrowRight,
  Eye,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Tag,
  Leaf,
  Layers,
} from "lucide-react";

export const ProductsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"featured" | "bv-high" | "price-low" | "price-high">("featured");
  
  // Modal & Cart State
  const [viewProduct, setViewProduct] = useState<DirectSellingProduct | null>(null);
  const [cartItems, setCartItems] = useState<{ product: DirectSellingProduct; quantity: number }[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const categories = [
    "All",
    "Health & Wellness",
    "Ayurvedic Care",
    "Personal Care",
    "Home Care",
    "Agri-Tech",
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return DIRECT_SELLING_PRODUCTS.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.hindiName && item.hindiName.includes(searchQuery));
      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === "bv-high") return b.bv - a.bv;
      if (sortBy === "price-low") return a.dp - b.dp;
      if (sortBy === "price-high") return b.dp - a.dp;
      return 0; // default featured
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Cart operations
  const addToCart = (product: DirectSellingProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: DirectSellingProduct; quantity: number }[]
    );
  };

  // Cart totals
  const totalMrp = cartItems.reduce(
    (sum, item) => sum + item.product.mrp * item.quantity,
    0
  );
  const totalDp = cartItems.reduce(
    (sum, item) => sum + item.product.dp * item.quantity,
    0
  );
  const totalBv = cartItems.reduce(
    (sum, item) => sum + item.product.bv * item.quantity,
    0
  );
  const totalSavings = totalMrp - totalDp;
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section id="products" className="relative py-24 bg-[#0A0E24] border-t border-white/5 overflow-hidden">
      {/* Toast Alert for Cart Addition */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#121B3B] border border-[#35E6A2] text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <div className="w-8 h-8 rounded-full bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold block text-white">Added to Distributor Cart</span>
            <span className="text-[#AAA2C1] line-clamp-1">{addedToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="ml-2 px-3 py-1 rounded-lg bg-[#35E6A2] text-black font-extrabold text-xs"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Floating Distributor Cart Trigger Button */}
      {totalCount > 0 && (
        <button
          type="button"
          onClick={() => setCartDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-40 px-5 py-3 rounded-full bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 hover:scale-105 transition-transform"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Cart ({totalCount} items)</span>
          <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-mono">
            {totalBv} BV
          </span>
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ======================================================== */}
        {/* SECTION HEADER: DIRECT SELLING PRODUCTS */}
        {/* ======================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141E45] border border-[#35E6A2]/40 text-xs font-semibold text-[#35E6A2]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Product-Based Direct Selling</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              GrowPlus Certified Products <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
                Health, Ayurveda, Beauty &amp; Home Care
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
              Inspired by industry benchmarks (Amway Nutrilite, Vestige Prime, Mi Lifestyle Elements Wellness). 
              Every product delivers 100% genuine results, maximum distributor discounts (DP), and high Business Volume (BV) for binary payouts.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-[#0E1533] border border-white/10 text-center min-w-[120px]">
              <span className="text-lg font-black text-[#35E6A2] font-mono">15% - 25%</span>
              <span className="text-[10px] text-[#AAA2C1] block">Retail Margin (DP)</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#0E1533] border border-white/10 text-center min-w-[120px]">
              <span className="text-lg font-black text-[#38BDF8] font-mono">100% BV</span>
              <span className="text-[10px] text-[#AAA2C1] block">Binary Matching</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEARCH, CATEGORY FILTERS & SORTING CONTROLS */}
        {/* ======================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#AAA2C1] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, health benefit or herbs..."
                className="w-full bg-[#0E1533] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/60 focus:outline-none focus:border-[#38BDF8] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA2C1] hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-[#AAA2C1] shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0E1533] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
              >
                <option value="featured">Featured Collection</option>
                <option value="bv-high">Highest Business Volume (BV)</option>
                <option value="price-low">Distributor Price (Low to High)</option>
                <option value="price-high">Distributor Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black shadow-md scale-102"
                      : "bg-[#0E1533] border border-white/10 text-[#AAA2C1] hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PRODUCT CATALOG GRID ("all product display honge") */}
        {/* ======================================================== */}
        {filteredProducts.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#0E1533] text-center border border-white/10 space-y-3">
            <p className="text-sm text-white font-bold">No products match your search or filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#287CFF] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const discount = Math.round(((prod.mrp - prod.dp) / prod.mrp) * 100);

              return (
                <div
                  key={prod.id}
                  className="rounded-3xl bg-[#0E1533] border border-white/10 hover:border-[#287CFF]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:-translate-y-1 group"
                >
                  {/* Top Image & Badges */}
                  <div className="relative aspect-square w-full bg-[#131D42] overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1533] via-transparent to-transparent opacity-80" />

                    {/* Quality / Ayurvedic Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                      {prod.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/30">
                          {prod.badge}
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121B3B]/80 backdrop-blur-md text-[9px] font-semibold text-[#38BDF8] border border-[#287CFF]/30">
                        {prod.category}
                      </span>
                    </div>

                    {/* BV (Business Volume) Pill */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#35E6A2]/90 backdrop-blur-md text-black font-mono font-black text-xs shadow-md">
                      {prod.bv} BV
                    </div>

                    {/* Size Pill */}
                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded-md">
                      {prod.size}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#AAA2C1] font-mono">
                          {prod.rating} ({prod.reviewsCount})
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-extrabold text-sm sm:text-base text-white line-clamp-1 group-hover:text-[#38BDF8] transition-colors">
                        {prod.name}
                      </h3>
                      {prod.hindiName && (
                        <span className="text-[11px] text-[#35E6A2] font-medium block mt-0.5">
                          {prod.hindiName}
                        </span>
                      )}

                      {/* Short Description */}
                      <p className="text-xs text-[#AAA2C1] line-clamp-2 mt-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Pricing & BV Breakdown */}
                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-[#AAA2C1] block">Distributor Price (DP)</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-[#35E6A2] font-mono">
                              ₹{prod.dp}
                            </span>
                            <span className="text-xs text-[#AAA2C1] line-through font-mono">
                              ₹{prod.mrp}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                          Save {discount}%
                        </span>
                      </div>

                      {/* Dual Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setViewProduct(prod)}
                          className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => addToCart(prod)}
                          className="py-2 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] hover:opacity-95 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* PRODUCT QUICK VIEW MODAL */}
      {/* ======================================================== */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0E1533] border border-[#287CFF]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setViewProduct(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Product Image */}
              <div className="md:col-span-5 rounded-2xl overflow-hidden bg-[#131D42] aspect-square relative border border-white/10">
                <img
                  src={viewProduct.image}
                  alt={viewProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-amber-300">
                  {viewProduct.badge}
                </div>
              </div>

              {/* Product Info */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-wider block">
                    {viewProduct.category} • {viewProduct.size}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {viewProduct.name}
                  </h3>
                  {viewProduct.hindiName && (
                    <span className="text-xs font-semibold text-[#35E6A2] block mt-0.5">
                      {viewProduct.hindiName}
                    </span>
                  )}
                </div>

                {/* Price & BV Box */}
                <div className="p-4 rounded-2xl bg-[#141E45] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#AAA2C1] block">Distributor Price (DP)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#35E6A2] font-mono">
                        ₹{viewProduct.dp}
                      </span>
                      <span className="text-xs text-[#AAA2C1] line-through font-mono">
                        ₹{viewProduct.mrp}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#AAA2C1] block">Binary Value</span>
                    <span className="text-base font-black text-[#38BDF8] font-mono">
                      {viewProduct.bv} BV / {viewProduct.pv} PV
                    </span>
                  </div>
                </div>

                {/* Key Benefits */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Key Health &amp; Herbal Benefits
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#AAA2C1]">
                    {viewProduct.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#35E6A2] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ingredients & Certification */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                  <div>
                    <strong className="text-white">Active Ingredients: </strong>
                    <span className="text-[#AAA2C1]">{viewProduct.ingredients.join(", ")}</span>
                  </div>
                  <div>
                    <strong className="text-white">Directions for Use: </strong>
                    <span className="text-[#AAA2C1]">{viewProduct.usage}</span>
                  </div>
                  <div>
                    <strong className="text-[#35E6A2]">Certification: </strong>
                    <span className="text-[#35E6A2] font-semibold">{viewProduct.certification}</span>
                  </div>
                </div>

                {/* Action button in modal */}
                <button
                  type="button"
                  onClick={() => {
                    addToCart(viewProduct);
                    setViewProduct(null);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Distributor Order (₹{viewProduct.dp})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DISTRIBUTOR SHOPPING CART DRAWER */}
      {/* ======================================================== */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md h-full bg-[#0E1533] border-l border-[#287CFF]/40 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#35E6A2]" />
                  <h3 className="font-black text-lg text-white">Your Distributor Cart</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCartDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="py-4 space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-[#AAA2C1] text-xs space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-white/20" />
                    <p>Your distributor cart is empty.</p>
                  </div>
                ) : (
                  cartItems.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="p-3 rounded-2xl bg-[#141E45] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-xs text-white line-clamp-1">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-[#35E6A2] font-mono block">
                            ₹{product.dp} × {quantity} = ₹{product.dp * quantity}
                          </span>
                          <span className="text-[10px] text-[#38BDF8] font-mono">
                            {product.bv * quantity} BV
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-[#0E1533] border border-white/10 rounded-lg p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-white flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Checkout Summary */}
            {cartItems.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#AAA2C1]">
                    <span>Total MRP:</span>
                    <span className="line-through font-mono">₹{totalMrp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Distributor Retail Margin Saved:</span>
                    <span className="font-bold font-mono">-₹{totalSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#38BDF8]">
                    <span>Accumulated Business Volume:</span>
                    <span className="font-bold font-mono">+{totalBv.toLocaleString()} BV</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                    <span>Payable DP Amount:</span>
                    <span className="text-[#35E6A2] font-mono">₹{totalDp.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert(`Proceeding to Distributor Order! Total Payable: ₹${totalDp.toLocaleString()} with ${totalBv.toLocaleString()} BV points credit.`);
                    setCartDrawerOpen(false);
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:opacity-95"
                >
                  <span>Proceed to Distributor Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};

