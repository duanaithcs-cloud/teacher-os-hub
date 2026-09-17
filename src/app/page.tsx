"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Brain,
  BookOpen,
  Map,
  GraduationCap,
  GitBranch,
  Layers,
} from "lucide-react";

// Bản đồ GIS nội bộ (Leaflet) — dynamic import để tránh lỗi SSR (Leaflet cần window)
const MapViewer = dynamic(() => import("../components/MapViewer"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center text-sm text-gray-500">
      Đang tải bản đồ GIS nội bộ…
    </div>
  ),
});

type TabId = "chat" | "dia9" | "dia8" | "map";

interface Subsystem {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: typeof Brain;
  description: string;
  url: string;
}

const SUBSYSTEMS: Subsystem[] = [
  {
    id: "chat",
    label: "Trợ lý HSG & Nhân quả",
    shortLabel: "Trợ lý HSG",
    icon: Brain,
    description: "Chatbot chuyên gia — Graph-RAG + chuỗi nhân quả L8→L9",
    url: process.env.NEXT_PUBLIC_CHAT_EXPERT_URL ?? "https://teacher-os-chat-expert.vercel.app",
  },
  {
    id: "dia9",
    label: "Hệ thống Địa lí 9",
    shortLabel: "Địa 9",
    icon: GraduationCap,
    description: "Luyện thi HSG Địa 9 — ngân hàng học liệu, thi đấu, tài liệu",
    url: process.env.NEXT_PUBLIC_DIA9_URL ?? "https://dia9dragon.vercel.app",
  },
  {
    id: "dia8",
    label: "Hệ thống Địa lí 8",
    shortLabel: "Địa 8",
    icon: BookOpen,
    description: "Học liệu Địa 8 — 33 chủ đề, quiz MCQ/TF/FILL/MATCHING",
    url: process.env.NEXT_PUBLIC_DIA8_URL ?? "https://dia8dragon.vercel.app",
  },
  {
    id: "map",
    label: "Bản đồ số & Tri thức",
    shortLabel: "Bản đồ",
    icon: Map,
    description: "Bản đồ số quốc gia + lớp phủ tri thức không gian",
    url: process.env.NEXT_PUBLIC_MAP_URL ?? "https://cosodulieu.bando.com.vn/",
  },
];

export default function HubPage() {
  const [active, setActive] = useState<TabId>("chat");
  const current = SUBSYSTEMS.find((s) => s.id === active)!;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* ── Top bar ── */}
      <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-brand-900 text-base leading-tight">Teacher OS HUB</h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Super-Portal · ThS. Phùng Văn Tiến
            </p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Badge hệ thống đang mở */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-gray-700">{current.label}</span>
        </div>
      </header>

      {/* ── Tab strip (desktop) ── */}
      <nav className="shrink-0 bg-white border-b border-gray-200 px-4 flex gap-1 overflow-x-auto hide-scrollbar">
        {SUBSYSTEMS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* ── Content panel ── */}
      <main className="flex-1 min-h-0 relative">
        {/* Tab 4 — Bản đồ GIS nội bộ (Leaflet) */}
        {active === "map" ? (
          <MapViewer />
        ) : (
          <>
            {/* Header mô tả phân hệ */}
            <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none flex justify-center">
              <div className="bg-white/85 backdrop-blur-md border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-600 shadow-sm max-w-full truncate">
                {current.description}
              </div>
            </div>

            {current.url ? (
              <iframe
                key={current.id}
                src={current.url}
                className="portal-frame w-full h-full min-h-[calc(100vh-80px)] border-0"
                title={current.label}
                allow="geolocation; fullscreen; clipboard-read; clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                loading="lazy"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
                <Map className="w-14 h-14 text-indigo-200" />
                <div>
                  <h2 className="text-lg font-bold text-brand-900 mb-1">{current.label}</h2>
                  <p className="text-sm text-gray-500 max-w-md">
                    {current.description}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── macOS Dock ── */}
      <div className="shrink-0 flex justify-center pb-4 pt-1 px-4">
        <div className="flex items-end gap-2 bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl px-3 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {SUBSYSTEMS.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === active;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                title={s.label}
                className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all ${
                  isActive
                    ? "bg-brand-600 text-white scale-105"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{s.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Footnote ── */}
      <div className="shrink-0 text-center text-[10px] text-gray-400 pb-2">
        Teacher OS HUB · Chatbot Graph-RAG · Địa 9 · Địa 8 · Bản đồ số — ThS. Phùng Văn Tiến
      </div>
    </div>
  );
}
