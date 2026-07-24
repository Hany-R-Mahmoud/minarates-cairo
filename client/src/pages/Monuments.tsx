import { useState } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, ChevronRight, ImageOff } from "lucide-react";
import { buildImageKitSrcSet, buildImageKitUrl, isImageKitUrl } from "@shared/media";
import type { Place } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import PageIntro from "@/components/PageIntro";

export default function Monuments() {
  const { lang, isRTL, t } = useLang();
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: periods } = trpc.periods.list.useQuery();
  const { data: districts } = trpc.districts.list.useQuery();
  const { data: placeTypes } = trpc.placeTypes.list.useQuery();
  const { data: researchCoverage } = trpc.places.researchCoverage.useQuery();
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
  const coverageBySlug = new Map((researchCoverage ?? []).map(item => [item.placeSlug, item]));
  const researchedPlaceCount = researchCoverage?.filter(item => item.claimCount > 0 || item.featureCount > 0).length ?? 0;
  const getPlaceImageAlt = (place: Place) =>
    lang === "ar" ? (place.coverImageAltAr ?? place.coverImageAlt) : place.coverImageAlt;
  const hasVerifiedPlaceImage = (place: Place) => Boolean(
    place.coverImageUrl &&
    isImageKitUrl(place.coverImageUrl) &&
    getPlaceImageAlt(place) &&
    place.coverImageAttribution &&
    place.coverImageLicense,
  );

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <PageIntro
        variant="explore"
        title={t("Monuments of Islamic Cairo", "معالم القاهرة الإسلامية")}
        description={placesData
          ? t(`${placesData.total} published places across a thousand years · ${researchedPlaceCount} with research records`, `${placesData.total} موقعاً منشوراً عبر ألف عام · ${researchedPlaceCount} بسجلات بحثية`)
          : t("Published places across a thousand years", "معالم منشورة عبر ألف عام")}
      />

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-[var(--color-stone-400)] ${isRTL ? "right-3" : "left-3"}`} />
            <label htmlFor="monuments-search" className="sr-only">
              {t("Search monuments", "البحث عن المعالم")}
            </label>
            <Input
              id="monuments-search"
              aria-label={t("Search monuments", "البحث عن المعالم")}
              placeholder={t("Search monuments...", "ابحث عن معالم...")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`${isRTL ? "pr-9 text-right font-[var(--font-arabic-sans)]" : "pl-9"} bg-white border-[var(--color-border)]`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="monuments-period" className="text-xs font-medium text-[var(--color-stone-600)]">
              {t("Period", "الحقبة")}
            </label>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger id="monuments-period" className="w-44 bg-white border-[var(--color-border)]">
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
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="monuments-district" className="text-xs font-medium text-[var(--color-stone-600)]">
              {t("District", "الحي")}
            </label>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
            <SelectTrigger id="monuments-district" className="w-44 bg-white border-[var(--color-border)]">
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
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="monuments-type" className="text-xs font-medium text-[var(--color-stone-600)]">
              {t("Type", "النوع")}
            </label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="monuments-type" className="w-44 bg-white border-[var(--color-border)]">
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
                  {(() => {
                    const research = coverageBySlug.get(place.slug);
                    return (
                      <>
                  {/* Use only media with complete provenance and descriptive text. */}
                  <div className="h-40 bg-[var(--color-stone-800)] relative overflow-hidden shrink-0">
                    {hasVerifiedPlaceImage(place) ? (
                      <img
                        src={buildImageKitUrl(place.coverImageUrl!, 800)}
                        srcSet={buildImageKitSrcSet(place.coverImageUrl!)}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        alt={getPlaceImageAlt(place)!}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-stone-400)]">
                        <ImageOff size={22} aria-hidden="true" />
                        <span className="text-xs">{t("Image not yet verified", "الصورة لم تُتحقق بعد")}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-stone-900)]/50 to-transparent pointer-events-none" />
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
                    {research && research.claimCount > 0 && (
                      <div className={`mt-3 border-t border-[var(--color-border)] pt-3 ${lang === "ar" ? "text-right" : ""}`}>
                        <div className={`flex flex-wrap gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Badge variant="secondary" className="text-[10px]">
                            {t(`${research.claimCount} evidence records`, `${research.claimCount} سجل أدلة`)}
                          </Badge>
                          {research.featureCount > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {t(`${research.featureCount} features`, `${research.featureCount} عناصر`)}
                            </Badge>
                          )}
                        </div>
                        {research.highlights[0] && (
                          <p className={`mt-2 text-xs text-[var(--color-stone-600)] line-clamp-2 leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                            {lang === "ar" ? research.highlights[0].ar ?? research.highlights[0].en : research.highlights[0].en}
                          </p>
                        )}
                      </div>
                    )}
                    <div className={`flex items-center gap-1 mt-3 text-[var(--color-terracotta-600)] text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>{t("View", "عرض")}</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                      </>
                    );
                  })()}
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
