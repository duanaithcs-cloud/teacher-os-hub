"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LayerId = "regions" | "rivers" | "mountains" | "islands";

interface River {
  name: string;
  coords: [number, number][];
  note: string;
}

interface Peak {
  name: string;
  coords: [number, number];
  note: string;
}

interface Range {
  name: string;
  coords: [number, number][];
  note: string;
}

// ── Lớp mạng lưới sông ngòi chính (đường đi gần đúng phục vụ dạy học) ──
const RIVERS: River[] = [
  {
    name: "Sông Hồng",
    coords: [
      [22.55, 103.95],
      [21.85, 104.9],
      [21.45, 105.4],
      [21.05, 105.8],
      [20.45, 106.05],
      [20.25, 106.6],
    ],
    note: "Chảy qua đồng bằng Bắc Bộ, bồi đắp châu thổ sông Hồng.",
  },
  {
    name: "Sông Đà",
    coords: [
      [22.0, 102.9],
      [21.6, 103.9],
      [20.85, 105.1],
      [20.75, 105.35],
    ],
    note: "Phụ lưu lớn nhất của sông Hồng, tiềm năng thủy điện hàng đầu.",
  },
  {
    name: "Sông Thái Bình",
    coords: [
      [21.8, 106.5],
      [21.1, 106.2],
      [20.75, 106.25],
      [20.6, 106.7],
    ],
    note: "Cùng sông Hồng tạo châu thổ Bắc Bộ.",
  },
  {
    name: "Sông Mã",
    coords: [
      [20.45, 104.2],
      [20.2, 104.9],
      [19.95, 105.6],
      [19.75, 105.85],
    ],
    note: "Chảy qua Thanh Hóa, đổ ra vịnh Bắc Bộ.",
  },
  {
    name: "Sông Cả (Lam)",
    coords: [
      [19.6, 104.0],
      [19.3, 104.8],
      [18.95, 105.5],
      [18.7, 105.7],
    ],
    note: "Chảy qua Nghệ An – Hà Tĩnh, cửa Hội.",
  },
  {
    name: "Sông Gianh",
    coords: [
      [17.95, 106.0],
      [17.85, 106.35],
      [17.7, 106.5],
    ],
    note: "Ranh giới lịch sử Đàng Trong – Đàng Ngoài.",
  },
  {
    name: "Sông Thu Bồn",
    coords: [
      [15.7, 107.7],
      [15.85, 108.05],
      [15.9, 108.3],
    ],
    note: "Chảy qua Quảng Nam, đổ ra cửa Đại.",
  },
  {
    name: "Sông Ba (Đà Rằng)",
    coords: [
      [13.85, 108.25],
      [13.35, 108.7],
      [13.1, 109.25],
    ],
    note: "Sông lớn ở Nam Trung Bộ, đổ ra Tuy Hòa.",
  },
  {
    name: "Sông Đồng Nai",
    coords: [
      [11.85, 108.15],
      [11.4, 107.7],
      [11.0, 107.2],
      [10.75, 106.75],
    ],
    note: "Nguồn thủy điện và nước cho Đông Nam Bộ.",
  },
  {
    name: "Sông Tiền",
    coords: [
      [10.85, 105.3],
      [10.55, 105.6],
      [10.25, 106.0],
      [10.1, 106.35],
      [9.9, 106.5],
    ],
    note: "Một nhánh sông Mê Công ở Việt Nam.",
  },
  {
    name: "Sông Hậu",
    coords: [
      [10.85, 105.25],
      [10.6, 105.35],
      [10.3, 105.7],
      [10.0, 105.95],
      [9.7, 106.15],
    ],
    note: "Nhánh lớn của sông Mê Công, chảy qua Cần Thơ.",
  },
];

// ── Lớp các đỉnh núi đặc trưng ──
const PEAKS: Peak[] = [
  { name: "Phan-xi-păng", coords: [22.303, 103.775], note: "Đỉnh cao nhất Việt Nam (~3.147 m), dãy Hoàng Liên Sơn." },
  { name: "Pu Si Lung", coords: [22.63, 102.79], note: "~3.083 m, Lai Châu, cực tây bắc Tổ quốc." },
  { name: "Ngọc Linh", coords: [15.05, 107.98], note: "~2.598 m, nóc nhà Trường Sơn Nam." },
  { name: "Bạch Mã", coords: [16.19, 107.86], note: "Ranh giới khí hậu giữa Bắc – Trung Bộ." },
  { name: "Mẫu Sơn", coords: [21.85, 106.97], note: "Lạng Sơn, vùng núi Đông Bắc." },
  { name: "Bà Đen", coords: [11.37, 106.17], note: "~986 m, nóc nhà Đông Nam Bộ." },
  { name: "Lang Biang", coords: [12.05, 108.45], note: "Cao nguyên Lâm Viên, Đà Lạt." },
];

// ── Lớp biển đảo: hai quần đảo Hoàng Sa & Trường Sa ──
interface Island {
  name: string;
  coords: [number, number];
  coordLabel: string;
  position: string;
  nature: string;
  economy: string;
  society: string;
  defense: string;
}

const ISLANDS: Island[] = [
  {
    name: "Quần đảo Hoàng Sa",
    coords: [16.65, 112.7],
    coordLabel: "Khoảng 15°45'–17°15' Bắc, 111°–113° Đông",
    position: "Nằm giữa Biển Đông, cách đất liền Việt Nam (Đà Nẵng) khoảng 170–320 km; án ngữ cửa vào vịnh Bắc Bộ và tuyến hàng hải quốc tế qua Biển Đông.",
    nature: "Quần đảo san hô gồm nhiều đảo, cồn cát, bãi ngầm và rạn san hô; khí hậu nhiệt đới gió mùa, nắng nóng quanh năm, lượng mưa lớn theo mùa, thường chịu ảnh hưởng bão.",
    economy: "Ngư trường giàu hải sản (cá ngừ, cá thu, tôm hùm); tiềm năng du lịch biển – sinh thái san hô; vị trí thuận lợi cho phát triển dịch vụ hàng hải và khai thác tài nguyên biển.",
    society: "Là một bộ phận lãnh thổ thiêng liêng của Tổ quốc, gắn với đời sống và truyền thống bám biển của ngư dân Việt Nam; có ý nghĩa lớn về lịch sử, văn hóa và pháp lí chủ quyền.",
    defense: "Có vị trí chiến lược quốc phòng – an ninh quan trọng, là tiền đồn bảo vệ chủ quyền biển đảo và an ninh tuyến hàng hải quốc tế của Việt Nam trên Biển Đông.",
  },
  {
    name: "Quần đảo Trường Sa",
    coords: [8.6, 111.9],
    coordLabel: "Khoảng 6°50'–11°30' Bắc, 111°30'–117°20' Đông",
    position: "Nằm ở phía nam Biển Đông, cách Cam Ranh (Khánh Hòa) khoảng 450 km; là quần đảo rộng lớn, trấn giữ vùng biển phía nam và các tuyến hàng hải quan trọng.",
    nature: "Quần đảo san hô với hàng trăm đảo, đá, bãi ngầm, cồn cát và rạn san hô; khí hậu xích đạo – nhiệt đới hải dương, nhiệt độ cao ổn định, mưa nhiều, thường xuyên có bão.",
    economy: "Ngư trường lớn và đa dạng; tiềm năng dầu khí, khí đốt và tài nguyên biển; thuận lợi cho phát triển nghề cá xa bờ, dịch vụ hậu cần nghề cá và kinh tế biển.",
    society: "Là địa bàn gắn bó với ngư dân Việt Nam qua nhiều thế hệ bám biển; có cộng đồng dân cư, cơ sở hạ tầng dân sự, trường học, trạm y tế và các hoạt động đời sống trên đảo.",
    defense: "Là tuyến phòng thủ tiền tiêu phía nam của Tổ quốc, có ý nghĩa quyết định trong bảo vệ chủ quyền biển, đảo và an ninh quốc phòng trên vùng biển chiến lược Biển Đông.",
  },
];

// ── Lớp các dãy núi / vùng núi đặc trưng (đường định hướng gần đúng) ──
const RANGES: Range[] = [
  { name: "Hoàng Liên Sơn", coords: [[22.95, 103.05], [22.3, 103.8], [21.6, 104.3]], note: "Tây Bắc, hướng tây bắc – đông nam." },
  { name: "Trường Sơn Bắc", coords: [[19.0, 104.6], [17.8, 106.1], [16.1, 107.7]], note: "Chạy dọc biên giới Việt – Lào." },
  { name: "Trường Sơn Nam", coords: [[15.6, 107.8], [14.4, 108.1], [13.2, 108.4], [11.9, 108.5]], note: "Hướng bắc – nam, gắn với Tây Nguyên." },
  { name: "Cánh cung Đông Bắc", coords: [[22.8, 105.2], [22.0, 106.0], [21.3, 106.5]], note: "Sông Gâm – Ngân Sơn – Bắc Sơn – Đông Triều." },
  { name: "Bạch Mã – Hải Vân", coords: [[16.3, 107.6], [16.15, 108.1]], note: "Bức tường ngăn gió mùa, ranh giới khí hậu." },
];

const LAYER_META: { id: LayerId; label: string; short: string }[] = [
  { id: "regions", label: "Vùng kinh tế", short: "Vùng" },
  { id: "rivers", label: "Sông ngòi", short: "Sông" },
  { id: "mountains", label: "Núi & đỉnh núi", short: "Núi" },
  { id: "islands", label: "Biển đảo", short: "Đảo" },
];

export default function MapViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const regionsRef = useRef<L.LayerGroup | null>(null);
  const riversRef = useRef<L.LayerGroup | null>(null);
  const mountainsRef = useRef<L.LayerGroup | null>(null);
  const islandsRef = useRef<L.LayerGroup | null>(null);

  const [layers, setLayers] = useState<Record<LayerId, boolean>>({
    regions: true,
    rivers: true,
    mountains: true,
    islands: true,
  });

  // Khởi tạo bản đồ một lần duy nhất (chỉ chạy client-side)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [16.0, 107.5],
      zoom: 6,
      zoomControl: true,
    });

    // ── Nền địa hình tự nhiên: Esri World Topo Map ──
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 19,
      },
    ).addTo(map);

    const regionsGroup = L.layerGroup().addTo(map);
    const riversGroup = L.layerGroup().addTo(map);
    const mountainsGroup = L.layerGroup().addTo(map);
    const islandsGroup = L.layerGroup().addTo(map);

    // Bao trọn lãnh thổ + hai quần đảo ngoài Biển Đông
    map.fitBounds(
      [
        [8.0, 102.0],
        [23.5, 113.5],
      ],
      { padding: [16, 16] },
    );

    mapRef.current = map;
    regionsRef.current = regionsGroup;
    riversRef.current = riversGroup;
    mountainsRef.current = mountainsGroup;
    islandsRef.current = islandsGroup;

    // ── Lớp sông ngòi chính ──
    RIVERS.forEach((river) => {
      L.polyline(river.coords, {
        color: "#0ea5e9",
        weight: 2,
        opacity: 0.85,
      })
        .bindTooltip(`<strong>${river.name}</strong><br/><span style="font-size:11px">${river.note}</span>`, {
          sticky: true,
        })
        .addTo(riversGroup);
    });

    // ── Lớp núi: đỉnh + dãy núi ──
    PEAKS.forEach((peak) => {
      L.circleMarker(peak.coords, {
        radius: 6,
        color: "#b45309",
        weight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.9,
      })
        .bindPopup(`<strong>${peak.name}</strong><br/><span style="font-size:12px">${peak.note}</span>`)
        .addTo(mountainsGroup);
    });

    RANGES.forEach((range) => {
      L.polyline(range.coords, {
        color: "#7c2d12",
        weight: 2,
        opacity: 0.7,
        dashArray: "6 6",
      })
        .bindTooltip(`<strong>${range.name}</strong><br/><span style="font-size:11px">${range.note}</span>`, {
          sticky: true,
        })
        .addTo(mountainsGroup);
    });

    // ── Lớp biển đảo: hai quần đảo Hoàng Sa & Trường Sa (click mở chú thích) ──
    ISLANDS.forEach((isl) => {
      const html = `
        <div style="min-width:280px;max-width:340px;font-family:inherit;line-height:1.5">
          <h3 style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0f172a">${isl.name}</h3>
          <p style="margin:0 0 4px;font-size:12px;color:#334155"><strong>Toạ độ:</strong> ${isl.coordLabel}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#334155"><strong>Vị trí địa lí:</strong> ${isl.position}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#334155"><strong>Điều kiện tự nhiên:</strong> ${isl.nature}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#334155"><strong>Vai trò kinh tế:</strong> ${isl.economy}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#334155"><strong>Vai trò xã hội:</strong> ${isl.society}</p>
          <p style="margin:0;font-size:12px;color:#334155"><strong>An ninh quốc phòng:</strong> ${isl.defense}</p>
        </div>`;

      L.circleMarker(isl.coords, {
        radius: 7,
        color: "#dc2626",
        weight: 2,
        fillColor: "#ef4444",
        fillOpacity: 0.9,
      })
        .bindPopup(html, { maxWidth: 360, closeButton: true })
        .addTo(islandsGroup);
    });

    // ── Lớp ranh giới 6 vùng kinh tế (tô màu ADM1 theo nhóm vùng) ──
    (async () => {
      try {
        const [regionsRes, geoRes] = await Promise.all([
          fetch("/data/regions.json"),
          fetch("/data/vietnam_adm1.geojson"),
        ]);
        const regions = await regionsRes.json();
        const geo = await geoRes.json();

        const isoColor: Record<string, string> = {};
        const regionInfos: { name: string; shortName: string; color: string; center: [number, number]; areaNote: string }[] = [];
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

        const polyLayer = L.geoJSON(geo, {
          style: (feature) => {
            const iso = feature?.properties?.shapeISO as string;
            const c = isoColor[iso] ?? "#cbd5e1";
            return { color: c, weight: 1.2, fillColor: c, fillOpacity: 0.35 };
          },
        });
        polyLayer.eachLayer((layer) => {
          const iso = (layer as any)?.feature?.properties?.shapeISO;
          const name = (layer as any)?.feature?.properties?.shapeName;
          if (iso) (layer as L.Path).bindTooltip(`${name}`, { sticky: true });
        });
        polyLayer.addTo(regionsGroup);

        regionInfos.forEach((rg) => {
          L.circleMarker(rg.center, {
            radius: 6,
            color: rg.color,
            weight: 3,
            fillColor: "#ffffff",
            fillOpacity: 0.9,
          })
            .bindTooltip(
              `<strong>${rg.name}</strong><br/><span style="font-size:11px">${rg.areaNote}</span>`,
              { sticky: true, direction: "top" },
            )
            .addTo(regionsGroup);
        });
      } catch (err) {
        console.error("[MapViewer] Lỗi nạp dữ liệu vùng kinh tế:", err);
      }
    })();

    return () => {
      map.remove();
      mapRef.current = null;
      regionsRef.current = null;
      riversRef.current = null;
      mountainsRef.current = null;
      islandsRef.current = null;
    };
  }, []);

  // Áp dụng trạng thái bật/tắt các lớp
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const groups: Record<LayerId, L.LayerGroup | null> = {
      regions: regionsRef.current,
      rivers: riversRef.current,
      mountains: mountainsRef.current,
      islands: islandsRef.current,
    };
    (Object.keys(groups) as LayerId[]).forEach((id) => {
      const g = groups[id];
      if (!g) return;
      if (layers[id]) {
        if (!map.hasLayer(g)) g.addTo(map);
      } else {
        if (map.hasLayer(g)) map.removeLayer(g);
      }
    });
  }, [layers]);

  const toggle = (id: LayerId) =>
    setLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="relative h-full w-full min-h-[480px]">
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Thanh công cụ toggle lớp */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] flex gap-1 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-1.5 py-1 shadow-sm">
        {LAYER_META.map((m) => {
          const on = layers[m.id];
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              aria-pressed={on}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                on ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${on ? "bg-white" : "bg-gray-300"}`}
                aria-hidden="true"
              />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Chú giải */}
      <div className="absolute bottom-3 left-3 z-[500] bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl px-3 py-2 text-[11px] text-gray-600 shadow-sm space-y-1 max-w-[220px]">
        <p className="font-semibold text-gray-800">Chú giải</p>
        <p>🟦 Ranh giới &amp; trọng tâm 6 vùng kinh tế</p>
        <p>🟧 Đỉnh núi (chấm) · dãy núi (đứt nét)</p>
        <p>🔵 Mạng lưới sông ngòi chính</p>
        <p>🔴 Biển đảo: Hoàng Sa &amp; Trường Sa</p>
        <p className="text-[10px] text-gray-400">Nền: Esri World Topo Map · Ranh giới ADM1 geoBoundaries (2008, cần rà soát 2025)</p>
      </div>
    </div>
  );
}
