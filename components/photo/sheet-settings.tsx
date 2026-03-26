"use client";

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
import { CustomColorPicker } from "@/components/ui/coloPicker";
import { Crop } from "lucide-react";

interface SheetSettingsProps {
  qty: number;
  sizePreset: SizePresetKey;
  sheetPreset: SheetPresetKey;
  showGuides: boolean;
  bgColor: string;
  onQtyChange: (qty: number) => void;
  onSizePresetChange: (key: SizePresetKey) => void;
  onSheetPresetChange: (key: SheetPresetKey) => void;
  onShowGuidesToggle: () => void;
  onBgColorChange: (color: string) => void;
  onCropClick?: () => void;
  canCrop?: boolean;
}

export function SheetSettings({
  qty,
  sizePreset,
  sheetPreset,
  showGuides,
  bgColor,
  onQtyChange,
  onSizePresetChange,
  onSheetPresetChange,
  onShowGuidesToggle,
  onBgColorChange,
  onCropClick,
  canCrop,
}: SheetSettingsProps) {
  return (
    <section className="rounded-lg border border-white/6 bg-white/2 p-6 space-y-5">
      <h2 className="text-lg font-medium text-zinc-300 tracking-tight">
        Sheet Settings
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
        {/* ── Quantity ── */}
        <ControlField label="Quantity">
          <Input
            id="qty"
            type="number"
            min={0}
            max={MAX_QTY}
            value={qty === 0 ? "" : qty}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                onQtyChange(0);
              } else {
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed)) {
                  onQtyChange(Math.min(parsed, MAX_QTY));
                }
              }
            }}
            onBlur={() => {
              if (qty < MIN_QTY) {
                onQtyChange(MIN_QTY);
              }
            }}
            className="h-10 w-full rounded-lg border border-white/8 bg-white/4 px-3 text-sm text-white focus-visible:border-white/20 focus-visible:ring-0"
          />
        </ControlField>

        {/* ── Passport size ── */}
        <ControlField label="Passport Size" className="col-span-1 md:col-span-2">
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
        <ControlField label="Sheet Size" className="col-span-1 md:col-span-2">
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


        {/* ── Background Color ── */}
        <ControlField label="Background Color" className="col-span-1 md:col-span-2">
          <CustomColorPicker color={bgColor} onChange={onBgColorChange} />
        </ControlField>


        {/* ── Cut guides ── */}
        <ControlField label="Cut Guides" className="col-span-1">
          <button
            id="showGuides"
            role="switch"
            aria-checked={showGuides}
            onClick={onShowGuidesToggle}
            className={`h-10 w-full rounded-lg border transition-colors duration-200 flex items-center gap-2 px-2 text-sm ${
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

        {/* ── Mobile Crop Button ── */}
        {canCrop && (
          <ControlField label="Crop Photo" className="col-span-1 md:hidden">
            <button
              onClick={onCropClick}
              className="h-10 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-500 font-medium transition-colors duration-200 flex items-center justify-center gap-2 text-sm hover:bg-amber-500/20"
            >
              <Crop className="w-4 h-4" />
              <span>Crop</span>
            </button>
          </ControlField>
        )}
      </div>
    </section>
  );
}

// ── Local helper ──────────────────────────────────────────────────────────────

function ControlField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className || ""}`}>
      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
