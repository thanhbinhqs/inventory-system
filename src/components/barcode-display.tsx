"use client";

import { useEffect, useRef } from "react";
import { QrCode } from "lucide-react";

interface BarcodeDisplayProps {
  value: string;
  size?: number;
  showLabel?: boolean;
}

export function BarcodeDisplay({
  value,
  size = 128,
  showLabel = true,
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Generate QR code
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#1e293b",
          light: "#ffffff",
        },
      });
    });
  }, [value, size]);

  if (!value) return null;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <canvas ref={canvasRef} width={size} height={size} className="rounded-lg" />
      {showLabel && (
        <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
          {value}
        </span>
      )}
    </div>
  );
}

/** Hiển thị icon QR nhỏ, click mở popup xem QR lớn */
export function BarcodeBadge({ value }: { value: string }) {
  if (!value) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const w = window.open("", "_blank", "width=400,height=450");
        if (!w) return;
        import("qrcode").then((QRCode) => {
          QRCode.toString(value, { type: "svg", width: 300, margin: 2 })
            .then((svg) => {
              w.document.write(`
                <html><head><title>QR: ${value}</title>
                <style>body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;flex-direction:column;gap:16px;font-family:monospace}</style>
                </head><body>
                ${svg}
                <span style="font-size:14px;color:#64748b">${value}</span>
                </body></html>`);
            });
        });
      }}
      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
    >
      <QrCode className="w-3.5 h-3.5" />
      QR
    </button>
  );
}
