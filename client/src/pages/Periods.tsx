import { useState } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ChevronRight, ChevronDown } from "lucide-react";

export default function Periods() {
  const { lang, isRTL, t } = useLang();
  const [expanded, setExpanded] = useState<number | null>(null);
  const { data: periods, isLoading } = trpc.periods.list.useQuery();
  const { data: placesData } = trpc.places.list.useQuery({ limit: 100, offset: 0, status: "published" });
  const places = placesData?.items ?? [];

  const getPlacesForPeriod = (periodId: number) =>
    places.filter(p => p.periodId === periodId).slice(0, 6);

  const ERA_GRADIENT: Record<string, string> = {
    tulunid: "from-[#8B4513] to-[#A0522D]",
    fatimid: "from-[#2D6E6E] to-[#3D8E8E]",
    ayyubid: "from-[#4A5568] to-[#5A6578]",
    mamluk: "from-[#C4622D] to-[#D4722D]",
    "bahri-mamluk": "from-[#B8540A] to-[#C8640A]",
    "burji-mamluk": "from-[#9B2335] to-[#AB3345]",
    ottoman: "from-[#1A365D] to-[#2A466D]",
    "early-ottoman": "from-[#1A3A5C] to-[#2A4A6C]",
    "late-ottoman": "from-[#2D3748] to-[#3D4758]",
    "muhammad-ali": "from-[#553C9A] to-[#654CAA]",
    modern: "from-[#2F855A] to-[#3F956A]",
  };

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[var(--color-stone-900)] py-16">
        <div className="container">
          <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("Historical Periods", "الحقب التاريخية")}
          </h1>
          <p className={`text-[var(--color-stone-400)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("11 overlapping eras from Rashidun to Modern Conservation", "١١ حقبة متداخلة من الراشدين إلى الحفاظ الحديث")}
          </p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {(periods ?? []).map(period => {
              const isOpen = expanded === period.id;
              const periodPlaces = getPlacesForPeriod(period.id);
              const gradient = ERA_GRADIENT[period.slug] ?? "from-[var(--color-stone-700)] to-[var(--color-stone-600)]";

              return (
                <div key={period.id} className="monument-card overflow-hidden">
                  {/* Period header */}
                  <button
                    id={`period-${period.id}-trigger`}
                    aria-expanded={isOpen}
                    aria-controls={`period-${period.id}-content`}
                    className={`w-full text-left p-5 flex items-center gap-4 hover:bg-[var(--color-parchment-200)]/50 transition-colors ${isRTL ? "flex-row-reverse text-right" : ""}`}
                    onClick={() => setExpanded(isOpen ? null : period.id)}
                  >
                    {/* Color bar */}
                    <div className={`w-1.5 h-12 rounded-full bg-gradient-to-b ${gradient} shrink-0`} />

                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <h3 className={`text-lg font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                          {lang === "ar" ? period.nameAr : period.nameEn}
                        </h3>
                        {period.startYear && (
                          <span className="text-sm text-[var(--color-stone-400)] font-mono">
                            {period.startYear}–{period.endYear ?? "present"}
                          </span>
                        )}
                      </div>
                      {(lang === "ar" ? period.descriptionAr : period.descriptionEn) && (
                        <p className={`text-sm text-[var(--color-stone-500)] mt-1 line-clamp-1 ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                          {lang === "ar" ? period.descriptionAr : period.descriptionEn}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[var(--color-stone-400)]">
                        {periodPlaces.length > 0 ? t(`${periodPlaces.length}+ monuments`, `${periodPlaces.length}+ معلم`) : ""}
                      </span>
                      {isOpen ? <ChevronDown size={16} className="text-[var(--color-stone-400)]" /> : <ChevronRight size={16} className="text-[var(--color-stone-400)]" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div id={`period-${period.id}-content`} role="region" aria-labelledby={`period-${period.id}-trigger`} className="border-t border-[var(--color-border)] px-5 pb-5 pt-4">
                      {(lang === "ar" ? period.descriptionAr : period.descriptionEn) && (
                        <p className={`text-sm text-[var(--color-stone-600)] mb-4 leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
                          {lang === "ar" ? period.descriptionAr : period.descriptionEn}
                        </p>
                      )}

                      {periodPlaces.length > 0 && (
                        <div>
                          <h4 className={`text-xs font-semibold text-[var(--color-stone-400)] uppercase tracking-wide mb-3 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                            {t("Representative Monuments", "معالم تمثيلية")}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {periodPlaces.map(place => (
                              <Link key={place.id} href={`/monuments/${place.slug}`}>
                                <div className={`p-2.5 bg-[var(--color-parchment-100)] rounded border border-[var(--color-border)] hover:border-[var(--color-terracotta-600)] transition-colors cursor-pointer ${isRTL ? "text-right" : ""}`}>
                                  <p className={`text-xs font-medium text-[var(--color-stone-800)] line-clamp-2 ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                                    {lang === "ar" ? place.nameAr : place.nameEn}
                                  </p>
                                  {place.foundedYear && (
                                    <p className="text-xs text-[var(--color-stone-400)] mt-0.5">{place.foundedYear}</p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                          <Link href={`/monuments?period=${period.id}`}>
                            <span className={`text-xs text-[var(--color-terracotta-600)] hover:underline mt-3 inline-flex items-center gap-1 cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}>
                              {t("View all monuments from this period →", "عرض جميع معالم هذه الحقبة ←")}
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
