import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { List, Map as MapIcon, MapPin, ChevronRight, ChevronLeft } from "lucide-react";

export default function MapPage() {
  const { lang, isRTL, t } = useLang();
  const [view, setView] = useState<"map" | "list">("map");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const { data: periods } = trpc.periods.list.useQuery();
  const { data: districts } = trpc.districts.list.useQuery();
  const { data: placesData } = trpc.places.list.useQuery({
    limit: 100,
    offset: 0,
    status: "published",
    periodId: periodFilter !== "all" ? parseInt(periodFilter) : undefined,
    districtId: districtFilter !== "all" ? parseInt(districtFilter) : undefined,
  });

  const places = placesData?.items ?? [];
  const placesWithCoords = places.filter(p => p.lat && p.lng);
  const markerKey = placesWithCoords
    .map(place => `${place.id}:${place.slug}:${place.lat}:${place.lng}`)
    .join("|");

  useEffect(() => {
    if (view !== "map" || !mapRef.current) return;

    let map: unknown;
    let cancelled = false;

    async function initMap() {
      try {
        const maplibregl = await import("maplibre-gl");
        if (cancelled || !mapRef.current) return;

        const m = new maplibregl.Map({
          container: mapRef.current,
          style: {
          version: 8 as const,
          sources: {
            osm: {
              type: "raster" as const,
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [{ id: "osm-tiles", type: "raster" as const, source: "osm" }],
        },
          center: [31.2357, 30.0444], // Cairo
          zoom: 13,
        });

        mapInstanceRef.current = m;

        m.on("load", () => {
          if (cancelled) return;
          placesWithCoords.forEach(place => {
            if (!place.lat || !place.lng) return;
            const displayName = lang === "ar" ? place.nameAr : place.nameEn;
            const monumentHref = `/monuments/${place.slug}`;
            const el = document.createElement("div");
            el.className = "map-marker";
            el.tabIndex = 0;
            el.setAttribute("role", "button");
            el.setAttribute("aria-label", `${displayName} — ${t("Open monument", "فتح المعلم")}`);
            el.style.cssText = `
              width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
              background: #C4622D; border: 2px solid white;
              transform: rotate(-45deg); cursor: pointer;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            `;
            const activateMarker = () => {
              window.location.href = monumentHref;
            };
            el.addEventListener("click", activateMarker);
            el.addEventListener("keydown", event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                activateMarker();
              }
            });

            const popupContent = document.createElement("div");
            popupContent.dir = lang === "ar" ? "rtl" : "ltr";
            popupContent.style.cssText = "font-family: system-ui; padding: 4px 0;";

            const name = document.createElement("div");
            name.textContent = displayName;
            name.style.cssText = "font-weight: 600; font-size: 13px; color: #1C1410;";
            popupContent.appendChild(name);

            if (place.foundedYear) {
              const year = document.createElement("div");
              year.textContent = `${place.foundedYear} CE`;
              year.style.cssText = "font-size: 11px; color: #6b6b6b; margin-top: 2px;";
              popupContent.appendChild(year);
            }

            const link = document.createElement("a");
            link.href = monumentHref;
            link.textContent = t("View →", "عرض ←");
            link.style.cssText = "font-size: 11px; color: #C4622D; margin-top: 4px; display: block;";
            popupContent.appendChild(link);

            const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
              .setDOMContent(popupContent);

            new maplibregl.Marker({ element: el })
              .setLngLat([parseFloat(String(place.lng)), parseFloat(String(place.lat))])
              .setPopup(popup)
              .addTo(m);
          });
        });

        map = m;
      } catch (err) {
        console.warn("MapLibre failed to load, falling back to list view", err);
        if (!cancelled) setView("list");
      }
    }

    initMap();
    return () => {
      cancelled = true;
      if (map && typeof (map as { remove?: () => void }).remove === "function") {
        (map as { remove: () => void }).remove();
      }
    };
  }, [view, markerKey, lang]);

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[var(--color-stone-900)] py-10">
        <div className="container">
          <div className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${isRTL ? "sm:flex-row-reverse" : ""}`}>
            <div>
              <h1 className={`text-3xl font-bold text-[var(--color-parchment-100)] mb-1 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                {t("Interactive Map", "الخريطة التفاعلية")}
              </h1>
              <p className={`text-[var(--color-stone-400)] text-sm ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                {t(`${placesWithCoords.length} mapped monuments`, `${placesWithCoords.length} معلم على الخريطة`)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("map")}
                className={view === "map" ? "bg-[var(--color-terracotta-600)]" : "border-[var(--color-stone-600)] text-[var(--color-stone-300)]"}
              >
                <MapIcon size={14} className="mr-1" />
                {t("Map", "خريطة")}
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
                className={view === "list" ? "bg-[var(--color-terracotta-600)]" : "border-[var(--color-stone-600)] text-[var(--color-stone-300)]"}
              >
                <List size={14} className="mr-1" />
                {t("List", "قائمة")}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger aria-label={t("Filter by period", "التصفية حسب الحقبة")} className="w-44 bg-[var(--color-stone-800)] border-[var(--color-stone-700)] text-[var(--color-stone-200)]">
                <SelectValue placeholder={t("All Periods", "جميع الحقب")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Periods", "جميع الحقب")}</SelectItem>
                {periods?.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{lang === "ar" ? p.nameAr : p.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger aria-label={t("Filter by district", "التصفية حسب الحي")} className="w-44 bg-[var(--color-stone-800)] border-[var(--color-stone-700)] text-[var(--color-stone-200)]">
                <SelectValue placeholder={t("All Districts", "جميع الأحياء")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All Districts", "جميع الأحياء")}</SelectItem>
                {districts?.map(d => (
                  <SelectItem key={d.id} value={String(d.id)}>{lang === "ar" ? d.nameAr : d.nameEn}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Map / List */}
      {view === "map" ? (
        <div className="relative h-[min(70vh,640px)] min-h-[360px]">
          <div ref={mapRef} className="w-full h-full" />
          {/* Map attribution */}
          <div className="absolute bottom-2 right-2 text-xs text-[var(--color-stone-500)] bg-white/80 px-2 py-1 rounded">
            © OpenStreetMap contributors
          </div>
        </div>
      ) : (
        <div className="container py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map(place => (
              <Link key={place.id} href={`/monuments/${place.slug}`}>
                <div className="monument-card p-4 cursor-pointer group">
                  <div className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <MapPin size={16} className="text-[var(--color-terracotta-600)] mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-[var(--color-stone-900)] leading-snug ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
                        {lang === "ar" ? place.nameAr : place.nameEn}
                      </h3>
                      {place.foundedYear && (
                        <p className="text-xs text-[var(--color-stone-400)] mt-0.5">{place.foundedYear} CE</p>
                      )}
                    </div>
                    {isRTL ? <ChevronLeft size={14} className="text-[var(--color-stone-400)] shrink-0 mt-0.5" /> : <ChevronRight size={14} className="text-[var(--color-stone-400)] shrink-0 mt-0.5" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
