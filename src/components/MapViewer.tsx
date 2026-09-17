"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type FilterId = "all" | "l8" | "l9";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "l8", label: "Địa lí tự nhiên L8" },
  { id: "l9", label: "Vùng kinh tế L9" },
];

// Điểm nút tri thức trọng điểm phục vụ Địa lí tự nhiên L8 (số liệu chuẩn phổ thông)
const L8_NODES: { name: string; coords: [number, number]; note: string }[] = [
  { name: "Đỉnh Phan-xi-păng", coords: [22.303, 103.775], note: "Đỉnh cao nhất Việt Nam (~3.147 m), thuộc dãy Hoàng Liên Sơn." },
  { name: "Vịnh Hạ Long", coords: [20.91, 107.18], note: "Di sản thiên nhiên thế giới; địa hình cacxtơ bị ngập nước biển." },
  { name: "Đồng bằng sông Hồng", coords: [20.7, 106.1], note: "Châu thổ do phù sa sông Hồng và sông Thái Bình bồi đắp." },
  { name: "Đồng bằng sông Cửu Long", coords: [10.05, 105.55], note: "Châu thổ lớn nhất, do phù sa sông Mê Công bồi đắp." },
  { name: "Dãy Trường Sơn", coords: [17.0, 106.5], note: "Dãy núi chạy dọc phía tây miền Trung; tạo sự bất đối xứng địa hình." },
  { name: "Cao nguyên Tây Nguyên", coords: [13.5, 108.0], note: "Đất badan màu mỡ, thế mạnh cây công nghiệp lâu năm." },
  { name: "Đèo Hải Vân", coords: [16.2, 108.13], note: "Ranh giới tự nhiên giữa Bắc Trung Bộ và Duyên hải Nam Trung Bộ." },
  { name: "Quần đảo Hoàng Sa", coords: [16.65, 112.7], note: "Thuộc chủ quyền Việt Nam, có vị trí quan trọng trên Biển Đông." },
  { name: "Quần đảo Trường Sa", coords: [8.6, 111.9], note: "Thuộc chủ quyền Việt Nam, trấn giữ vùng biển phía nam." },
];

interface RegionInfo {
  name: string;
  shortName: string;
  color: string;
  center: [number, number];
  areaNote: string;
}

export default function MapViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const l8GroupRef = useRef<L.LayerGroup | null>(null);
  const l9GroupRef = useRef<L.LayerGroup | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");

  // Khởi tạo bản đồ một lần duy nhất (chỉ chạy client-side)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [16.0, 107.5],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const l8Group = L.layerGroup();
    const l9Group = L.layerGroup();
    l8Group.addTo(map);
    l9Group.addTo(map);

    mapRef.current = map;
    l8GroupRef.current = l8Group;
    l9GroupRef.current = l9Group;

    // ── Lớp Địa lí tự nhiên L8: các điểm nút tri thức ──
    L8_NODES.forEach((node) => {
      L.circleMarker(node.coords, {
        radius: 7,
        color: "#4f46e5",
        weight: 2,
        fillColor: "#818cf8",
        fillOpacity: 0.85,
      })
        .bindPopup(`<strong>${node.name}</strong><br/><span style="font-size:12px">${node.note}</span>`)
        .addTo(l8Group);
    });

    // ── Lớp Vùng kinh tế L9: tô màu theo 6 vùng + nhãn trọng tâm ──
    (async () => {
      try {
        const [regionsRes, geoRes] = await Promise.all([
          fetch("/data/regions.json"),
          fetch("/data/vietnam_adm1.geojson"),
        ]);
        const regions = await regionsRes.json();
        const geo = await geoRes.json();

        // Map shapeISO → màu vùng kinh tế
        const isoColor: Record<string, string> = {};
        const regionInfos: RegionInfo[] = [];
        for (const rg of regions.regions ?? []) {
          for (const iso of rg.provinceIsoGeoBoundariesADM1 ?? []) {
            isoColor[iso] = rg.color;
          }
          regionInfos.push({
            name: rg.name,
            shortName: rg.shortName,
            color: rg.color,
            center: rg.center,
            areaNote: rg.areaNote ?? "",
          });
        }

        // Polygon các tỉnh, tô màu theo vùng kinh tế
        const polyLayer = L.geoJSON(geo, {
          style: (feature) => {
            const iso = feature?.properties?.shapeISO as string;
            const c = isoColor[iso] ?? "#cbd5e1";
            return {
              color: c,
              weight: 1,
              fillColor: c,
              fillOpacity: 0.4,
            };
          },
        });
        polyLayer.eachLayer((layer) => {
          const iso = (layer as any)?.feature?.properties?.shapeISO;
          const name = (layer as any)?.feature?.properties?.shapeName;
          if (iso) {
            (layer as L.Path).bindTooltip(`${name}`, { sticky: true });
          }
        });
        polyLayer.addTo(l9Group);

        // Nhãn trọng tâm từng vùng (circleMarker, không cần ảnh icon)
        regionInfos.forEach((rg) => {
          L.circleMarker(rg.center, {
            radius: 6,
            color: rg.color,
            weight: 3,
            fillColor: "#ffffff",
            fillOpacity: 0.9,
          })
            .bindTooltip(`<strong>${rg.name}</strong><br/><span style="font-size:11px">${rg.areaNote}</span>`, {
              sticky: true,
              direction: "top",
            })
            .addTo(l9Group);
        });
      } catch (err) {
        console.error("[MapViewer] Lỗi nạp dữ liệu bản đồ:", err);
      }
    })();

    return () => {
      map.remove();
      mapRef.current = null;
      l8GroupRef.current = null;
      l9GroupRef.current = null;
    };
  }, []);

  // Áp dụng bộ lọc nhanh
  useEffect(() => {
    const l8 = l8GroupRef.current;
    const l9 = l9GroupRef.current;
    if (!l8 || !l9) return;
    if (filter === "all") {
      if (!mapRef.current?.hasLayer(l8)) l8.addTo(mapRef.current!);
      if (!mapRef.current?.hasLayer(l9)) l9.addTo(mapRef.current!);
    } else if (filter === "l8") {
      if (!mapRef.current?.hasLayer(l8)) l8.addTo(mapRef.current!);
      if (mapRef.current?.hasLayer(l9)) mapRef.current.removeLayer(l9);
    } else {
      if (!mapRef.current?.hasLayer(l9)) l9.addTo(mapRef.current!);
      if (mapRef.current?.hasLayer(l8)) mapRef.current.removeLayer(l8);
    }
  }, [filter]);

  return (
    <div className="relative h-[calc(100vh-80px)] w-full min-h-[560px]">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Bộ lọc nhanh Layer Control */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] flex gap-1 bg-white/85 backdrop-blur-md border border-gray-200 rounded-full px-2 py-1 shadow-sm">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              filter === f.id
                ? "bg-brand-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Chú giải */}
      <div className="absolute bottom-3 left-3 z-[500] bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl px-3 py-2 text-[11px] text-gray-600 shadow-sm space-y-1">
        <p className="font-semibold text-gray-800">Chú giải</p>
        <p>🟣 Điểm nút tri thức tự nhiên (L8)</p>
        <p>🟦 Vùng kinh tế tô màu + trọng tâm (L9)</p>
        <p className="text-[10px] text-gray-400">Nền: OpenStreetMap · Ranh giới ADM1 geoBoundaries (2008, cần rà soát cập nhật 2025)</p>
      </div>
    </div>
  );
}
