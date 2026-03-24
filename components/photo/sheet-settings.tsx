"use client";

import React from "react";
import {
  SIZE_PRESETS,
  SHEET_PRESETS,
  MIN_QTY,
  MAX_QTY,
  clamp,
  type SizePresetKey,
  type SheetPresetKey,
} from "@/lib/photo-utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface SheetSettingsProps {
  qty: number;
  sizePreset: SizePresetKey;
  sheetPreset: SheetPresetKey;
  showGuides: boolean;
  onQtyChange: (qty: number) => void;
  onSizePresetChange: (key: SizePresetKey) => void;
  onSheetPresetChange: (key: SheetPresetKey) => void;
  onShowGuidesToggle: () => void;
}

export function SheetSettings({
  qty,
  sizePreset,
  sheetPreset,
  showGuides,
  onQtyChange,
  onSizePresetChange,
  onSheetPresetChange,
  onShowGuidesToggle,
}: SheetSettingsProps) {
  return (
    <section className="rounded-lg border border-white/6 bg-white/2 p-6 space-y-5">
      <h2 className="text-lg font-medium text-zinc-300 tracking-tight">
        Sheet Settings
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* ── Quantity ── */}
        <ControlField label="Quantity">
          <Input
            id="qty"
            type="number"
            min={MIN_QTY}
            max={MAX_QTY}
            value={qty}
            onChange={(e) =>
              onQtyChange(
                clamp(parseInt(e.target.value, 10) || 3, MIN_QTY, MAX_QTY)
              )
            }
            className="h-10 w-full rounded-lg border border-white/8 bg-white/4 px-3 text-sm text-white focus-visible:border-white/20 focus-visible:ring-0"
          />
        </ControlField>

        {/* ── Passport size ── */}
        <ControlField label="Passport Size">
          <Select
            value={sizePreset}
            onValueChange={(v) => onSizePresetChange(v as SizePresetKey)}
          >
            <SelectTrigger
              id="sizePreset"
              className="h-10! w-full rounded-lg border border-white/8 bg-white/4 px-3 text-sm text-white focus-visible:border-white/20 focus-visible:ring-0 [&_svg]:text-zinc-500"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SIZE_PRESETS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ControlField>

        {/* ── Sheet size ── */}
        <ControlField label="Sheet Size">
          <Select
            value={sheetPreset}
            onValueChange={(v) => onSheetPresetChange(v as SheetPresetKey)}
          >
            <SelectTrigger
              id="sheetPreset"
              className="h-10! w-full rounded-lg border border-white/8 bg-white/4 px-3 text-sm text-white focus-visible:border-white/20 focus-visible:ring-0 [&_svg]:text-zinc-500"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SHEET_PRESETS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ControlField>

        {/* ── Cut guides ── */}
        <ControlField label="Cut Guides">
          <button
            id="showGuides"
            role="switch"
            aria-checked={showGuides}
            onClick={onShowGuidesToggle}
            className={`h-10 w-full rounded-lg border transition-colors duration-200 flex items-center gap-3 px-3 text-sm ${
              showGuides
                ? "border-white/20 bg-white/10 text-white font-medium"
                : "border-white/8 bg-white/4 text-zinc-500 hover:border-white/14 hover:text-zinc-400"
            }`}
          >
            <Checkbox
              checked={showGuides}
              onCheckedChange={onShowGuidesToggle}
              id="showGuidesCheckbox"
              className="pointer-events-none"
            />
            <span>{showGuides ? "Enabled" : "Disabled"}</span>
          </button>
        </ControlField>
      </div>
    </section>
  );
}

// ── Local helper ──────────────────────────────────────────────────────────────

function ControlField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
