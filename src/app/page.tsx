"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Brain, BookOpen, Map, GraduationCap, CloudSun } from "lucide-react";
import type { MeshEventMessage, MeshModuleType } from "@/types/meshContract";

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
type MapViewId = "map" | "climate";

// Ánh xạ module mesh (contract) → tab hiển thị của Hub
const MODULE_TO_TAB: Partial<Record<MeshModuleType, TabId>> = {
  dia8: "dia8",
  dia9: "dia9",
  bando: "map",
};

// Windy.com embed — khí hậu thời gian thực, tập trung Việt Nam & Biển Đông
const WINDY_URL =
  "https://embed.windy.com/embed2.html?lat=15.5&lon=110.5&zoom=5&level=surface&overlay=temp&product=ecmwf&menu=true&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1";

interface Subsystem {
  id: TabId;
  shortLabel: string;
  icon: typeof Brain;
  url: string;
}

const SUBSYSTEMS: Subsystem[] = [
  {
    id: "chat",
    shortLabel: "Trợ lý",
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
  const [mapView, setMapView] = useState<MapViewId>("map");
  const current = SUBSYSTEMS.find((s) => s.id === active)!;

  // ── Central Event Bus: lắng nghe & định tuyến sự kiện mesh từ Chat Expert ──
  useEffect(() => {
    const handleMeshMessage = (event: MessageEvent) => {
      const data = event.data as MeshEventMessage | undefined;
      if (!data || data.protocol !== "TEACHER_OS_MESH_V1") return;

      const { event: eventType, payload } = data;
      if (eventType !== "NAVIGATE_TOPIC" && eventType !== "REQUEST_ASSESSMENT") return;

      const { targetModule, topicId } = payload;

      // 1. Chuyển tab active sang module tương ứng
      const tab = MODULE_TO_TAB[targetModule];
      if (tab) setActive(tab);

      // 2. Đồng bộ URL query params (nhẹ, không reload)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tab ?? targetModule);
        if (topicId) url.searchParams.set("topic", topicId);
        window.history.replaceState(null, "", url.toString());
      }

      // 3. Chuyển tiếp tín hiệu sang iframe đích (nếu đã render)
      window.setTimeout(() => {
        const targetIframe = document.querySelector(
          `iframe[data-module="${targetModule}"]`,
        ) as HTMLIFrameElement | null;
        if (targetIframe?.contentWindow) {
          targetIframe.contentWindow.postMessage(
            {
              protocol: "TEACHER_OS_MESH_V1",
              event: "CONSUME_TOPIC_FOCUS",
              payload,
            },
            "*",
          );
        }
      }, 250);
    };

    window.addEventListener("message", handleMeshMessage);
    return () => window.removeEventListener("message", handleMeshMessage);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50">
      {/* ── Header: 1 dòng segmented control, cố định ── */}
      <header className="sticky top-0 z-40 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 pt-[env(safe-area-inset-top,0px)]">
        <nav className="no-scrollbar overflow-x-auto flex gap-2 px-3 py-2.5 text-sm font-medium">
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
      <main className="flex-1 min-h-0 flex flex-col">
        {active === "map" ? (
          <>
            {/* Tab phụ: Bản đồ / Khí hậu thời gian thực */}
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-10">
              <button
                onClick={() => setMapView("map")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  mapView === "map"
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Map className="w-4 h-4" />
                Bản đồ
              </button>
              <button
                onClick={() => setMapView("climate")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  mapView === "climate"
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <CloudSun className="w-4 h-4" />
                Khí hậu thời gian thực
              </button>
            </div>

            <div className="flex-1 min-h-0 relative" data-module="bando">
              {mapView === "map" ? (
                <MapViewer />
              ) : (
                <iframe
                  src={WINDY_URL}
                  className="w-full h-full border-0 bg-white"
                  title="Khí hậu thời gian thực — Windy.com"
                  allow="fullscreen; geolocation"
                  loading="lazy"
                />
              )}
            </div>
          </>
        ) : (
          <iframe
            key={current.id}
            src={current.url}
            data-module={current.id}
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
