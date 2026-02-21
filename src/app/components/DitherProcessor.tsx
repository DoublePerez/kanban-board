import React, { useRef, useCallback } from "react";
import { X, Upload } from "lucide-react";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface DitherProcessorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageProcessed: (dataUrl: string) => void;
  accent?: string;
}

function applyFloydSteinbergDither(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Super contrast: stretch histogram aggressively
  let min = 255, max = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    if (gray < min) min = gray;
    if (gray > max) max = gray;
  }
  const range = max - min || 1;

  for (let i = 0; i < data.length; i += 4) {
    let gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    // Normalize to full range
    gray = ((gray - min) / range) * 255;
    // Apply S-curve for extra punch
    gray = gray / 255;
    gray = gray * gray * (3 - 2 * gray); // smoothstep
    gray = gray * gray * (3 - 2 * gray); // double smoothstep for super contrast
    gray = gray * 255;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  // Floyd-Steinberg error diffusion
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const oldVal = data[idx];
      const newVal = oldVal < 128 ? 0 : 255;
      const error = oldVal - newVal;

      data[idx] = newVal;
      data[idx + 1] = newVal;
      data[idx + 2] = newVal;

      if (x + 1 < width) {
        const i = (y * width + (x + 1)) * 4;
        data[i] += error * 7 / 16;
        data[i + 1] += error * 7 / 16;
        data[i + 2] += error * 7 / 16;
      }
      if (y + 1 < height) {
        if (x - 1 >= 0) {
          const i = ((y + 1) * width + (x - 1)) * 4;
          data[i] += error * 3 / 16;
          data[i + 1] += error * 3 / 16;
          data[i + 2] += error * 3 / 16;
        }
        {
          const i = ((y + 1) * width + x) * 4;
          data[i] += error * 5 / 16;
          data[i + 1] += error * 5 / 16;
          data[i + 2] += error * 5 / 16;
        }
        if (x + 1 < width) {
          const i = ((y + 1) * width + (x + 1)) * 4;
          data[i] += error * 1 / 16;
          data[i + 1] += error * 1 / 16;
          data[i + 2] += error * 1 / 16;
        }
      }
    }
  }
  return imageData;
}

export function DitherProcessor({ isOpen, onClose, onImageProcessed, accent = "#28e413" }: DitherProcessorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const pixelSize = 3;

          // Scale down for dithering (small = bigger pixels when scaled back up)
          const maxSize = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxSize || h > maxSize) {
            const ratio = Math.min(maxSize / w, maxSize / h);
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
          }

          // Downscale by pixel size factor
          const smallW = Math.floor(w / pixelSize);
          const smallH = Math.floor(h / pixelSize);

          // Draw small version
          canvas.width = smallW;
          canvas.height = smallH;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(img, 0, 0, smallW, smallH);
          const imageData = ctx.getImageData(0, 0, smallW, smallH);
          const dithered = applyFloydSteinbergDither(imageData);
          ctx.putImageData(dithered, 0, 0);

          // Scale back up with nearest-neighbor for blocky pixels
          const outCanvas = document.createElement("canvas");
          outCanvas.width = w;
          outCanvas.height = h;
          const outCtx = outCanvas.getContext("2d");
          if (!outCtx) return;

          outCtx.imageSmoothingEnabled = false;
          outCtx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, w, h);

          const dataUrl = outCanvas.toDataURL("image/png");
          onImageProcessed(dataUrl);
          onClose();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onImageProcessed, onClose]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        processImage(file);
      }
    },
    [processImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processImage(file);
      }
    },
    [processImage]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#1a1a1a] rounded-[16px] p-[32px] w-[460px] max-w-[90vw]">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] inset-0 pointer-events-none rounded-[16px]" />

        <div className="flex items-center justify-between mb-[24px]">
          <h2 className="font-['JetBrains_Mono',monospace] font-medium text-white text-[16px] tracking-[0.5px]">
            UPLOAD BACKGROUND
          </h2>
          <button onClick={onClose} className="text-[#888] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="font-['JetBrains_Mono',monospace] text-[#888] text-[12px] mb-[20px] leading-[18px]">
          Image will be dithered with Floyd-Steinberg error diffusion at 3px pixel size.
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-[12px] p-[40px] flex flex-col items-center justify-center cursor-pointer transition-colors"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = hexToRgba(accent, 0.4))}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
        >
          <Upload size={32} className="text-[#555] mb-[12px]" />
          <p className="font-['JetBrains_Mono',monospace] text-[#888] text-[13px]">
            Drop image here or click to upload
          </p>
          <p className="font-['JetBrains_Mono',monospace] text-[#555] text-[11px] mt-[8px]">
            PNG, JPG, WEBP supported
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
