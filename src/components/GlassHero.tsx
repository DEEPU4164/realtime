/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, MapPin, Sparkles, Phone, Award } from "lucide-react";
import { RestaurantSettings } from "../types";

const FOOD_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1200&auto=format&fit=crop",
    caption: "Dum Biryani",
  },
  {
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1200&auto=format&fit=crop",
    caption: "Crispy Golden Ghee Masala Dosa",
  },
  {
   
];

interface GlassHeroProps {
  settings?: RestaurantSettings;
}

export function GlassHero({ settings }: GlassHeroProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [statusText, setStatusText] = useState("Checking hours...");

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % FOOD_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function updateOpenStatus() {
      // Indian Standard Time (IST) setup
      const now = new Date();
      const options = {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "numeric" as const,
        minute: "numeric" as const,
      };
      
      try {
        const formatter = new Intl.DateTimeFormat("en-US", options);
        const parts = formatter.formatToParts(now);
        const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "12", 10);
        const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
        const timeVal = hour + minute / 60;

        // Sessions: 12:00 AM - 4:00 PM (0 to 16.0) and 6:30 PM - 10:30 PM (18.5 to 22.5)
        const inSession1 = timeVal >= 0 && timeVal < 16;
        const inSession2 = timeVal >= 18.5 && timeVal < 22.5;

        if (inSession1 || inSession2) {
          setIsOpen(true);
          setStatusText(`Open Now`);
        } else {
          setIsOpen(false);
          setStatusText(`Closed`);
        }
      } catch (err) {
        // Fallback to local system time
        const hour = now.getHours();
        const minute = now.getMinutes();
        const timeVal = hour + minute / 60;
        const inSession1 = timeVal >= 0 && timeVal < 16;
        const inSession2 = timeVal >= 18.5 && timeVal < 22.5;

        if (inSession1 || inSession2) {
          setIsOpen(true);
          setStatusText(`Open Now`);
        } else {
          setIsOpen(false);
          setStatusText(`Closed`);
        }
      }
    }

    updateOpenStatus();
    const statusTimer = setInterval(updateOpenStatus, 30000);
    return () => clearInterval(statusTimer);
  }, []);

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
      {/* Dynamic Background Slideshow */}
      <div className="absolute inset-0 z-0 h-[260px] sm:h-[340px] md:h-[380px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={slideIndex}
            src={FOOD_SLIDES[slideIndex].image}
            alt={FOOD_SLIDES[slideIndex].caption}
            referrerPolicy="no-referrer"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.35, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 p-6 sm:p-8 pt-[140px] sm:pt-[180px] md:pt-[200px] flex flex-col justify-end">
        {/* Dynamic Caption */}
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-[#E8A65C] mb-2 inline-flex items-center gap-1.5 bg-slate-950/50 px-3 py-1 rounded-full border border-white/5 w-fit">
          <Sparkles className="w-3.5 h-3.5" /> {FOOD_SLIDES[slideIndex].caption}
        </span>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Hotel Anupama Inn
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Experience Vizag’s finest signature starters, hearty family meals, and an unforgettable dining atmosphere.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                isOpen
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              {statusText}
            </div>
            
            <span className="text-xs bg-[#E8A65C]/10 text-amber-200 border border-[#E8A65C]/35 px-3 py-1.5 rounded-full font-medium inline-flex items-center gap-1 font-mono">
              <Award className="w-3.5 h-3.5 text-[#E8A65C]" /> GSTIN: 37ALKPD2997C1Z0
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2.5 text-slate-300 bg-white/5 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
            <Clock className="w-4 h-4 text-[#E8A65C] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Timings</p>
              <p className="text-[10px] text-slate-400 font-light truncate">{settings?.operatingHours || "12:00 AM – 4:00 PM & 6:30 PM – 10:30 PM"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300 bg-white/5 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
            <MapPin className="w-4 h-4 text-[#E8A65C] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Location</p>
              <p className="text-[10px] text-slate-400 font-light truncate">{settings?.restaurantAddress || "Waltair Main Rd"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300 bg-white/5 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
            <Phone className="w-4 h-4 text-[#E8A65C] shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">WhatsApp Support</p>
              <p className="text-[10px] text-slate-400 font-light font-mono truncate">+{settings?.whatsappNumber || "919550454565"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
