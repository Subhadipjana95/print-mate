"use client";

import React, { useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import type { StatusState } from "@/lib/photo-utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

interface UploadZoneProps {
  originalUrl: string;
  uploadedFile: File | null;
  onFileAccepted: (file: File, objectUrl: string) => void;
  onStatus: (status: StatusState) => void;
  /** revoke the previous object URL before creating a new one */
  prevOriginalUrl: string;
}

export function UploadZone({
  originalUrl,
  uploadedFile,
  onFileAccepted,
  onStatus,
  prevOriginalUrl,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function acceptFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onStatus({
        message: "Unsupported file format. Please upload JPG or PNG.",
        type: "error",
      });
      return;
    }
    if (prevOriginalUrl) URL.revokeObjectURL(prevOriginalUrl);
    const url = URL.createObjectURL(file);
    onFileAccepted(file, url);
    onStatus({
      message: "Photo selected — click 'Remove Background & Generate'.",
      type: "info",
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative lg:col-span-1 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[220px] flex flex-col items-center justify-center gap-3 p-6 group ${
        isDragging
          ? "border-amber-600/50 bg-amber-500/8"
          : "border-amber-600/30 bg-amber-500/5 hover:border-amber-600/50 hover:bg-amber-500/8"
      }`}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      {originalUrl ? (
        /* ── File already selected ── */
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalUrl}
            alt="Original preview"
            className="w-full max-h-40 object-contain rounded-lg"
          />
          <p className="text-sm text-amber-500/70 text-center">
            {uploadedFile?.name}
            <br />
            <span className="text-xs text-amber-500/50">Click to change</span>
          </p>
        </>
      ) : (
        /* ── Empty state ── */
        <>
          <div className="w-14 h-14 rounded-lg bg-amber-600/4 border border-amber-500/8 flex items-center justify-center group-hover:bg-amber-500/6 transition-colors">
            <ImageIcon className="w-6 h-6 text-amber-500/40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-amber-500/70">Drop photo here</p>
            <p className="text-xs text-amber-500/50 mt-1">JPG or PNG, any size</p>
          </div>
          <button className="px-4 py-1.5 rounded-md bg-yellow-700 text-black text-xs font-medium group-hover:bg-amber-600/60 group-hover:text-neutral-100/50 transition-colors mt-1">
            Browse files
          </button>
        </>
      )}
    </div>
  );
}
