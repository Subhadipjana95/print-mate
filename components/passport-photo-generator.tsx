"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, CheckCircle, AlertCircle, Info } from "lucide-react";

import {
  SIZE_PRESETS,
  SHEET_PRESETS,
  MIN_QTY,
  MAX_QTY,
  clamp,
  mmToPx,
  getSheetPixelSize,
  loadImageFromUrl,
  detectFaceCenter,
  calculateCropRect,
  chooseWrapLayout,
  removeBackground,
  buildPrintDimensions,
  type SizePresetKey,
  type SheetPresetKey,
  type StatusState,
} from "@/lib/photo-utils";

import { AppHeader } from "@/components/photo/app-header";
import { AppFooter } from "@/components/photo/app-footer";
import { HeroSection } from "@/components/photo/hero-section";
import { UploadZone } from "@/components/photo/upload-zone";
import { PreviewCard } from "@/components/photo/preview-card";
import { SheetSettings } from "@/components/photo/sheet-settings";
import { SheetPreview } from "@/components/photo/sheet-preview";

// ─────────────────────────────────────────────────────────────────────────────
// Root orchestrator — owns all shared state and canvas logic
// ─────────────────────────────────────────────────────────────────────────────

export function PassportPhotoGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Photo state ────────────────────────────────────────────────────────────
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [processedUrl, setProcessedUrl] = useState("");
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);

  // ── Sheet settings ─────────────────────────────────────────────────────────
  const [qty, setQty] = useState(3);
  const [sizePreset, setSizePreset] = useState<SizePresetKey>("35x45");
  const [sheetPreset, setSheetPreset] = useState<SheetPresetKey>("4x6");
  const [showGuides, setShowGuides] = useState(true);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("Printable 4 × 6 in Sheet Preview");
  const [status, setStatus] = useState<StatusState>({
    message: "Upload a photo and generate your passport sheet.",
    type: "idle",
  });

  // ── Sync canvas size + title when sheet preset changes ─────────────────────
  useEffect(() => {
    const preset = SHEET_PRESETS[sheetPreset];
    const { width, height } = getSheetPixelSize(preset);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
    setSheetTitle(`Printable ${preset.label} Sheet Preview`);
  }, [sheetPreset]);

  // ── Canvas helpers ─────────────────────────────────────────────────────────

  const resetSheet = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = getSheetPixelSize(SHEET_PRESETS[sheetPreset]);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    setIsGenerated(false);
  }, [sheetPreset]);

  const renderSheet = useCallback(
    async (imgEl: HTMLImageElement, quantity: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const preset = SIZE_PRESETS[sizePreset];
      const selectedSize = {
        ...preset,
        widthPx: mmToPx(preset.widthMm),
        heightPx: mmToPx(preset.heightMm),
      };
      const sheetPr = SHEET_PRESETS[sheetPreset];
      const { width: sheetWidth, height: sheetHeight } = getSheetPixelSize(sheetPr);

      canvas.width = sheetWidth;
      canvas.height = sheetHeight;

      const edgePadding = Math.max(10, Math.round(sheetWidth * 0.02));
      const availableWidth = sheetWidth - edgePadding * 2;
      const availableHeight = sheetHeight - edgePadding * 2;
      const targetAspect = selectedSize.widthPx / selectedSize.heightPx;

      let gap = Math.max(8, Math.round(sheetWidth / 60));
      const prefCols = "preferredCols" in sheetPr ? sheetPr.preferredCols : null;
      if (prefCols === 3) {
        const maxGap = Math.floor((availableWidth - selectedSize.widthPx * 3) / 2);
        gap = clamp(Math.min(gap, maxGap), 8, 80);
      }

      const layout = chooseWrapLayout(
        quantity,
        selectedSize.widthPx,
        selectedSize.heightPx,
        availableWidth,
        availableHeight,
        gap,
        prefCols as number | null
      );

      // Draw white background + border
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sheetWidth, sheetHeight);
      ctx.strokeStyle = "#d7deea";
      ctx.lineWidth = 5;
      ctx.strokeRect(2, 2, sheetWidth - 4, sheetHeight - 4);

      // Face-aware crop
      const faceCenter = await detectFaceCenter(imgEl);
      const crop = calculateCropRect(
        imgEl.naturalWidth,
        imgEl.naturalHeight,
        targetAspect,
        faceCenter
      );

      for (let i = 0; i < quantity; i++) {
        const col = i % layout.cols;
        const row = Math.floor(i / layout.cols);
        const x = Math.round(edgePadding + col * (selectedSize.widthPx + gap));
        const y = Math.round(edgePadding + row * (selectedSize.heightPx + gap));

        ctx.drawImage(
          imgEl,
          crop.x, crop.y, crop.width, crop.height,
          x, y, selectedSize.widthPx, selectedSize.heightPx
        );

        if (showGuides) {
          ctx.strokeStyle = "#adb8c8";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, selectedSize.widthPx, selectedSize.heightPx);
        }
      }

      setIsGenerated(true);
      setStatus({
        message: `Generated ${quantity} photo${quantity > 1 ? "s" : ""} at ${selectedSize.label} on ${sheetPr.label}.`,
        type: "success",
      });
    },
    [sizePreset, sheetPreset, showGuides]
  );

  // Re-render when controls change (after first generation)
  useEffect(() => {
    if (!processedImage) return;
    renderSheet(processedImage, qty).catch((err) => {
      resetSheet();
      setStatus({ message: err.message ?? "Unable to regenerate.", type: "error" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, sizePreset, sheetPreset, showGuides]);

  // ── Process & generate ─────────────────────────────────────────────────────

  const processAndGenerate = async () => {
    if (!uploadedFile) {
      setStatus({ message: "Please upload a JPG or PNG image first.", type: "error" });
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY ?? "";
    setStatus({ message: "", type: "idle" });
    setIsLoading(true);

    try {
      const resultBlob = await removeBackground(uploadedFile, apiKey);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      const newUrl = URL.createObjectURL(resultBlob);
      const imgEl = await loadImageFromUrl(newUrl);
      setProcessedUrl(newUrl);
      setProcessedImage(imgEl);
      await renderSheet(imgEl, qty);
    } catch (err) {
      resetSheet();
      setStatus({
        message: err instanceof Error ? err.message : "Failed to process image.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const downloadSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isGenerated) return;
    const link = document.createElement("a");
    link.download = `passport-sheet-${qty}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copySheet = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isGenerated) return;

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/png")
    );
    if (!blob) {
      setStatus({ message: "Unable to copy sheet right now.", type: "error" });
      return;
    }

    try {
      if (
        window.isSecureContext &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === "function" &&
        typeof ClipboardItem !== "undefined"
      ) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setStatus({ message: "Sheet copied to clipboard.", type: "success" });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(canvas.toDataURL("image/png"));
        setStatus({
          message: "Image data URL copied (clipboard image copy is limited in this browser).",
          type: "info",
        });
        return;
      }
      setStatus({ message: "Clipboard is not available in this browser context.", type: "error" });
    } catch (err) {
      setStatus({
        message: `Copy failed: ${err instanceof Error ? err.message : "Clipboard permission denied."}`,
        type: "error",
      });
    }
  };

  const printSheet = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isGenerated) return;

    const { pageSize, imgW, imgH } = buildPrintDimensions(SHEET_PRESETS[sheetPreset]);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setStatus({ message: "Popup blocked. Please allow popups and try again.", type: "error" });
      return;
    }

    printWindow.document.write(`<!doctype html><title>Preparing print...</title><p>Preparing print...</p>`);
    printWindow.document.close();

    canvas.toBlob((blob) => {
      if (!blob) {
        printWindow.close();
        setStatus({ message: "Unable to prepare print image.", type: "error" });
        return;
      }

      const blobUrl = URL.createObjectURL(blob);
      const cleanup = () =>
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          if (!printWindow.closed) printWindow.close();
        }, 300);

      printWindow.document.open();
      printWindow.document.write(`<!doctype html>
<html>
<head>
  <title>Print Passport Sheet</title>
  <style>
    @page { size: ${pageSize}; margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .page { width: ${imgW}; height: ${imgH}; }
    img { width: 100%; height: 100%; display: block; }
  </style>
</head>
<body>
  <div class="page">
    <img id="printImage" src="${blobUrl}" alt="Passport sheet" />
  </div>
</body>
</html>`);
      printWindow.document.close();

      const img = printWindow.document.getElementById("printImage") as HTMLImageElement | null;
      if (!img) { cleanup(); setStatus({ message: "Unable to prepare printable image.", type: "error" }); return; }

      img.addEventListener("load", () => setTimeout(() => { printWindow.focus(); printWindow.print(); }, 120));
      printWindow.addEventListener("afterprint", cleanup, { once: true });
      setTimeout(cleanup, 60000);
      setStatus({ message: "Print dialog opened.", type: "info" });
    }, "image/png");
  };

  // ── Status display helper ──────────────────────────────────────────────────

  const StatusIcon =
    status.type === "success" ? CheckCircle : status.type === "error" ? AlertCircle : Info;
  const statusColor =
    status.type === "success" ? "text-amber-500" : status.type === "error" ? "text-red-400" : "text-zinc-400";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white font-sans">
      <AppHeader />

      {/* ── Vertical guide rails ── */}
      <div className="fixed inset-0 pointer-events-none z-40" aria-hidden>
        <div className="max-w-5xl mx-auto h-full relative">
          <div className="absolute inset-y-0 left-0 w-px bg-white/6" />
          <div className="absolute inset-y-0 right-0 w-px bg-white/6" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <HeroSection />

        {/* Upload zone + preview cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <UploadZone
            originalUrl={originalUrl}
            uploadedFile={uploadedFile}
            prevOriginalUrl={originalUrl}
            onFileAccepted={(file, url) => {
              setUploadedFile(file);
              setOriginalUrl(url);
            }}
            onStatus={setStatus}
          />
          <PreviewCard
            title="Original"
            url={originalUrl}
            placeholder="No image selected"
            transparent={false}
          />
          <PreviewCard
            title="Background Removed"
            url={processedUrl}
            placeholder="Generate to preview"
            transparent={true}
          />
        </div>

        <SheetSettings
          qty={qty}
          sizePreset={sizePreset}
          sheetPreset={sheetPreset}
          showGuides={showGuides}
          onQtyChange={setQty}
          onSizePresetChange={setSizePreset}
          onSheetPresetChange={setSheetPreset}
          onShowGuidesToggle={() => setShowGuides((p) => !p)}
        />

        {/* Generate button */}
        <button
          id="process"
          onClick={processAndGenerate}
          disabled={isLoading || !uploadedFile}
          className="w-full h-12 rounded-md font-medium text-md flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-amber-500/80 text-black"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing photo…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Remove Background &amp; Generate
            </>
          )}
        </button>

        {/* Status message */}
        {status.message && (
          <div
            className={`flex items-start gap-2 text-sm ${statusColor}`}
            role="status"
            aria-live="polite"
          >
            <StatusIcon className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        <SheetPreview
          canvasRef={canvasRef}
          sheetTitle={sheetTitle}
          isGenerated={isGenerated}
          onDownload={downloadSheet}
          onCopy={copySheet}
          onPrint={printSheet}
        />
      </main>

      <AppFooter />
    </div>
  );
}
