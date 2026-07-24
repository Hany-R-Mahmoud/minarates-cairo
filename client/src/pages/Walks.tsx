import { useState } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Clock, MapPin, ChevronRight, AlertTriangle, Accessibility, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PageIntro from "@/components/PageIntro";
import { readResearchStops } from "@/lib/research";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  challenging: "bg-red-100 text-red-700 border-red-200",
};

const DIFFICULTY_LABELS: Record<string, { en: string; ar: string }> = {
  easy: { en: "Easy", ar: "سهل" },
  moderate: { en: "Moderate", ar: "متوسط" },
  challenging: { en: "Challenging", ar: "صعب" },
};

export default function Walks() {
  const { lang, isRTL, t } = useLang();
  const { data: walks, isLoading } = trpc.walks.list.useQuery({ status: "published" });
  const { data: researchCoverage } = trpc.places.researchCoverage.useQuery();
  const coverageBySlug = new Map((researchCoverage ?? []).map(item => [item.placeSlug, item]));

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return t(`${minutes} min`, `${minutes} دقيقة`);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? t(`${h}h ${m}m`, `${h}س ${m}د`) : t(`${h} hours`, `${h} ساعات`);
  };

  const formatDistance = (meters: number | null) => {
    if (!meters) return null;
    if (meters < 1000) return t(`${meters}m`, `${meters}م`);
    return t(`${(meters / 1000).toFixed(1)}km`, `${(meters / 1000).toFixed(1)}كم`);
  };

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <PageIntro
        variant="explore"
        title={t("District Walks", "جولات الأحياء")}
        description={t("18 curated walking routes through Islamic Cairo", "١٨ مسار مشي منتقى عبر القاهرة الإسلامية")}
      />

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(walks ?? []).map(walk => {
              const stopResearch = readResearchStops(walk.stops)
                .map(stop => stop.placeSlug ? coverageBySlug.get(stop.placeSlug) : undefined)
                .filter((item): item is NonNullable<typeof item> => Boolean(item));
              const evidenceCount = stopResearch.reduce((total, item) => total + item.claimCount, 0);
              const featureCount = stopResearch.reduce((total, item) => total + item.featureCount, 0);
              return (
              <Link key={walk.id} href={`/walks/${walk.slug}`}>
                <div className="monument-card cursor-pointer group h-full flex flex-col">
                  {/* Top accent */}
                  <div className="h-2 bg-gradient-to-r from-[var(--color-terracotta-600)] to-[var(--color-gold-400)]" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className={`flex items-start justify-between gap-2 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <h3 className={`font-semibold text-[var(--color-stone-900)] leading-snug flex-1 ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
                        {lang === "ar" ? walk.nameAr : walk.nameEn}
                      </h3>
                      {walk.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${DIFFICULTY_COLORS[walk.difficulty] ?? ""}`}>
                          {lang === "ar" ? DIFFICULTY_LABELS[walk.difficulty]?.ar : DIFFICULTY_LABELS[walk.difficulty]?.en}
                        </span>
                      )}
                    </div>

                    {(lang === "ar" ? walk.descriptionAr : walk.descriptionEn) && (
                      <p className={`text-sm text-[var(--color-stone-500)] mb-4 line-clamp-2 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                        {lang === "ar" ? walk.descriptionAr : walk.descriptionEn}
                      </p>
                    )}

                    <div className={`flex flex-wrap gap-3 mt-auto text-xs text-[var(--color-stone-500)] ${isRTL ? "flex-row-reverse" : ""}`}>
                      {walk.durationMinutes && (
                        <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Clock size={11} />
                          {formatDuration(walk.durationMinutes)}
                        </span>
                      )}
                      {walk.distanceMeters && (
                        <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <MapPin size={11} />
                          {formatDistance(walk.distanceMeters)}
                        </span>
                      )}
                      {walk.accessibilityNotesEn && (
                        <span className={`flex items-center gap-1 text-[var(--color-teal-600)] ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Accessibility size={11} />
                          {t("Accessible", "متاح")}
                        </span>
                      )}
                    </div>

                    {walk.hasStaleInfo && (
                      <div className={`flex items-center gap-1 mt-3 text-xs text-amber-600 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <AlertTriangle size={10} />
                        <span className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>{t("Some info may be outdated", "بعض المعلومات قد تكون قديمة")}</span>
                      </div>
                    )}

                    {stopResearch.length > 0 && (
                      <div className={`mt-3 text-[10px] text-[var(--color-teal-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                        {t(`${stopResearch.length} researched stops · ${evidenceCount} evidence · ${featureCount} features`, `${stopResearch.length} محطة موثقة · ${evidenceCount} دليل · ${featureCount} عناصر`)}
                      </div>
                    )}

                    <div className={`flex items-center gap-1 mt-3 text-[var(--color-terracotta-600)] text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>{t("View Walk", "عرض الجولة")}</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        )}

        {!isLoading && (walks ?? []).length === 0 && (
          <div className="text-center py-20 text-[var(--color-stone-400)]">
            <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
              {t("No walks available yet.", "لا توجد جولات متاحة بعد.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
