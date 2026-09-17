"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[hub/error] Lỗi runtime:", error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-brand-900 mb-1">HUB gặp sự cố</h2>
        <p className="text-sm text-gray-600 mb-4">Anh thử tải lại trang nhé.</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    </div>
  );
}
