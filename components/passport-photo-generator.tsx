"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, CheckCircle, AlertCircle, Info, Crop } from "lucide-react";

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
import { ImageCropModal } from "@/components/photo/image-crop-modal";
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
  const [baseProcessedUrl, setBaseProcessedUrl] = useState(""); // The unaltered remove.bg result
  const [processedUrl, setProcessedUrl] = useState(""); // The currently used result (possibly cropped)
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);

  // ── Crop state ─────────────────────────────────────────────────────────────
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // ── Sheet settings ─────────────────────────────────────────────────────────
  const [qty, setQty] = useState(3);
  const [sizePreset, setSizePreset] = useState<SizePresetKey>("35x45");
  const [sheetPreset, setSheetPreset] = useState<SheetPresetKey>("4x6");
  const [showGuides, setShowGuides] = useState(true);
  const [bgColor, setBgColor] = useState("#ffffff");

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

      // Establish edge padding to be exactly half the photo spacing.
      // E.g., if there are 3 columns, there are 2 internal gaps and 2 edge margins (each 0.5 gap), totaling 3 gaps.
      let baseGap = Math.max(12, Math.round(sheetWidth / 50));
      const availableWidth = sheetWidth - baseGap;
      const availableHeight = sheetHeight - baseGap;
      const targetAspect = selectedSize.widthPx / selectedSize.heightPx;

      const prefCols = "preferredCols" in sheetPr ? sheetPr.preferredCols : null;
      if (prefCols) {
        // Ensure gap isn't artificially too big to fit preferred cols, accounting for prefCols gaps total
        const maxGapForPref = Math.floor((sheetWidth - selectedSize.widthPx * prefCols) / prefCols);
        baseGap = clamp(baseGap, 8, Math.max(8, maxGapForPref));
      }

      const layout = chooseWrapLayout(
        quantity,
        selectedSize.widthPx,
        selectedSize.heightPx,
        availableWidth,
        availableHeight,
        baseGap,
        prefCols as number | null
      );

      // Determine the maximum possible rows and cols that can fit on the sheet to calculate the stable gapY and gapX
      const maxPossibleRows = Math.floor(sheetHeight / (selectedSize.heightPx + baseGap));
      const maxPossibleCols = Math.floor(sheetWidth / (selectedSize.widthPx + baseGap));

      // Distribute leftover width based on the MAX possible cols, NOT the current cols.
      // This ensures gapX is identical whether there is 1 col or 4 cols.
      const totalMaxPhotoWidth = maxPossibleCols * selectedSize.widthPx;
      const leftoverMaxWidth = sheetWidth - totalMaxPhotoWidth;
      let gapX = baseGap;
      if (maxPossibleCols > 0) {
        // distribute remaining horizontal space, divided by maxPossibleCols instead of maxPossibleCols + 1
        // to leave exactly half a gap for the left and right edges.
        const maxGapX = Math.round(sheetWidth * 0.08); 
        gapX = clamp(Math.floor(leftoverMaxWidth / maxPossibleCols), baseGap, maxGapX);
      }
      
      // Calculate total width of the *entire grid* if it was full to find the correct origin offsetX
      const fullGridWidth = totalMaxPhotoWidth + (maxPossibleCols - 1) * gapX;
      const offsetX = Math.floor((sheetWidth - fullGridWidth) / 2);

      // Distribute leftover height based on the MAX possible rows, NOT the current rows.
      // This ensures gapY is identical whether there is 1 row or 4 rows.
      const totalMaxPhotoHeight = maxPossibleRows * selectedSize.heightPx;
      const leftoverMaxHeight = sheetHeight - totalMaxPhotoHeight;
      let gapY = baseGap;
      if (maxPossibleRows > 0) {
        const maxGapY = Math.round(sheetHeight * 0.08);
        gapY = clamp(Math.floor(leftoverMaxHeight / maxPossibleRows), baseGap, maxGapY);
      }
      
      // Calculate total height of the *entire grid* if it was full to find the correct origin offsetY
      const fullGridHeight = totalMaxPhotoHeight + (maxPossibleRows - 1) * gapY;
      const offsetY = Math.floor((sheetHeight - fullGridHeight) / 2);

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
        const x = Math.round(offsetX + col * (selectedSize.widthPx + gapX));
        const y = Math.round(offsetY + row * (selectedSize.heightPx + gapY));

        // Draw background color for the individual photo
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, selectedSize.widthPx, selectedSize.heightPx);

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

      const isWarning = quantity === 0;

      setIsGenerated(true);
      setStatus({
        message: isWarning 
          ? "No photos generated. Please increase the quantity to at least 1." 
          : `Generated ${quantity} photo${quantity > 1 ? "s" : ""} at ${selectedSize.label} on ${sheetPr.label}.`,
        type: isWarning ? "error" : "success",
      });
    },
    [sizePreset, sheetPreset, showGuides, bgColor]
  );

  // Re-render when controls change (after first generation)
  useEffect(() => {
    if (!processedImage) return;
    renderSheet(processedImage, qty).catch((err) => {
      resetSheet();
      setStatus({ message: err.message ?? "Unable to regenerate.", type: "error" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, sizePreset, sheetPreset, showGuides, bgColor]);

  // ── Process & generate ─────────────────────────────────────────────────────

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      const newUrl = URL.createObjectURL(croppedBlob);
      const imgEl = await loadImageFromUrl(newUrl);
      if (processedUrl && processedUrl !== baseProcessedUrl) {
        URL.revokeObjectURL(processedUrl); // Cleanup old cropped URL
      }
      setProcessedUrl(newUrl);
      setProcessedImage(imgEl);
      await renderSheet(imgEl, qty);
      setStatus({ message: "Crop applied successfully.", type: "success" });
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : "Failed to load cropped image.",
        type: "error",
      });
    }
  };

  const processAndGenerate = async () => {
    if (!uploadedFile) {
      setStatus({ message: "Please upload a JPG or PNG image first.", type: "error" });
      return;
    }

    const apiKey = process.env.REMOVE_BG_API_KEY ?? "";
    setStatus({ message: "", type: "idle" });
    setIsLoading(true);

    try {
      const resultBlob = await removeBackground(uploadedFile, apiKey);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      if (baseProcessedUrl && baseProcessedUrl !== processedUrl) {
        URL.revokeObjectURL(baseProcessedUrl);
      }
      const newUrl = URL.createObjectURL(resultBlob);
      const imgEl = await loadImageFromUrl(newUrl);
      
      setBaseProcessedUrl(newUrl);
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
            actionLabel="Crop"
            actionIcon={<Crop className="w-3 h-3" />}
            onAction={() => setIsCropModalOpen(true)}
          />
        </div>

        {baseProcessedUrl && (
          <ImageCropModal
            open={isCropModalOpen}
            onOpenChange={setIsCropModalOpen}
            imageUrl={baseProcessedUrl}
            targetAspect={SIZE_PRESETS[sizePreset].widthMm / SIZE_PRESETS[sizePreset].heightMm}
            onCropComplete={handleCropComplete}
          />
        )}

        <SheetSettings
          qty={qty}
          sizePreset={sizePreset}
          sheetPreset={sheetPreset}
          showGuides={showGuides}
          bgColor={bgColor}
          onQtyChange={setQty}
          onSizePresetChange={setSizePreset}
          onSheetPresetChange={setSheetPreset}
          onShowGuidesToggle={() => setShowGuides((p) => !p)}
          onBgColorChange={setBgColor}
          onCropClick={() => setIsCropModalOpen(true)}
          canCrop={!!baseProcessedUrl}
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
