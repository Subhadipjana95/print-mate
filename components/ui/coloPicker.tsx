import React from 'react'
import { useState, useRef, useEffect } from "react";


const PRESET_COLORS = [
    "#4ade80", "#10b981", "#3b82f6", "#2563eb", "#6366f1", "#8b5cf6", "#d946ef","#f43f5e", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#ffffff", "#000000"
];

function getContrastYIQ(hexcolor: string) {
  if (!hexcolor) return "text-white";
  const hex = hexcolor.replace("#", "");
  if (hex.length !== 6) return "text-white";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "text-black" : "text-white";
}

export function CustomColorPicker({ color, onChange }: { color: string, onChange: (c: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-white/8 bg-white/4 px-3 text-sm text-white focus-visible:border-white/20 focus-visible:ring-0 hover:bg-white/10 transition-colors"
      >
        <div 
          className="h-5 w-5 rounded-full border border-white/20 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className="font-mono text-zinc-300">{color.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-white/10 bg-[#121212] p-3 shadow-xl">
          {/* Top big preview */}
          <div 
            className="mb-4 flex h-32 w-full items-center justify-center rounded-md shadow-inner transition-colors duration-200"
            style={{ backgroundColor: color }}
          >
            <span className={`font-mono text-xl font-bold tracking-wider ${getContrastYIQ(color)}`}>
              {color.toUpperCase()}
            </span>
          </div>

          {/* Presets */}
          <div className="mb-4 flex flex-wrap gap-3">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => onChange(c)}
                className="h-6 w-6 rounded-full shadow-sm ring-1 ring-white/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            
            {/* Custom color input hidden behind a rainbow circle */}
            <div className="relative h-6 w-6">
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer pointer-events-auto"
                title="Pick a custom color"
              />
              <div 
                className="pointer-events-none h-6 w-6 rounded-full shadow-sm ring-1 ring-white/10 transition-transform hover:scale-110"
                style={{
                  background: "conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)"
                }}
              />
            </div>
          </div>

          {/* Input field */}
          <div className="flex h-10 items-center justify-between rounded-md border border-white/10 bg-white/5 px-3">
            <div className="flex items-center gap-2">
              <div 
                className="h-4 w-4 rounded-full border border-white/20"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={color.toUpperCase()}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith("#")) val = "#" + val;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                    onChange(val);
                  }
                }}
                className="w-20 bg-transparent font-mono text-sm text-zinc-300 outline-none"
                maxLength={7}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-400 border-l border-white/10 pl-3">100%</span>
          </div>
        </div>
      )}
    </div>
  );
}