"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, ScanLine, Loader2 } from "lucide-react";

interface BarcodeScannerProps {
  /** Callback khi scan thành công: trả về decoded text (barcode/QR value) */
  onScan: (value: string) => void;
  /** Callback khi có lỗi */
  onError?: (error: string) => void;
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [scanned, setScanned] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrRef = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        try {
          html5QrRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!scannerRef.current) return;

    setInitializing(true);
    setScanned(null);

    try {
      const Html5Qrcode = (await import("html5-qrcode")).Html5Qrcode;
      const scanner = new Html5Qrcode("barcode-scanner-element");
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText: string) => {
          // Success callback
          setScanned(decodedText);
          onScan(decodedText);
          // Stop scanning after first successful scan
          try {
            scanner.stop();
          } catch {}
          setScanning(false);
          setInitializing(false);
        },
        () => {
          // Ignore individual frame errors (just keep scanning)
        }
      );

      setScanning(true);
      setInitializing(false);
    } catch (err: any) {
      setInitializing(false);
      const msg = err?.message || "Không thể truy cập camera";
      onError?.(msg);
    }
  }, [onScan, onError]);

  const stopScanning = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
      } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
    setInitializing(false);
  }, []);

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        try {
          html5QrRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {!scanning ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startScanning}
          disabled={initializing}
          className="gap-2"
        >
          {initializing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
          {initializing ? "Đang mở camera..." : "Quét QR / Barcode"}
        </Button>
      ) : (
        <div className="space-y-3">
          <div
            ref={scannerRef}
            id="barcode-scanner-element"
            className="relative overflow-hidden rounded-xl bg-black max-w-[400px]"
            style={{ minHeight: 200 }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ScanLine className="w-4 h-4 animate-pulse text-green-500" />
              Đang quét...
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={stopScanning}
              className="text-red-500 hover:text-red-600"
            >
              <CameraOff className="w-4 h-4 mr-1" />
              Dừng
            </Button>
          </div>
        </div>
      )}

      {scanned && (
        <div className="text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2 text-green-700 dark:text-green-400">
          ✅ Đã quét: <span className="font-mono font-bold">{scanned}</span>
        </div>
      )}
    </div>
  );
}
