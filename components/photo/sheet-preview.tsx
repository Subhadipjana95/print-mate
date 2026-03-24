import React from "react";
import { CheckCircle, Download, Copy, Printer } from "lucide-react";

interface SheetPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  sheetTitle: string;
  isGenerated: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onPrint: () => void;
}

export function SheetPreview({
  canvasRef,
  sheetTitle,
  isGenerated,
  onDownload,
  onCopy,
  onPrint,
}: SheetPreviewProps) {
  return (
    <section className="md:space-y-4">
      {/* ── Title + ready badge ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-2 mb-4 md:mb-0">
        <div className="flex gap-2 items-center">
          <h2 className="text-lg font-medium text-zinc-300 tracking-tight">
            {sheetTitle}
          </h2>
        </div>

        {isGenerated && (
          <span className="inline-flex text-xs text-amber-500 font-medium items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full border-[0.5px] border-amber-500/50 shrink-0">
            <CheckCircle className="w-3 h-3" /> Ready
          </span>
        )}
        </div>
          
        {/* ── Action buttons ── */}
        <div className="hidden md:flex flex-wrap gap-3 ">
          <ActionButton
            id="download"
            icon={<Download className="w-4 h-4" />}
            label="Download PNG"
            disabled={!isGenerated}
            onClick={onDownload}
          />
          <ActionButton
            id="copy"
            icon={<Copy className="w-4 h-4" />}
            label="Copy"
            disabled={!isGenerated}
            onClick={onCopy}
          />
          <ActionButton
            id="print"
            icon={<Printer className="w-4 h-4" />}
            label="Print"
            disabled={!isGenerated}
            onClick={onPrint}
          />
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="md:mb-0 rounded-xl border border-white/6 bg-white/2 p-3 overflow-auto">
        <canvas
          ref={canvasRef}
          id="sheet"
          className="w-full max-w-3xl mx-auto block rounded-lg"
          style={{ height: "auto" }}
        />
      </div>

      {/* ── Mobile action bar (bottom) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 p-4 z-30">
        <div className="flex gap-3">
          <ActionButton
            id="download-mobile"
            icon={<Download className="w-5 h-5" />}
            label="Download"
            disabled={!isGenerated}
            onClick={onDownload}
          />
          <ActionButton
            id="copy-mobile"
            icon={<Copy className="w-5 h-5" />}
            label="Copy"
            disabled={!isGenerated}
            onClick={onCopy}
          />
          <ActionButton
            id="print-mobile"
            icon={<Printer className="w-5 h-5" />}
            label="Print"
            disabled={!isGenerated}
            onClick={onPrint}
          />
        </div>
      </div>
    </section>
  );
}

// ── Local helper ──────────────────────────────────────────────────────────────

function ActionButton({
  id,
  icon,
  label,
  disabled,
  onClick,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 bg-white/8 text-sm font-medium text-zinc-300 hover:bg-amber-500/20 hover:text-amber-500 hover:border-amber-500/50 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/8 disabled:hover:text-zinc-300 disabled:hover:border-white/20"
    >
      {icon}
      {label}
    </button>
  );
}
