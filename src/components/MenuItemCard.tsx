/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MenuItem } from "../types";
import { Plus, Minus, Edit3, Check, X, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface MenuItemCardProps {
  key?: string;
  item: MenuItem;
  quantityInCart: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  isAdmin: boolean;
  onUpdateItem?: (updatedItem: MenuItem) => void;
}

export function MenuItemCard({
  item,
  quantityInCart,
  onAdd,
  onRemove,
  isAdmin,
  onUpdateItem,
}: MenuItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.price);
  const [editIsVeg, setEditIsVeg] = useState(item.isVeg);
  const [editIsSoldOut, setEditIsSoldOut] = useState(item.isSoldOut || false);
  const [editCategory, setEditCategory] = useState(item.category);

  const handleSave = () => {
    if (!editName.trim()) return;
    if (isNaN(editPrice) || editPrice < 0) return;
    
    if (onUpdateItem) {
      onUpdateItem({
        ...item,
        name: editName.trim(),
        price: Number(editPrice),
        isVeg: editIsVeg,
        isSoldOut: editIsSoldOut,
        category: editCategory,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(item.name);
    setEditPrice(item.price);
    setEditIsVeg(item.isVeg);
    setEditIsSoldOut(item.isSoldOut || false);
    setEditCategory(item.category);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      transition={{ duration: 0.25 }}
      style={{ contentVisibility: "auto", containIntrinsicSize: "130px" }}
      className={`relative p-5 rounded-2xl border transition-all ${
        item.isSoldOut && !isEditing
          ? "border-white/5 bg-slate-900/20 opacity-60"
          : "border-white/10 bg-slate-900/40 hover:border-[#E8A65C]/40 hover:bg-slate-900/60 shadow-lg hover:shadow-xl"
      } backdrop-blur-md flex flex-col justify-between`}
    >
      {/* Item details */}
      <div className="flex flex-col justify-between min-w-0 h-full">
        {isEditing ? (
          /* Admin Mini Glass Editor card format */
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 p-1 rounded-lg text-[10px] text-amber-200 uppercase tracking-widest font-mono">
              <ShieldAlert className="w-3.5 h-3.5" /> Owner Mode
            </div>
            
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded bg-slate-950 border border-white/20 text-white font-medium"
              placeholder="Dish Name"
              maxLength={60}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] uppercase tracking-wider text-slate-400 mb-0.5">Price (₹)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs rounded bg-slate-950 border border-white/20 text-white font-mono"
                  min={0}
                />
              </div>
              
              <div>
                <label className="block text-[8px] uppercase tracking-wider text-slate-400 mb-0.5">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-1 py-1 text-xs rounded bg-slate-950 border border-white/20 text-white"
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

            <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2">
              <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editIsVeg}
                  onChange={(e) => setEditIsVeg(e.target.checked)}
                  className="rounded border-white/20 bg-slate-950 checked:bg-emerald-500 w-3.5 h-3.5"
                />
                Veg Recipe
              </label>

              <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editIsSoldOut}
                  onChange={(e) => setEditIsSoldOut(e.target.checked)}
                  className="rounded border-white/20 bg-slate-950 checked:bg-rose-500 w-3.5 h-3.5"
                />
                Sold Out
              </label>
            </div>

            <div className="flex gap-1.5 justify-end border-t border-white/5 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 inline-flex items-center gap-1 border border-white/5"
              >
                <X className="w-3" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1 rounded bg-[#E8A65C] hover:bg-[#F2C58A] text-slate-950 font-semibold text-xs inline-flex items-center gap-1"
              >
                <Check className="w-3" /> Save
              </button>
            </div>
          </div>
        ) : (
          /* Normal customer view card format */
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Veg/Non-Veg Badge inline */}
                {item.isVeg ? (
                  <span className="inline-flex w-4.5 h-4.5 border border-emerald-500/40 bg-emerald-500/10 items-center justify-center rounded" title="Pure Veg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                ) : (
                  <span className="inline-flex w-4.5 h-4.5 border border-rose-500/40 bg-rose-500/10 items-center justify-center rounded" title="Non-Veg">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  </span>
                )}
                
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  {item.category}
                </span>

                {item.isSoldOut && (
                  <span className="ml-auto text-[9px] font-bold tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase font-sans">
                    Sold Out
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm sm:text-base text-slate-100 leading-tight tracking-tight break-words">
                {item.name}
              </h3>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/5">
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                ₹{item.price}
              </span>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition border border-white/5"
                    title="Edit Price/Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}

                {item.isSoldOut ? (
                  <span className="text-xs text-rose-400/80 italic font-light px-1">Sold out</span>
                ) : quantityInCart > 0 ? (
                  /* Animated plus/minus pill */
                  <div className="flex items-center bg-[#E8A65C]/11 border border-[#E8A65C]/30 text-amber-200 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                    <button
                      onClick={() => onRemove(item)}
                      className="p-1 rounded-full hover:bg-[#E8A65C]/20 text-[#E8A65C]"
                      title="Reduce"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="min-w-[18px] text-center px-1 font-mono">{quantityInCart}</span>
                    <button
                      onClick={() => onAdd(item)}
                      className="p-1 rounded-full hover:bg-[#E8A65C]/20 text-[#E8A65C]"
                      title="Add one more"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onAdd(item)}
                    className="px-4 py-1 text-xs font-bold tracking-wider text-slate-950 bg-[#E8A65C] rounded-full hover:bg-[#F2C58A] shadow-md hover:shadow-orange-500/10 hover:shadow-lg transition active:scale-95 select-none"
                  >
                    ADD
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
