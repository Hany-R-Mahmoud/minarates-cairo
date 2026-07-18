import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Calendar, ChevronRight } from "lucide-react";

const ERA_CLASS: Record<string, string> = {
  tulunid: "era-tulunid", fatimid: "era-fatimid", ayyubid: "era-ayyubid",
  mamluk: "era-mamluk", "bahri-mamluk": "era-mamluk", "burji-mamluk": "era-mamluk",
  ottoman: "era-ottoman", "early-ottoman": "era-ottoman", "late-ottoman": "era-ottoman",
  "muhammad-ali": "era-modern", modern: "era-modern",
};

export default function Monuments() {
  const { lang, isRTL, t } = useLang();
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: periods } = trpc.periods.list.useQuery();
  const { data: districts } = trpc.districts.list.useQuery();
  const { data: placeTypes } = trpc.placeTypes.list.useQuery();
  const { data: placesData, isLoading } = trpc.places.list.useQuery({
    limit: 100,
    offset: 0,
    status: "published",
    periodId: periodFilter !== "all" ? parseInt(periodFilter) : undefined,
    districtId: districtFilter !== "all" ? parseInt(districtFilter) : undefined,
    placeTypeId: typeFilter !== "all" ? parseInt(typeFilter) : undefined,
    search: search || undefined,
  });

  const places = placesData?.items ?? [];

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[var(--color-stone-900)] py-16">
        <div className="container">
          <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("Monuments of Islamic Cairo", "معالم القاهرة الإسلامية")}
          </h1>
          <p className={`text-[var(--color-stone-400)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("48+ published places across a thousand years", "٤٨+ موقعاً منشوراً عبر ألف عام")}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--color-stone-400)] ${isRTL ? "right-3" : "left-3"}`} />
            <Input
              placeholder={t("Search monuments...", "ابحث عن معالم...")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${isRTL ? "pr-9 text-right font-[var(--font-arabic-sans)]" : "pl-9"} bg-white border-[var(--color-border)]`}
            />
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-44 bg-white border-[var(--color-border)]">
              <SelectValue placeholder={t("All Periods", "جميع الحقب")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Periods", "جميع الحقب")}</SelectItem>
              {periods?.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {lang === "ar" ? p.nameAr : p.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger className="w-44 bg-white border-[var(--color-border)]">
              <SelectValue placeholder={t("All Districts", "جميع الأحياء")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Districts", "جميع الأحياء")}</SelectItem>
              {districts?.map(d => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {lang === "ar" ? d.nameAr : d.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 bg-white border-[var(--color-border)]">
              <SelectValue placeholder={t("All Types", "جميع الأنواع")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Types", "جميع الأنواع")}</SelectItem>
              {placeTypes?.map(pt => (
                <SelectItem key={pt.id} value={String(pt.id)}>
                  {lang === "ar" ? pt.nameAr : pt.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Count */}
        <div className={`text-sm text-[var(--color-stone-500)] mb-6 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
          {isLoading ? t("Loading...", "جارٍ التحميل...") : t(`${places.length} monuments`, `${places.length} معلم`)}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {places.map(place => (
              <Link key={place.id} href={`/monuments/${place.slug}`}>
                <div className="monument-card cursor-pointer group h-full flex flex-col">
                  {/* Image area */}
                  <div className="h-40 bg-[var(--color-stone-800)] geometric-pattern relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[var(--color-gold-400)]/40 text-4xl font-[var(--font-arabic)]">م</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-stone-900)]/50 to-transparent" />
                    {place.activeWorship && (
                      <div className="absolute top-2 right-2 bg-[var(--color-teal-600)] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {t("Active Worship", "عبادة نشطة")}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className={`font-semibold text-[var(--color-stone-900)] mb-1 leading-snug line-clamp-2 ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
                      {lang === "ar" ? place.nameAr : place.nameEn}
                    </h3>
                    {lang === "en" && place.nameAr && (
                      <p className="text-xs text-[var(--color-stone-400)] font-[var(--font-arabic)] mb-2 text-right">{place.nameAr}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                      {place.foundedYear && (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-stone-500)]">
                          <Calendar size={10} />
                          {place.foundedYear}
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 mt-3 text-[var(--color-terracotta-600)] text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>{t("View", "عرض")}</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && places.length === 0 && (
          <div className="text-center py-20 text-[var(--color-stone-400)]">
            <p className={`text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              {t("No monuments found matching your filters.", "لم يتم العثور على معالم تطابق عوامل التصفية.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
