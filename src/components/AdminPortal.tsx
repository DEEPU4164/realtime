/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MenuItem, Order, RestaurantSettings } from "../types";
import { Lock, LogOut, CheckCircle, PlusCircle, Trash, X, Save, Sparkles, Receipt, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPortalProps {
  isAdmin: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  orders: Order[];
  onClearOrders: () => void;
  onAddNewItem: (item: Omit<MenuItem, "id">) => void;
  onResetMenuToDefault?: () => void;
  settings?: RestaurantSettings;
  onUpdateSettings?: (settings: RestaurantSettings) => void;
}

export function AdminPortal({
  isAdmin,
  onLogin,
  onLogout,
  orders,
  onClearOrders,
  onAddNewItem,
  onResetMenuToDefault,
  settings,
  onUpdateSettings,
}: AdminPortalProps) {
  const [passwordInput, setPasswordInput] = useState("");
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isAdminQueryActive, setIsAdminQueryActive] = useState(false);

  // New item form state
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Tiffins");
  const [newIsVeg, setNewIsVeg] = useState(true);
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  // Profile fields state
  const [profileWhatsApp, setProfileWhatsApp] = useState(settings?.whatsappNumber || "919550454565");
  const [profileEmail, setProfileEmail] = useState(settings?.businessEmail || "hotelanupamainn@gmail.com");
  const [profileHours, setProfileHours] = useState(settings?.operatingHours || "12:00 AM – 4:00 PM & 6:30 PM – 10:30 PM");
  const [profileAddress, setProfileAddress] = useState(settings?.restaurantAddress || "Hotel Anupama Inn, Opp. 3 Town Police Station, Waltair Main Rd, Chinna Waltair, Visakhapatnam, Andhra Pradesh 530003");
  const [profileAccepting, setProfileAccepting] = useState(settings?.isAcceptingOrders ?? true);

  useEffect(() => {
    if (settings) {
      setProfileWhatsApp(settings.whatsappNumber);
      setProfileEmail(settings.businessEmail);
      setProfileHours(settings.operatingHours);
      setProfileAddress(settings.restaurantAddress);
      setProfileAccepting(settings.isAcceptingOrders);
    }
  }, [settings]);

  useEffect(() => {
    const handleUrlCheck = () => {
      const params = new URLSearchParams(window.location.search);
      const hasAdminQuery = params.get("admin") === "true" || params.get("panel") === "open";
      setIsAdminQueryActive(hasAdminQuery);

      if (!isAdmin && hasAdminQuery) {
        setErrorText("");
        setShowPortalModal(true);
      }
    };

    handleUrlCheck();
    window.addEventListener("popstate", handleUrlCheck);
    return () => window.removeEventListener("popstate", handleUrlCheck);
  }, [isAdmin]);

  const handleSaveSettings = () => {
    if (!profileWhatsApp.trim() || !profileEmail.trim() || !profileHours.trim() || !profileAddress.trim()) {
      alert("All fields are required to update settings.");
      return;
    }
    if (onUpdateSettings) {
      onUpdateSettings({
        whatsappNumber: profileWhatsApp.trim(),
        businessEmail: profileEmail.trim(),
        operatingHours: profileHours.trim(),
        restaurantAddress: profileAddress.trim(),
        isAcceptingOrders: profileAccepting,
      });
    }
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    const success = onLogin(passwordInput);
    if (success) {
      setPasswordInput("");
    } else {
      setErrorText("Incorrect admin passcode. Please try again.");
    }
  };

  const handleAddNewItemLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice) return;
    
    onAddNewItem({
      name: newName.trim(),
      price: Number(newPrice),
      category: newCategory,
      isVeg: newIsVeg,
      isSoldOut: false,
    });

    // Reset Form
    setNewName("");
    setNewPrice("");
    setNewCategory("Tiffins");
    setNewIsVeg(true);
    setShowAddItemForm(false);
  };

  return (
    <div className="mt-8">
      {/* Trigger Button or Active State Banner */}
      {!isAdmin ? (
        isAdminQueryActive && (
          <button
            onClick={() => {
              setErrorText("");
              setShowPortalModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-md hover:border-[#E8A65C]/40 hover:bg-slate-900/60 text-slate-300 hover:text-white transition group cursor-pointer"
          >
            <Lock className="w-4 h-4 text-slate-500 group-hover:text-[#E8A65C] transition" />
            <span className="text-sm font-semibold tracking-wide">Owner / Store Manager Administration</span>
          </button>
        )
      ) : (
        <div className="border border-[#E8A65C]/45 rounded-3xl bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8A65C]/5 rounded-full filter blur-xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#E8A65C]">Active Workspace</span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Anupama Inn Store Manager Panel
              </h2>
            </div>
            
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/35 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition self-start sm:self-center"
            >
              <LogOut className="w-4 h-4" /> Exit Store Manager Mode
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Column 1: Add New Dish */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-[#E8A65C]" /> Manage Store Recipes
                </h3>
                
                <button
                  onClick={() => setShowAddItemForm(!showAddItemForm)}
                  className="text-xs bg-[#E8A65C] text-slate-950 font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 hover:bg-[#F2C58A] transition"
                >
                  <PlusCircle className="w-4 h-4" /> {showAddItemForm ? "Close Input Form" : "Create New Dish"}
                </button>
              </div>

              {showAddItemForm ? (
                <motion.form
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleAddNewItemLocal}
                  className="bg-slate-950/40 p-5 rounded-2xl border border-white/10 space-y-4"
                >
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-200">New Dish Properties</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Dish Title/Name</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Special Ghee Podi Idli"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-[#E8A65C] outline-none"
                        maxLength={50}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="e.g. 120"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-[#E8A65C] outline-none font-mono"
                          min={0}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Menu Category</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:border-[#E8A65C] outline-none"
                        >
                          <option value="Tiffins">Tiffins</option>
                          <option value="Special Combos">Special Combos</option>
                          <option value="Soups">Soups</option>
                          <option value="Veg Starters">Veg Starters</option>
                          <option value="Non Veg Starters">Non Veg Starters</option>
                          <option value="Non Veg Biryani">Non Veg Biryani</option>
                          <option value="Veg Biryani">Veg Biryani</option>
                          <option value="Veg Fried Rice">Veg Fried Rice</option>
                          <option value="Non Veg Fried Rice">Non Veg Fried Rice</option>
                          <option value="Veg Curries">Veg Curries</option>
                          <option value="Non Veg Curries">Non Veg Curries</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newIsVeg}
                          onChange={(e) => setNewIsVeg(e.target.checked)}
                          className="rounded border-white/20 bg-slate-950 checked:bg-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        This is a Pure Vegetarian Dish
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#E8A65C] hover:bg-[#F2C58A] text-slate-950 font-bold text-sm tracking-wide inline-flex items-center justify-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" /> Register & Append Dish
                  </button>
                </motion.form>
              ) : (
                <div className="bg-slate-950/20 p-4 rounded-2xl border border-white/5 text-center text-xs text-slate-400 font-light">
                  Click any dish&apos;s inline pen icon inside the main menu list above to quickly adjust pricing, edit titles, or toggle the &quot;Sold Out&quot; state!
                </div>
              )}

              {onResetMenuToDefault && (
                <div className="bg-slate-950/40 p-4.5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-[#E8A65C]" />
                    <span className="text-xs font-semibold">Restore Printed Menu Card</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                    Overrode too many items or want to sync everything back to the printed menu card prices &amp; spelling? Click below to sync.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to restore the entire menu to the official printed cards configuration? This will overwrite existing overrides.")) {
                        onResetMenuToDefault();
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 border border-[#E8A65C]/40 text-[#E8A65C] font-semibold text-[10px] uppercase tracking-wider hover:bg-slate-900/80 hover:border-[#E8A65C] transition cursor-pointer inline-flex items-center justify-center"
                  >
                    Resync with printed menu card
                  </button>
                </div>
              )}
            </div>

            {/* Column 2: Profile Settings */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-[#E8A65C]" /> Restaurant Profile
              </h3>
              
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Business WhatsApp Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-650 text-xs focus:border-[#E8A65C] outline-none font-mono"
                      value={profileWhatsApp}
                      onChange={(e) => setProfileWhatsApp(e.target.value)}
                      placeholder="e.g. 919550454565 (including country code)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Business Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-650 text-xs focus:border-[#E8A65C] outline-none"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="e.g. hotelanupamainn@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Operating Hours</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-650 text-xs focus:border-[#E8A65C] outline-none"
                      value={profileHours}
                      onChange={(e) => setProfileHours(e.target.value)}
                      placeholder="e.g. 12:00 AM – 4:00 PM & 6:30 PM – 10:30 PM"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Restaurant Full Address</label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-650 text-xs focus:border-[#E8A65C] outline-none resize-none leading-relaxed"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Physical store address..."
                    />
                  </div>

                  <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-300">Accept Online Orders</span>
                    <button
                      type="button"
                      onClick={() => setProfileAccepting(!profileAccepting)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profileAccepting ? "bg-[#E8A65C]" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                          profileAccepting ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-slate-900 border border-[#E8A65C]/40 text-[#E8A65C] font-semibold text-xs tracking-wide inline-flex items-center justify-center gap-1.5 hover:bg-slate-900/80 hover:border-[#E8A65C] transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Business Profile
                </button>
              </div>
            </div>

            {/* Column 3: Order Logs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                  <Receipt className="w-4.5 h-4.5 text-[#E8A65C]" /> Incoming WhatsApp Orders ({orders.length})
                </h3>
                {orders.length > 0 && (
                  <button
                    onClick={onClearOrders}
                    className="text-xs text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                  >
                    <Trash className="w-3.5 h-3.5" /> Purge Records
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1.5">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 font-light border border-white/5 bg-slate-950/20 rounded-2xl">
                    No order receipts recorded yet. Real-time receipts will show up instantly when customers click &quot;Place Order on WhatsApp&quot;!
                  </div>
                ) : (
                  orders.map((or) => (
                    <div
                      key={or.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2.5 text-xs"
                    >
                      <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-amber-200">{or.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{or.timestamp}</span>
                      </div>
                      
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-slate-300">
                        <span className="text-slate-500">Name:</span> <span className="font-semibold">{or.customerName}</span>
                        <span className="text-slate-500">Phone:</span> <span className="font-mono">{or.customerPhone}</span>
                        <span className="text-slate-500">Address:</span> <span>{or.customerAddress}</span>
                      </div>

                      <div className="border-t border-white/5 pt-1.5 space-y-1 text-[11px] text-slate-400">
                        {or.items.map((it, i) => (
                          <div key={i} className="flex justify-between">
                            <span>• {it.name} <span className="text-slate-500">x{it.quantity}</span></span>
                            <span className="font-mono">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between font-bold text-white border-t border-white/5 pt-1.5 font-mono">
                        <span>Total Paid</span>
                        <span className="text-[#E8A65C]">₹{or.totalPrice}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <AnimatePresence>
        {showPortalModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPortalModal(false)}
              className="fixed inset-0 z-[2000] bg-slate-950/70 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[2001] p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white">Store Owner Area</h3>
                  <p className="text-xs text-slate-400">Please authenticate to gain store write parameters.</p>
                </div>
                <button
                  onClick={() => setShowPortalModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-wider text-[#E8A65C] font-mono">Enter Admin Credentials</label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="e.g. Passcode / Password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-650 text-sm focus:border-[#E8A65C] outline-none text-center font-mono letter-spacing-custom"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-500 font-light text-center leading-relaxed">
                    Default developer passcode of this workspace is: <code className="text-slate-300 font-semibold bg-white/5 px-1 rounded">9550</code>
                  </p>
                </div>

                {errorText && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/15 p-2 rounded-lg font-medium text-center">
                    {errorText}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#E8A65C] hover:bg-[#F2C58A] text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition"
                >
                  <CheckCircle className="w-4 h-4" /> Unlock Workspace
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
