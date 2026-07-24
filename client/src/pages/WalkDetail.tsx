import { useParams, Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Clock, MapPin, AlertTriangle, Accessibility, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readResearchStops } from "@/lib/research";

const DIFFICULTY_LABELS: Record<string, { en: string; ar: string }> = {
  easy: { en: "Easy", ar: "سهل" },
  moderate: { en: "Moderate", ar: "متوسط" },
  challenging: { en: "Challenging", ar: "صعب" },
};

export default function WalkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL, t } = useLang();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const { data: walk, isLoading, isError, refetch } = trpc.walks.bySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });
  const { data: researchCoverage } = trpc.places.researchCoverage.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container py-12 space-y-4">
          <div className="skeleton h-8 w-32 rounded" />
          <div className="skeleton h-12 w-3/4 rounded" />
          <div className="skeleton h-48 rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-stone-500)] mb-4">{t("This walk could not be loaded.", "تعذر تحميل هذه الجولة.")}</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>{t("Try again", "حاول مرة أخرى")}</Button>
            <Link href="/walks"><Button variant="outline">{t("Back to Walks", "العودة إلى الجولات")}</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  if (!walk) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-stone-500)] mb-4">{t("Walk not found.", "لم يتم العثور على الجولة.")}</p>
          <Link href="/walks"><Button variant="outline">{t("Back to Walks", "العودة إلى الجولات")}</Button></Link>
        </div>
      </div>
    );
  }

  const name = lang === "ar" ? walk.nameAr : walk.nameEn;
  const description = lang === "ar" ? walk.descriptionAr : walk.descriptionEn;
  const accessibilityNotes = lang === "ar" ? walk.accessibilityNotesAr : walk.accessibilityNotesEn;
  const staleNote = lang === "ar" ? walk.staleInfoNoteAr : walk.staleInfoNoteEn;
  const stops = readResearchStops(walk.stops);
  const coverageBySlug = new Map((researchCoverage ?? []).map(item => [item.placeSlug, item]));
  const researchedStops = stops
    .map(stop => stop.placeSlug ? coverageBySlug.get(stop.placeSlug) : undefined)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const evidenceCount = researchedStops.reduce((total, item) => total + item.claimCount, 0);
  const featureCount = researchedStops.reduce((total, item) => total + item.featureCount, 0);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return t(`${minutes} min`, `${minutes} دقيقة`);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? t(`${h}h ${m}m`, `${h}س ${m}د`) : t(`${h} hours`, `${h} ساعات`);
  };

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-[var(--color-stone-900)] py-12">
        <div className="container">
          <Link href="/walks">
            <span className={`flex items-center gap-2 text-[var(--color-stone-400)] hover:text-[var(--color-stone-200)] text-sm mb-6 cursor-pointer transition-colors w-fit ${isRTL ? "flex-row-reverse" : ""}`}>
              <BackIcon size={14} />
              {t("Back to Walks", "العودة إلى الجولات")}
            </span>
          </Link>
          <div className={`flex flex-col sm:flex-row gap-4 items-start justify-between ${isRTL ? "sm:flex-row-reverse" : ""}`}>
            <div>
              <h1 className={`text-4xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                {name}
              </h1>
              <div className={`flex flex-wrap gap-4 text-sm text-[var(--color-stone-400)] ${isRTL ? "flex-row-reverse" : ""}`}>
                {walk.durationMinutes && (
                  <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Clock size={13} />
                    {formatDuration(walk.durationMinutes)}
                  </span>
                )}
                {walk.distanceMeters && (
                  <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <MapPin size={13} />
                    {walk.distanceMeters < 1000 ? `${walk.distanceMeters}m` : `${(walk.distanceMeters / 1000).toFixed(1)}km`}
                  </span>
                )}
                {walk.difficulty && (
                  <span className="capitalize">{lang === "ar" ? DIFFICULTY_LABELS[walk.difficulty]?.ar : DIFFICULTY_LABELS[walk.difficulty]?.en}</span>
                )}
              </div>
            </div>
            {walk.offlineSizeKb && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-stone-400)]" role="status">
                <Download size={14} />
                {t("Offline pack planned", "حزمة الاستخدام دون اتصال مخططة")}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stale info warning */}
            {walk.hasStaleInfo && (
              <div className="stale-warning">
                <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <p className={`text-sm ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                    {staleNote ?? t("Some information on this walk may be outdated. Verify before visiting.", "بعض المعلومات في هذه الجولة قد تكون قديمة. تحقق قبل الزيارة.")}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div>
                <h2 className={`text-xl font-semibold text-[var(--color-stone-900)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                  {t("About This Walk", "عن هذه الجولة")}
                </h2>
                <p className={`text-[var(--color-stone-700)] leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
                  {description}
                </p>
              </div>
            )}

            {/* Stops */}
            {stops.length > 0 && (
              <div>
                <h2 className={`text-xl font-semibold text-[var(--color-stone-900)] mb-4 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                  {t(`${stops.length} Stops`, `${stops.length} محطة`)}
                </h2>
                <div className="space-y-3">
                  {stops.map((stop, i) => {
                    const research = stop.placeSlug ? coverageBySlug.get(stop.placeSlug) : undefined;
                    return (
                    <div key={`${stop.placeSlug ?? stop.placeId ?? "stop"}-${i}`} className={`flex items-start gap-3 p-4 bg-[var(--color-parchment-100)] rounded-lg border border-[var(--color-border)] ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="w-7 h-7 rounded-full bg-[var(--color-terracotta-600)] text-white text-xs flex items-center justify-center shrink-0 font-semibold">
                        {stop.order ?? stop.orderIndex ?? i + 1}
                      </div>
                      <div className="flex-1">
                        {stop.placeSlug ? (
                          <Link href={`/monuments/${stop.placeSlug}`}>
                            <span className={`text-sm font-medium text-[var(--color-terracotta-600)] hover:underline cursor-pointer ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                              {stop.placeSlug.replaceAll("-", " ")}
                            </span>
                          </Link>
                        ) : (
                          <div className={`text-sm font-medium text-[var(--color-stone-700)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                            {t(`Stop ${i + 1}`, `المحطة ${i + 1}`)}
                          </div>
                        )}
                        {stop.activeWorship && (
                          <span className="ml-2 text-xs text-[var(--color-teal-600)]">{t("Active worship", "عبادة نشطة")}</span>
                        )}
                        {(lang === "ar" ? stop.noteAr : stop.noteEn) && (
                          <p className={`text-xs text-[var(--color-stone-500)] mt-1 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                            {lang === "ar" ? stop.noteAr : stop.noteEn}
                          </p>
                        )}
                        {research && (
                          <p className="text-[10px] text-[var(--color-teal-600)] mt-2">
                            {t(`${research.claimCount} evidence · ${research.featureCount} features`, `${research.claimCount} دليل · ${research.featureCount} عناصر`)}
                          </p>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {researchedStops.length > 0 && (
              <div className="notebook-card">
                <h3 className={`font-semibold text-[var(--color-stone-900)] text-sm mb-2 ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
                  {t("Research across this walk", "البحث المرتبط بهذه الجولة")}
                </h3>
                <p className={`text-sm text-[var(--color-stone-600)] leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                  {t(`${researchedStops.length} stops connect to ${evidenceCount} accepted evidence records and ${featureCount} architectural features.`, `${researchedStops.length} محطة ترتبط بـ ${evidenceCount} سجل أدلة مقبول و${featureCount} عنصراً معمارياً.`)}
                </p>
                <Link href="/architecture" className={`inline-flex mt-3 text-xs text-[var(--color-terracotta-600)] hover:underline ${isRTL ? "flex-row-reverse" : ""}`}>
                  {t("Open architecture atlas", "افتح أطلس العمارة")}
                </Link>
              </div>
            )}
            {/* Accessibility */}
            {accessibilityNotes && (
              <div className="notebook-card">
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Accessibility size={14} className="text-[var(--color-teal-600)]" />
                  <h3 className={`font-semibold text-[var(--color-stone-900)] text-sm ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>
                    {t("Accessibility", "إمكانية الوصول")}
                  </h3>
                </div>
                <p className={`text-sm text-[var(--color-stone-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                  {accessibilityNotes}
                </p>
                {walk.stairsAndSurfaces && (
                  <p className={`text-xs text-[var(--color-stone-400)] mt-2 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                    {walk.stairsAndSurfaces}
                  </p>
                )}
              </div>
            )}

            {/* Funerary notice */}
            {walk.requiresFuneraryApproval && (
              <div className="sacred-notice">
                <p className={`text-sm text-[var(--color-teal-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                  {t("This walk passes through active funerary areas. Please observe appropriate etiquette.", "تمر هذه الجولة عبر مناطق جنائزية نشطة. يُرجى مراعاة الآداب المناسبة.")}
                </p>
              </div>
            )}

            {/* Offline size */}
            {walk.offlineSizeKb && (
              <div className="notebook-card">
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Download size={14} className="text-[var(--color-stone-500)]" />
                  <span className={`text-sm text-[var(--color-stone-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                    {t(`Offline pack: ~${Math.round(walk.offlineSizeKb / 1024)} MB`, `حجم الحزمة دون اتصال: ~${Math.round(walk.offlineSizeKb / 1024)} ميغابايت`)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
