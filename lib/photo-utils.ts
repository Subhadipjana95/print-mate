// ── Constants ─────────────────────────────────────────────────────────────────

export const API_ENDPOINT = "https://api.remove.bg/v1.0/removebg";
export const DPI = 300;
export const MM_PER_INCH = 25.4;
export const MAX_QTY = 20;
export const MIN_QTY = 1;

export const SIZE_PRESETS = {
  "35x45": { label: "31 × 35 mm (Normal Passport)", widthMm: 30.48, heightMm: 34.925 },
  "51x51": { label: "51 × 51 mm (US Passport)", widthMm: 51, heightMm: 51 },
} as const;

export const SHEET_PRESETS = {
  "4x6": { label: "4 × 6 in", widthIn: 4, heightIn: 6, preferredCols: 3 },
  "7x5": { label: "7 × 5 in", widthIn: 7, heightIn: 5, preferredCols: null },
  a4: { label: "A4", widthMm: 210, heightMm: 297, preferredCols: null },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type SizePresetKey = keyof typeof SIZE_PRESETS;
export type SheetPresetKey = keyof typeof SHEET_PRESETS;
export type SheetPreset = (typeof SHEET_PRESETS)[SheetPresetKey];

export type StatusState = {
  message: string;
  type: "idle" | "success" | "error" | "info";
};

// ── Math helpers ──────────────────────────────────────────────────────────────

export function mmToPx(mm: number): number {
  return Math.round((mm / MM_PER_INCH) * DPI);
}

export function inToPx(inches: number): number {
  return Math.round(inches * DPI);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getSheetPixelSize(preset: SheetPreset): {
  width: number;
  height: number;
} {
  if ("widthIn" in preset && typeof preset.widthIn === "number") {
    return { width: inToPx(preset.widthIn), height: inToPx(preset.heightIn) };
  }
  const p = preset as { widthMm: number; heightMm: number };
  return { width: mmToPx(p.widthMm), height: mmToPx(p.heightMm) };
}

// ── Image helpers ─────────────────────────────────────────────────────────────

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to load generated image."));
    img.src = url;
  });
}

export async function detectFaceCenter(
  imageElement: HTMLImageElement
): Promise<{ x: number; y: number } | null> {
  if (!("FaceDetector" in window)) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).FaceDetector({
      fastMode: true,
      maxDetectedFaces: 1,
    });
    const faces = await detector.detect(imageElement);
    if (!faces.length || !faces[0].boundingBox) return null;
    const box = faces[0].boundingBox;
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  } catch {
    return null;
  }
}

export function calculateCropRect(
  sourceWidth: number,
  sourceHeight: number,
  targetAspect: number,
  focusPoint: { x: number; y: number } | null
): { x: number; y: number; width: number; height: number } {
  const sourceAspect = sourceWidth / sourceHeight;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceAspect > targetAspect) {
    cropWidth = sourceHeight * targetAspect;
  } else {
    cropHeight = sourceWidth / targetAspect;
  }

  const focus = focusPoint ?? { x: sourceWidth / 2, y: sourceHeight * 0.45 };
  const x = clamp(focus.x - cropWidth / 2, 0, sourceWidth - cropWidth);
  const y = clamp(focus.y - cropHeight / 2, 0, sourceHeight - cropHeight);

  return { x, y, width: cropWidth, height: cropHeight };
}

export function chooseWrapLayout(
  qty: number,
  photoWidth: number,
  photoHeight: number,
  availableWidth: number,
  availableHeight: number,
  gap: number,
  preferredCols: number | null
): { cols: number; rows: number } {
  let cols = Math.max(
    1,
    Math.floor((availableWidth + gap) / (photoWidth + gap))
  );
  if (preferredCols && cols >= preferredCols) {
    cols = Math.min(preferredCols, qty);
  }
  const rows = Math.ceil(qty / cols);
  const requiredHeight = rows * photoHeight + (rows - 1) * gap;
  if (requiredHeight > availableHeight) {
    throw new Error(
      "Selected size and quantity overflow selected sheet height. Reduce quantity or size."
    );
  }
  return { cols, rows };
}

// ── API ───────────────────────────────────────────────────────────────────────

export async function removeBackground(
  file: File,
  apiKey: string
): Promise<Blob> {
  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");
  formData.append("format", "png");

  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `remove.bg error (${response.status}): ${errorText || "Unknown error"}`
    );
  }

  return response.blob();
}

// ── Print helper ──────────────────────────────────────────────────────────────

export function buildPrintDimensions(sheetPreset: SheetPreset): {
  pageSize: string;
  imgW: string;
  imgH: string;
} {
  if ("widthIn" in sheetPreset) {
    const s = sheetPreset as { widthIn: number; heightIn: number };
    return {
      pageSize: `${s.widthIn}in ${s.heightIn}in`,
      imgW: `${s.widthIn}in`,
      imgH: `${s.heightIn}in`,
    };
  }
  const s = sheetPreset as { widthMm: number; heightMm: number };
  return {
    pageSize: `${s.widthMm}mm ${s.heightMm}mm`,
    imgW: `${s.widthMm}mm`,
    imgH: `${s.heightMm}mm`,
  };
}
