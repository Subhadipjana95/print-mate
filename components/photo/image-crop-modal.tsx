import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  targetAspect?: number;
  onCropComplete: (croppedBlob: Blob) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function ImageCropModal({
  open,
  onOpenChange,
  imageUrl,
  targetAspect = 35 / 45,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, targetAspect));
  }

  async function handleComplete() {
    if (!imgRef.current || !completedCrop) {
      onOpenChange(false);
      return;
    }

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );

    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob);
        onOpenChange(false);
      }
    }, "image/png", 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-xl w-[calc(100%-2rem)] sm:w-full bg-zinc-950 border-white/10 text-white rounded-lg">
        <DialogHeader>
          <DialogTitle>Adjust Crop</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Drag the frame to re-adjust the automatic crop for your passport sheet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto max-h-[60vh] flex items-center justify-center p-4 transparent-checker rounded-md ring-1 ring-white/10 bg-black/50">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={targetAspect}
            keepSelection
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop me"
              style={{ maxHeight: "50vh" }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:gap-0 md:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-300 hover:text-white bg-accent border border-white/10 rounded-md">
            Cancel
          </Button>
          <Button onClick={handleComplete} className="bg-amber-500 text-black hover:bg-amber-400 rounded-md">
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
