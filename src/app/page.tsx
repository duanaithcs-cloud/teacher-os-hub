"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Brain, BookOpen, Map, GraduationCap, Layers } from "lucide-react";

// Bản đồ GIS nội bộ (Leaflet) — dynamic import để tránh lỗi SSR (Leaflet cần window)
const MapViewer = dynamic(() => import("../components/MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">
      Đang tải bản đồ…
    </div>
  ),
});

type TabId = "chat" | "dia9" | "dia8" | "map";

interface Subsystem {
  id: TabId;
  shortLabel: string;
  icon: typeof Brain;
  url: string;
}

const SUBSYSTEMS: Subsystem[] = [
  {
    id: "chat",
    shortLabel: "Trợ lý HSG",
    icon: Brain,
    url: process.env.NEXT_PUBLIC_CHAT_EXPERT_URL ?? "https://teacher-os-chat-expert.vercel.app",
  },
  {
    id: "dia9",
    shortLabel: "Địa 9",
    icon: GraduationCap,
    url: process.env.NEXT_PUBLIC_DIA9_URL ?? "https://dia9dragon.vercel.app",
  },
  {
    id: "dia8",
    shortLabel: "Địa 8",
    icon: BookOpen,
    url: process.env.NEXT_PUBLIC_DIA8_URL ?? "https://dia8dragon.vercel.app",
  },
  {
    id: "map",
    shortLabel: "Bản đồ",
    icon: Map,
    url: "",
  },
];

export default function HubPage() {
  const [active, setActive] = useState<TabId>("chat");
  const current = SUBSYSTEMS.find((s) => s.id === active)!;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50">
      {/* ── Header: 2 dòng, cố định, không đè nội dung ── */}
      <header className="sticky top-0 z-40 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 pt-[env(safe-area-inset-top,0px)]">
        {/* Dòng 1: logo + tên + trạng thái */}
        <div className="flex items-center gap-2 px-3 h-12">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-[15px] truncate">Teacher OS</span>
          <div className="flex-1" />
          <span className="shrink-0 text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1 whitespace-nowrap">
            {current.shortLabel}
          </span>
        </div>

        {/* Dòng 2: segmented control, vuốt ngang */}
        <nav className="no-scrollbar overflow-x-auto flex gap-2 px-3 pb-2 text-sm font-medium">
          {SUBSYSTEMS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.shortLabel}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Nội dung: nhường toàn bộ đáy cho khung chat ── */}
      <main className="flex-1 min-h-0 relative">
        {active === "map" ? (
          <MapViewer />
        ) : (
          <iframe
            key={current.id}
            src={current.url}
            className="w-full h-full border-0 bg-white"
            title={current.shortLabel}
            allow="geolocation; fullscreen; clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            loading="lazy"
          />
        )}
      </main>
    </div>
  );
}
