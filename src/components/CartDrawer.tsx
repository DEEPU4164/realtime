/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem, Order, RestaurantSettings } from "../types";
import { X, ShoppingBag, Trash2, Send, PhoneCall, MapPin, User, Plus, Minus } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onAdd: (item: any) => void;
  onRemove: (item: any) => void;
  onClear: () => void;
  onPlaceOrder?: (order: Order) => void;
  settings?: RestaurantSettings;
}

const WHATSAPP_NUMBER = "919550454565"; // country code + number, no '+'

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onAdd,
  onRemove,
  onClear,
  onPlaceOrder,
  settings,
}: CartDrawerProps) {
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);

  const handleCheckout = () => {
    setErrorMessage("");
    const name = custName.trim();
    const phone = custPhone.trim().replace(/\s+/g, "");
    const address = custAddress.trim();

    if (name.length < 2) {
      setErrorMessage("Please enter your complete name (min 2 characters).");
      return;
    }
    if (!/^[0-9+\-]{10,15}$/.test(phone)) {
      setErrorMessage("Please enter a valid 10 to 12 digit phone number.");
      return;
    }
    if (address.length < 8) {
      setErrorMessage("Please enter a detailed delivery address (min 8 characters).");
      return;
    }

    const orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);
    const orderItems = cart.map((i) => ({
      name: i.menuItem.name,
      price: i.menuItem.price,
      quantity: i.quantity,
    }));

    const newOrder: Order = {
      id: orderId,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: orderItems,
      totalPrice: subtotal,
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };

    // Construct highly legible WhatsApp template string
    const lines = [
      `🔥 *HOTEL ANUPAMA INN (ORDER ${orderId})* 🔥`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Customer Info:*`,
      `  • Name: ${name}`,
      `  • Mobile: ${phone}`,
      `  • Address: ${address}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🍛 *Items Placed:*`,
    ];

    cart.forEach((i, idx) => {
      const lineCost = i.menuItem.price * i.quantity;
      lines.push(`  ${idx + 1}. ${i.menuItem.name} [x${i.quantity}] - ₹${lineCost}`);
    });

    lines.push(
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 *Total Bill: ₹${subtotal}*`,
      `⏱️ _Placed at: ${newOrder.timestamp}_`,
      `Please confirm cooking time & delivery! Thank you.`
    );

    const message = lines.join("\n");
    const uriText = encodeURIComponent(message);
    const targetWhatsApp = settings?.whatsappNumber ? settings.whatsappNumber.replace(/\+/g, "").trim() : WHATSAPP_NUMBER;
    const url = `https://api.whatsapp.com/send?phone=${targetWhatsApp}&text=${uriText}`;

    // Anchor trick for iOS click consistency within iFrames
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Call callback to record order in setting
    if (onPlaceOrder) {
      onPlaceOrder(newOrder);
    }

    // Reset fields
    setCustName("");
    setCustPhone("");
    setCustAddress("");
    onClear();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Frosted Layer Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Cart Panel Slider */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md z-[1001] bg-slate-950/95 border-l border-white/10 shadow-2xl flex flex-col pt-safe pb-safe"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E8A65C]" />
                <h2 className="text-lg font-bold text-white tracking-tight">Your Order Checkout</h2>
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={onClear}
                    className="p-2 text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 bg-white/5 rounded-full hover:bg-rose-500/10 transition border border-white/5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Containers */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-600 stroke-1" />
                  <p className="text-sm text-slate-400">Your cart is empty.</p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-xs text-[#E8A65C] transition"
                  >
                    Browse Delicious Recipes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <motion.div
                      layout
                      key={item.menuItem.id}
                      className="p-3.5 rounded-xl border border-white/5 bg-slate-900/50 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {item.menuItem.isVeg ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 inline-block" />
                          )}
                          <p className="font-semibold text-sm text-white truncate">{item.menuItem.name}</p>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          ₹{item.menuItem.price} × {item.quantity} = ₹{item.menuItem.price * item.quantity}
                        </p>
                      </div>

                      {/* Pill style quantity selector */}
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-1 py-0.5 rounded-full">
                        <button
                          onClick={() => onRemove(item.menuItem)}
                          className="p-1 rounded-full text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center font-mono">{item.quantity}</span>
                        <button
                          onClick={() => onAdd(item.menuItem)}
                          className="p-1 rounded-full text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom fields and Checkout Actions */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-white/10 bg-slate-900/40 space-y-4">
                {/* Form fields */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#E8A65C]">Delivery Address Detail</h3>
                  
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-sm focus:border-[#E8A65C] focus:ring-1 focus:ring-[#E8A65C] transition outline-none"
                    />
                  </div>

                  <div className="relative">
                    <PhoneCall className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="WhatsApp Mobile Number"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-sm focus:border-[#E8A65C] focus:ring-1 focus:ring-[#E8A65C] transition outline-none font-mono"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <textarea
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      placeholder="Complete House Address & Nearby Landmark"
                      rows={2}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-white/15 text-white placeholder-slate-500 text-sm focus:border-[#E8A65C] focus:ring-1 focus:ring-[#E8A65C] transition outline-none resize-none"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
                    ⚠️ {errorMessage}
                  </p>
                )}

                {/* Subtotals */}
                <div className="space-y-1.5 border-t border-white/5 pt-3">
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>GST (Included)</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white border-t border-white/5 pt-2 font-mono">
                    <span>Total Amount</span>
                    <span className="text-[#E8A65C]">₹{subtotal}</span>
                  </div>
                </div>

                {/* Submit button */}
                {settings?.isAcceptingOrders === false ? (
                  <div className="space-y-2 mt-4">
                    <p className="text-center text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                      🕒 Online ordering is currently paused by store management. Please contact us directly at +{settings.whatsappNumber} for fast reservations!
                    </p>
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-500 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 cursor-not-allowed opacity-50"
                    >
                      Ordering Paused Temporarily
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-950/20 shadow-xl"
                  >
                    <Send className="w-4.5 h-4.5 fill-white" /> Place Order on WhatsApp
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
