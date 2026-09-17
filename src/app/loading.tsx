import { Brain } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Brain className="w-12 h-12 text-indigo-200 animate-pulse" />
        <p className="text-sm text-gray-400">Đang nạp Teacher OS HUB…</p>
      </div>
    </div>
  );
}
