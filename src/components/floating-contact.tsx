"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "+919239536545";
  const whatsappNumber = "919239536545";

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Sub Buttons */}
      <div
        className={cn(
          "flex flex-col gap-3 transition-all duration-300 origin-bottom",
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        {/* Call Button */}
        <a
          href={`tel:${phoneNumber}`}
          className="group flex items-center gap-3"
          title="Call Us"
        >
          <span className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
            Call Us
          </span>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-blue-700 hover:scale-110 transition-all border-2 border-white">
            <Phone className="w-5 h-5" />
          </div>
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3"
          title="WhatsApp Us"
        >
          <span className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
            WhatsApp
          </span>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-green-600 hover:scale-110 transition-all border-2 border-white">
            <MessageCircle className="w-6 h-6" />
          </div>
        </a>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 border-2 border-white overflow-hidden",
          isOpen ? "bg-slate-800 rotate-90" : "bg-primary hover:scale-110"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
             <Plus className="w-7 h-7 absolute transition-transform duration-300 group-hover:rotate-90" />
             <div className="absolute inset-0 bg-white/20 animate-ping rounded-full" />
          </div>
        )}
      </button>
    </div>
  );
};
