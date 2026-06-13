/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { MenuItem, CartItem, Order, CATEGORIES, RestaurantSettings } from "./types";
import { initialMenuItems } from "./initialMenu";
import { GlassHero } from "./components/GlassHero";
import { MenuItemCard } from "./components/MenuItemCard";
import { CartDrawer } from "./components/CartDrawer";
import { AdminPortal } from "./components/AdminPortal";
import {
  Search,
  ShoppingBag,
  Leaf,
  Sparkles,
  MapPin,
  Phone,
  MessageSquare,
  Utensils,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, onSnapshot, setDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";

export default function App() {
  // --- States ---
  const [splashVisible, setSplashVisible] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [vegFilterOnly, setVegFilterOnly] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [settings, setSettings] = useState<RestaurantSettings>({
    whatsappNumber: "919550454565",
    businessEmail: "hotelanupamainn@gmail.com",
    operatingHours: "12:00 AM – 4:00 PM & 6:30 PM – 10:30 PM",
    restaurantAddress: "Hotel Anupama Inn, Opp. 3 Town Police Station, Waltair Main Rd, Chinna Waltair, Visakhapatnam, Andhra Pradesh 530003",
    isAcceptingOrders: true,
  });

  // --- Initial Data Load ---
  useEffect(() => {
    // 1. Splash Screen Timeout
    const splashTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 1800);

    // 2. Offline / Local fallback load for instant UI paint
    const savedMenu = localStorage.getItem("anupama_menu_v3");
    if (savedMenu) {
      try {
        setMenuItems(JSON.parse(savedMenu));
      } catch (e) {
        setMenuItems(initialMenuItems);
      }
    } else {
      setMenuItems(initialMenuItems);
    }

    const savedCart = localStorage.getItem("anupama_cart_v3");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }

    const savedOrders = localStorage.getItem("anupama_orders_v3");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        setOrders([]);
      }
    }

    // 2.5 Auto-migrate menu to pristine configurations matching printed menu card
    const lastMigration = localStorage.getItem("anupama_menu_migration_v4_1");
    if (!lastMigration) {
      const runAutoMigration = async () => {
        try {
          console.log("Triggering auto-migration of database with pristine menu entries...");
          const querySnapshot = await getDocs(collection(db, "menu"));
          for (const docSnap of querySnapshot.docs) {
            await deleteDoc(docSnap.ref);
          }
          for (const item of initialMenuItems) {
            await setDoc(doc(db, "menu", item.id), item);
          }
          localStorage.setItem("anupama_menu_migration_v4_1", "done");
          console.log("Auto-migration complete");
        } catch (e) {
          console.error("Auto-migration of menu database failed:", e);
        }
      };
      runAutoMigration();
    }

    // 3. Setup real-time menu collection sync
    const unsubscribeMenu = onSnapshot(
      collection(db, "menu"),
      async (snapshot) => {
        if (snapshot.empty) {
          // Live seeding if empty
          console.log("Seeding remote menu database with default delicious layout...");
          try {
            for (const item of initialMenuItems) {
              await setDoc(doc(db, "menu", item.id), item);
            }
          } catch (err) {
            console.error("Auto seeding menu failed: ", err);
          }
        } else {
          const items: MenuItem[] = [];
          snapshot.forEach((docSnap) => {
            items.push(docSnap.data() as MenuItem);
          });
          setMenuItems(items);
          localStorage.setItem("anupama_menu_v3", JSON.stringify(items));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "menu");
      }
    );

    // 3.5 Setup real-time settings document sync
    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "restaurant"),
      async (docSnap) => {
        if (!docSnap.exists()) {
          const defaultSettings = {
            whatsappNumber: "919550454565",
            businessEmail: "hotelanupamainn@gmail.com",
            operatingHours: "12:00 AM – 4:00 PM & 6:30 PM – 10:30 PM",
            restaurantAddress: "Hotel Anupama Inn, Opp. 3 Town Police Station, Waltair Main Rd, Chinna Waltair, Visakhapatnam, Andhra Pradesh 530003",
            isAcceptingOrders: true,
          };
          try {
            await setDoc(doc(db, "settings", "restaurant"), defaultSettings);
            setSettings(defaultSettings);
          } catch (err) {
            console.error("Auto seeding dynamic settings failed: ", err);
          }
        } else {
          setSettings(docSnap.data() as RestaurantSettings);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "settings/restaurant");
      }
    );

    return () => {
      clearTimeout(splashTimer);
      unsubscribeMenu();
      unsubscribeSettings();
    };
  }, []);

  // 4. Setup real-time orders collection sync - only for store managers!
  useEffect(() => {
    if (!isAdminMode) {
      setOrders([]);
      return;
    }

    const unsubscribeOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const liveOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          liveOrders.push(docSnap.data() as Order);
        });
        // Sort newest first
        liveOrders.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(liveOrders);
        localStorage.setItem("anupama_orders_v3", JSON.stringify(liveOrders));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "orders");
      }
    );

    return () => {
      unsubscribeOrders();
    };
  }, [isAdminMode]);

  // --- State Persistence Helpers ---
  const saveMenuInDrive = (newMenu: MenuItem[]) => {
    setMenuItems(newMenu);
    localStorage.setItem("anupama_menu_v3", JSON.stringify(newMenu));
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    const id = setTimeout(() => setToastMessage(""), 2000);
    return () => clearTimeout(id);
  };

  // --- Cart Actions ---
  const handleAddToCart = (item: MenuItem) => {
    if (item.isSoldOut) {
      showToast(`${item.name} is currently sold out!`);
      return;
    }
    const updatedCart = [...cart];
    const existing = updatedCart.find((c) => c.menuItem.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      updatedCart.push({ menuItem: item, quantity: 1 });
    }
    setCart(updatedCart);
    localStorage.setItem("anupama_cart_v3", JSON.stringify(updatedCart));
    showToast(`Added ${item.name} to order.`);
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    let updatedCart = [...cart];
    const existing = updatedCart.find((c) => c.menuItem.id === item.id);
    if (existing) {
      existing.quantity -= 1;
      if (existing.quantity <= 0) {
        updatedCart = updatedCart.filter((c) => c.menuItem.id !== item.id);
      }
      setCart(updatedCart);
      localStorage.setItem("anupama_cart_v3", JSON.stringify(updatedCart));
      showToast(`Removed one ${item.name}.`);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem("anupama_cart_v3");
    showToast("Cart basket cleared.");
  };

  const handlePlaceOrderLocal = async (newOrder: Order) => {
    try {
      await setDoc(doc(db, "orders", newOrder.id), newOrder);
      showToast("Opening WhatsApp template...");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${newOrder.id}`);
    }
  };

  const handleUpdateSettings = async (newSettings: RestaurantSettings) => {
    try {
      await setDoc(doc(db, "settings", "restaurant"), newSettings);
      showToast("Restaurant profile settings updated!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, "settings/restaurant");
    }
  };

  // --- Admin/Owner Actions ---
  const handleAdminLogin = (password: string): boolean => {
    if (password === "9963992999") {
      setIsAdminMode(true);
      showToast("Store Manager Mode Activated!");
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminMode(false);
    showToast("Exited Admin Workspace.");
    if (window.history.pushState) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  };

  const handleClearOrders = async () => {
    try {
      const orderIds = orders.map((o) => o.id);
      for (const id of orderIds) {
        await deleteDoc(doc(db, "orders", id));
      }
      setOrders([]);
      localStorage.setItem("anupama_orders_v3", JSON.stringify([]));
      showToast("Orders logs successfully purged.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "orders");
    }
  };

  const handleAddNewItem = async (newItemData: Omit<MenuItem, "id">) => {
    const itemWithId: MenuItem = {
      ...newItemData,
      id: "custom-" + Date.now().toString(),
    };
    try {
      await setDoc(doc(db, "menu", itemWithId.id), itemWithId);
      showToast(`Successfully registered ${itemWithId.name}!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `menu/${itemWithId.id}`);
    }
  };

  const handleResetMenuToDefault = async () => {
    try {
      showToast("Resetting menu book to default...");
      const querySnapshot = await getDocs(collection(db, "menu"));
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(docSnap.ref);
      }
      for (const item of initialMenuItems) {
        await setDoc(doc(db, "menu", item.id), item);
      }
      showToast("Entire menu restored to printed card defaults!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "menu/reset");
    }
  };

  const handleUpdateMenuItem = async (updatedItem: MenuItem) => {
    try {
      await setDoc(doc(db, "menu", updatedItem.id), updatedItem);
      showToast(`Updated pricing & details for ${updatedItem.name}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `menu/${updatedItem.id}`);
    }
  };

  // --- Filter Analytics ---
  const filteredItems = menuItems.filter((m) => {
    const matchesCategory = activeCategory === "All" || m.category === activeCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVeg = !vegFilterOnly || m.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  const cartTotalAmount = cart.reduce((tot, i) => tot + i.menuItem.price * i.quantity, 0);
  const cartTotalCount = cart.reduce((tot, i) => tot + i.quantity, 0);

  return (
    <>
      {/* 1. PROFESSIONAL LANDMARK INTRO SPLASH */}
      <AnimatePresence>
        {splashVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: -20,
              transition: { duration: 0.8, ease: "easeInOut" },
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black select-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(232,166,92,0.06),transparent_60%)]" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, cubicBezier: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-4 px-6"
            >
              <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E8A65C] to-[#C98643] text-black font-black text-2xl items-center justify-center shadow-lg shadow-amber-950/20">
                AI
              </div>
              <h1 className="text-4xl font-extrabold tracking-wider text-white">Anupama Inn</h1>
              <p className="text-xs uppercase tracking-[0.25em] text-[#E8A65C] font-semibold">
                Authentic Tiffins & Biryanis · Visakhapatnam
              </p>
              <div className="w-12 h-1 rounded-full bg-[#E8A65C]/30 mx-auto mt-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="min-h-screen text-slate-100 font-sans selection:bg-[#E8A65C] selection:text-black">
        {/* Toast Notification HUD */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-6 left-1/2 z-[999] px-6 py-3 rounded-full bg-slate-900 border border-white/10 text-white font-semibold text-xs tracking-wide shadow-2xl flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#E8A65C] animate-pulse" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating WhatsApp Quick Link */}
        <a
          href={`https://api.whatsapp.com/send?phone=${settings.whatsappNumber}&text=${encodeURIComponent(
            "Hi Hotel Anupama Inn, I'd like to check the menu today or ask some questions!"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-5 z-[400] w-14 h-14 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition"
          title="Direct Chat on WhatsApp"
        >
          <MessageSquare className="w-6 h-6 text-white shrink-0" />
        </a>

        {/* Global Nav Bar Header */}
        <nav className="sticky top-0 z-[190] bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E8A65C] to-[#C98643] text-black font-extrabold text-sm flex items-center justify-center shadow">
                AI
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest font-mono text-slate-500 font-bold block leading-none">
                  Visakhapatnam
                </span>
                <span className="text-base font-extrabold text-white tracking-tight">Anupama Inn</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition group border border-white/5"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#E8A65C] text-slate-950 font-black text-[10px] flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28">
          {/* Stunning Glass Hero sliding presentation banner */}
          <GlassHero settings={settings} />

          {/* Special combo offer visual alert */}
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[#E8A65C]/20 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8A65C]/15 flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5 text-[#E8A65C]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Daily Tiffins Combo Discount</h4>
                <p className="text-xs text-slate-400 font-light">Get special discounted combos on idlies, bondas, and pooris!</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#E8A65C] text-slate-950 px-2.5 py-1 rounded-lg">
              SAVES 15%
            </span>
          </div>

          {/* Search HUD & Vegetarian Toggle Bar */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
            {/* Search Input Custom Frame */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search recipe catalog: try tiffins, chicken starters, meals, dosa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-[#E8A65C] focus:bg-slate-900/70 focus:outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Veg Switch */}
            <button
              onClick={() => {
                setVegFilterOnly(!vegFilterOnly);
                showToast(vegFilterOnly ? "Showing entire menu." : "Filtered pure vegetarian recipes.");
              }}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer ${
                vegFilterOnly
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-900/40 border-white/10 text-slate-300 hover:border-white/20"
              }`}
            >
              <Leaf className={`w-4 h-4 ${vegFilterOnly ? "text-emerald-400" : "text-slate-500"}`} />
              Pure Veg Only
            </button>
          </div>

          {/* Sticky Horizontal Categories Navigation Scroller */}
          <div className="sticky top-[73px] z-[100] -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 bg-[#05080c]/90 backdrop-blur-md border-b border-white/5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-4 rounded-full text-xs font-bold tracking-wide transition shrink-0 uppercase cursor-pointer border ${
                  activeCategory === cat
                    ? "bg-[#E8A65C] text-slate-950 border-[#E8A65C] shadow-lg shadow-orange-500/10"
                    : "bg-slate-900/40 text-slate-400 border-white/5 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Sections Grid & Cards Output */}
          <div className="mt-8 space-y-10 min-h-[300px]">
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-900/20 rounded-3xl border border-white/5">
                <p className="text-slate-400 text-sm font-light">No matching recipes found.</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("All");
                    setVegFilterOnly(false);
                    showToast("Filters restored to default.");
                  }}
                  className="mx-auto rounded-full px-4 py-1.5 bg-white/5 text-[#E8A65C] border border-white/10 hover:border-white/25 text-xs transition"
                >
                  Clear Fields
                </button>
              </div>
            ) : (
              /* Grouped by selected category */
              (() => {
                const grouped: { [key: string]: MenuItem[] } = {};
                filteredItems.forEach((it) => {
                  grouped[it.category] = grouped[it.category] || [];
                  grouped[it.category].push(it);
                });

                return Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#E8A65C]" /> {category}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">({items.length} items available)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {items.map((item) => {
                        const inCart = cart.find((c) => c.menuItem.id === item.id);
                        return (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            quantityInCart={inCart ? inCart.quantity : 0}
                            onAdd={handleAddToCart}
                            onRemove={handleRemoveFromCart}
                            isAdmin={isAdminMode}
                            onUpdateItem={handleUpdateMenuItem}
                          />
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>

          <div className="w-full h-px bg-white/5 mt-16 mb-8" />

          {/* Interactive Owner Panel Area */}
          <AdminPortal
            isAdmin={isAdminMode}
            onLogin={handleAdminLogin}
            onLogout={handleAdminLogout}
            orders={orders}
            onClearOrders={handleClearOrders}
            onAddNewItem={handleAddNewItem}
            onResetMenuToDefault={handleResetMenuToDefault}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />

          {/* Google Map Embed */}
          <section className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-white/5 h-[230px] sm:h-[300px] w-full relative">
              <iframe
                src="https://www.google.com/maps?q=Hotel+Anupama+Inn,+Waltair+Main+Rd,+Chinna+Waltair,+Visakhapatnam,+Andhra+Pradesh+530003&z=17&output=embed"
                className="w-full h-full border-0 brightness-95 contrast-95"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Anupama Inn GPS Coordinates"
              />
            </div>
          </section>

          {/* Premium Branded Footer Card matching the provided visual reference perfectly */}
          <footer className="mt-12 rounded-3xl border border-white/5 bg-[#05080c] p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-slate-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              
              {/* Box 1: About Anupama Inn */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-white tracking-widest uppercase">ABOUT ANUPAMA INN</h4>
                  <div className="w-8 h-[3px] bg-[#E2445C] mt-1.5 rounded-full" />
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  We serve authentic South Indian tiffins, slow-cooked dum biryani, fiery Chinese starters and refreshing shakes — cooked fresh every day by our family of chefs with recipes passed down for three generations.
                </p>
                
                {/* Visual Circle Badges f, target, G */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="w-9 h-9 rounded-full bg-[#E2445C] flex items-center justify-center text-white text-[13px] font-extrabold select-none cursor-default font-serif">
                    f
                  </span>
                  
                  <span className="w-9 h-9 rounded-full bg-[#E2445C] flex items-center justify-center text-white select-none cursor-default">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    </span>
                  </span>
                  
                  <span className="w-9 h-9 rounded-full bg-[#E2445C] flex items-center justify-center text-white text-[13px] font-extrabold select-none cursor-default font-sans">
                    G
                  </span>
                </div>
              </div>

              {/* Box 2: CONTACT US! & EMAIL */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-widest uppercase">CONTACT US!</h4>
                    <div className="w-8 h-[3px] bg-[#E2445C] mt-1.5 rounded-full" />
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 font-light font-mono">
                    <p>WhatsApp Hotline: <span className="font-medium text-slate-200">+{settings.whatsappNumber}</span></p>
                    <p>Enquiries / Booking: <span className="font-medium text-slate-200">+{settings.whatsappNumber}</span></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-widest uppercase">EMAIL</h4>
                    <div className="w-8 h-[3px] bg-[#E2445C] mt-1.5 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-400 font-light hover:text-[#E2445C] transition">
                    <a href={`mailto:${settings.businessEmail}`}>
                      {settings.businessEmail}
                    </a>
                  </p>
                </div>
              </div>

              {/* Box 3: ADDRESS & OPENING HOURS */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-widest uppercase">ADDRESS</h4>
                    <div className="w-8 h-[3px] bg-[#E2445C] mt-1.5 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {settings.restaurantAddress}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white tracking-widest uppercase">OPENING HOURS</h4>
                    <div className="w-8 h-[3px] bg-[#E2445C] mt-1.5 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {settings.operatingHours}
                  </p>
                </div>
              </div>

            </div>

            <div className="w-full h-px bg-white/5 mt-8 mb-4" />
            <div className="text-center text-[10px] text-slate-500 font-light">
              &copy; {new Date().getFullYear()} Hotel Anupama Inn. Visakhapatnam, AP, India. All Rights Reserved.
            </div>
          </footer>
        </main>

        {/* 3. STICKY DOCK FLOATING CART FOR CUSTOMER OVERVIEW */}
        <AnimatePresence>
          {cartTotalCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 50, x: "-50%" }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg z-[450] p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-[#E8A65C]/45 shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8A65C] flex items-center justify-center text-slate-950 relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950 text-[#E8A65C] font-extrabold text-[8px] flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Basket Overview</h4>
                  <p className="text-[10px] text-[#E8A65C] tracking-wide font-semibold mt-0.5 font-mono">
                    {cartTotalCount} delicious recipe{cartTotalCount !== 1 ? "s" : ""} inside
                  </p>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-xs text-slate-400 font-light block font-mono">Billing Subtotal</span>
                <span className="text-base font-extrabold text-[#E8A65C] font-mono">₹{cartTotalAmount}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Drawer Component */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onAdd={handleAddToCart}
          onRemove={handleRemoveFromCart}
          onClear={handleClearCart}
          onPlaceOrder={handlePlaceOrderLocal}
          settings={settings}
        />
      </div>
    </>
  );
}
