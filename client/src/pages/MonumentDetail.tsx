import { useParams, Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, MapPin, Calendar, User, Building, BookOpen, AlertTriangle, Heart, CheckCircle, Camera } from "lucide-react";
import { buildImageKitSrcSet, buildImageKitUrl } from "@shared/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function MonumentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL, t } = useLang();
  const { isAuthenticated } = useAuth();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

    const { data: meta, isLoading, error } = trpc.places.withMeta.useQuery({ slug: slug ?? "" }, { enabled: !!slug });
  const place = meta?.place;
  const toggleFav = trpc.notebook.toggleFavorite.useMutation({
    onSuccess: (res) => {
      toast.success(res.favorited
        ? t("Added to favorites", "أُضيف إلى المفضلة")
        : t("Removed from favorites", "أُزيل من المفضلة")
      );
    },
  });

  const markVisited = trpc.notebook.markVisited.useMutation({
    onSuccess: () => toast.success(t("Marked as visited!", "تم التحديد كزيارة!")),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container py-12">
          <div className="skeleton h-8 w-32 mb-8 rounded" />
          <div className="skeleton h-12 w-3/4 mb-4 rounded" />
          <div className="skeleton h-6 w-1/2 mb-8 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded" />)}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-stone-500)] mb-4">{t("Monument not found.", "لم يتم العثور على المعلم.")}</p>
          <Link href="/monuments"><Button variant="outline">{t("Back to Monuments", "العودة إلى المعالم")}</Button></Link>
        </div>
      </div>
    );
  }

  const name = lang === "ar" ? place!.nameAr : place!.nameEn;
  const nameAlt = lang === "ar" ? place!.nameEn : place!.nameAr;
  const brief = lang === "ar" ? place!.briefAr : place!.briefEn;
  const clarification = lang === "ar" ? place!.clarificationAr : place!.clarificationEn;
  const originalFunction = lang === "ar" ? place!.originalFunctionAr : place!.originalFunctionEn;
  const currentFunction = lang === "ar" ? place!.currentFunctionAr : place!.currentFunctionEn;
  const patron = lang === "ar" ? place!.patronAr : place!.patronEn;
  const openingHours = lang === "ar" ? place!.openingHoursAr : place!.openingHoursEn;

  const keyDates = (place!.keyDates as Array<{ year: number; labelEn: string; labelAr: string }> | null) ?? [];
  const phases = (place!.architecturalPhases as Array<{ nameEn: string; nameAr: string; startYear?: number; endYear?: number; descEn?: string; descAr?: string }> | null) ?? [];
  const media = (meta?.media ?? []).slice(0, 8);

  const isStale = place!.practicalInfoFreshness
    ? (Date.now() - new Date(place!.practicalInfoFreshness).getTime()) > 365 * 24 * 60 * 60 * 1000
    : true;

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-[var(--color-stone-900)] py-12">
        <div className="container">
          <Link href="/monuments">
            <span className={`flex items-center gap-2 text-[var(--color-stone-400)] hover:text-[var(--color-stone-200)] text-sm mb-6 cursor-pointer transition-colors w-fit ${isRTL ? "flex-row-reverse" : ""}`}>
              <BackIcon size={14} />
              {t("Back to Monuments", "العودة إلى المعالم")}
            </span>
          </Link>

          <div className={`flex flex-col lg:flex-row gap-6 items-start justify-between ${isRTL ? "lg:flex-row-reverse" : ""}`}>
            <div className="flex-1">
              <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-2 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                {name}
              </h1>
              {nameAlt && (
                <p className={`text-xl text-[var(--color-stone-400)] mb-4 ${lang === "en" ? "font-[var(--font-arabic)]" : ""}`}>
                  {nameAlt}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {place!.activeWorship && (
                  <span className="period-badge bg-[var(--color-teal-600)]/20 text-[var(--color-teal-400)] border border-[var(--color-teal-600)]/30">
                    {t("Active Worship", "عبادة نشطة")}
                  </span>
                )}
                {place!.ticketed && (
                  <span className="period-badge bg-[var(--color-gold-400)]/20 text-[var(--color-gold-400)] border border-[var(--color-gold-400)]/30">
                    {t("Ticketed Entry", "دخول بتذكرة")}
                  </span>
                )}
                {place!.photographyAllowed === "no" && (
                  <span className="period-badge bg-red-500/20 text-red-400 border border-red-500/30">
                    {t("No Photography", "لا تصوير")}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--color-stone-600)] text-[var(--color-stone-300)] hover:bg-[var(--color-stone-800)]"
                onClick={() => {
                  if (!isAuthenticated) { startLogin(); return; }
                  toggleFav.mutate({ placeId: place.id });
                }}
              >
                <Heart size={14} className="mr-1" />
                {t("Favorite", "مفضلة")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--color-stone-600)] text-[var(--color-stone-300)] hover:bg-[var(--color-stone-800)]"
                onClick={() => {
                  if (!isAuthenticated) { startLogin(); return; }
                  markVisited.mutate({ placeId: place.id });
                }}
              >
                <CheckCircle size={14} className="mr-1" />
                {t("Visited", "زرت")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active worship notice */}
            {place!.activeWorship && (
              <div className="sacred-notice">
                <p className={`text-sm text-[var(--color-teal-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                  {t("This is an active place of worship. Please observe appropriate etiquette when visiting.", "هذا مكان عبادة نشط. يُرجى مراعاة آداب السلوك المناسبة عند الزيارة.")}
                </p>
              </div>
            )}

            {/* Stale info warning */}
            {isStale && (
              <div className="stale-warning">
                <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <p className={`text-sm ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                    {t("Practical information (opening hours, ticketing) may be outdated. Verify before visiting.", "قد تكون المعلومات العملية (ساعات العمل، التذاكر) قديمة. تحقق قبل الزيارة.")}
                  </p>
                </div>
              </div>
            )}

            {media.length > 0 && (
              <section aria-labelledby="monument-gallery-heading" className="space-y-4">
                <div className={`flex items-end justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <h2 id="monument-gallery-heading" className={`text-xl font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                    {t("Visual record", "السجل البصري")}
                  </h2>
                  <span className="text-xs text-[var(--color-stone-500)]">
                    {media.length} {t("images", "صور")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {media.map((asset, index) => {
                    if (!asset.url) return null;
                    const alt = lang === "ar" ? (asset.altAr ?? asset.altEn ?? name) : (asset.altEn ?? asset.altAr ?? name);
                    const caption = lang === "ar" ? asset.captionAr ?? asset.captionEn : asset.captionEn ?? asset.captionAr;
                    return (
                      <figure key={asset.assetId} className={index === 0 ? "col-span-2 sm:col-span-3" : ""}>
                        <img
                          src={buildImageKitUrl(asset.url, index === 0 ? 1280 : 800)}
                          srcSet={buildImageKitSrcSet(asset.url)}
                          sizes={index === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 640px) 33vw, 50vw"}
                          alt={alt}
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className={`w-full rounded-sm object-cover ${index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}
                        />
                        {(caption || asset.attribution) && (
                          <figcaption className={`mt-2 text-xs leading-relaxed text-[var(--color-stone-500)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                            {caption && <span>{caption}</span>}
                            {caption && asset.attribution && <span> · </span>}
                            {asset.attribution && <span>{asset.attribution}</span>}
                            {asset.sourcePage && (
                              <a href={asset.sourcePage} target="_blank" rel="noopener noreferrer" className="ml-1 text-[var(--color-terracotta-600)] hover:underline">
                                {t("Source", "المصدر")}
                              </a>
                            )}
                          </figcaption>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Tabs */}
            <Tabs defaultValue="history" dir={isRTL ? "rtl" : "ltr"}>
              <TabsList className="bg-[var(--color-parchment-200)] mb-6">
                <TabsTrigger value="history" className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>{t("History", "التاريخ")}</TabsTrigger>
                <TabsTrigger value="architecture" className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>{t("Architecture", "العمارة")}</TabsTrigger>
                <TabsTrigger value="bilingual" className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>{t("Bilingual", "ثنائي اللغة")}</TabsTrigger>
                {clarification && <TabsTrigger value="clarify" className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>{t("Clarification", "توضيح")}</TabsTrigger>}
              </TabsList>

              <TabsContent value="history" className="space-y-6">
                {brief ? (
                  <div>
                    <h2 className={`text-xl font-semibold text-[var(--color-stone-900)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                      {t("History Brief", "نبذة تاريخية")}
                    </h2>
                    <p className={`text-[var(--color-stone-700)] leading-relaxed text-base ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
                      {brief}
                    </p>
                  </div>
                ) : (
                  <p className="text-[var(--color-stone-400)] italic">{t("History brief coming soon.", "النبذة التاريخية قريباً.")}</p>
                )}

                {keyDates.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold text-[var(--color-stone-900)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                      {t("Key Dates", "التواريخ الرئيسية")}
                    </h3>
                    <div className="space-y-2">
                      {keyDates.map((kd, i) => (
                        <div key={i} className={`flex items-start gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                          <span className="text-[var(--color-terracotta-600)] font-mono text-sm font-semibold shrink-0 mt-0.5">{kd.year}</span>
                          <span className={`text-sm text-[var(--color-stone-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                            {lang === "ar" ? kd.labelAr : kd.labelEn}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="architecture" className="space-y-6">
                {phases.length > 0 ? (
                  <div>
                    <h3 className={`text-lg font-semibold text-[var(--color-stone-900)] mb-4 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                      {t("Architectural Phases", "المراحل المعمارية")}
                    </h3>
                    <div className="space-y-4">
                      {phases.map((phase, i) => (
                        <div key={i} className="border-l-2 border-[var(--color-terracotta-600)]/30 pl-4">
                          <div className={`font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
                            {lang === "ar" ? phase.nameAr : phase.nameEn}
                            {phase.startYear && <span className="text-sm text-[var(--color-stone-400)] ml-2">{phase.startYear}{phase.endYear ? `–${phase.endYear}` : ""}</span>}
                          </div>
                          {(lang === "ar" ? phase.descAr : phase.descEn) && (
                            <p className={`text-sm text-[var(--color-stone-500)] mt-1 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                              {lang === "ar" ? phase.descAr : phase.descEn}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--color-stone-400)] italic">{t("Architectural details coming soon.", "التفاصيل المعمارية قريباً.")}</p>
                )}
              </TabsContent>

              <TabsContent value="bilingual">
                <div className="bilingual-block">
                  <div>
                    <h3 className="font-[var(--font-serif)] font-semibold text-[var(--color-stone-900)] mb-3 text-lg">English</h3>
                    <p className="text-[var(--color-stone-700)] leading-relaxed text-sm">{place!.briefEn ?? t("Coming soon.", "قريباً.")}</p>
                  </div>
                  <div dir="rtl">
                    <h3 className="font-[var(--font-arabic)] font-semibold text-[var(--color-stone-900)] mb-3 text-lg text-right">العربية</h3>
                    <p className="font-[var(--font-arabic)] text-[var(--color-stone-700)] leading-relaxed text-sm text-right">{place!.briefAr ?? "قريباً."}</p>
                  </div>
                </div>
              </TabsContent>

              {clarification && (
                <TabsContent value="clarify">
                  <div className="clarification-callout">
                    <h3 className={`font-semibold text-[var(--color-stone-900)] mb-2 ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
                      {t("Do Not Misunderstand", "لا تُساء الفهم")}
                    </h3>
                    <p className={`text-sm text-[var(--color-stone-600)] leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                      {clarification}
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Right: metadata sidebar */}
          <div className="space-y-5">
            {/* Quick facts */}
            <div className="notebook-card">
              <h3 className={`font-semibold text-[var(--color-stone-900)] mb-4 ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
                {t("Quick Facts", "حقائق سريعة")}
              </h3>
              <div className="space-y-3">
                {place!.foundedYear && (
                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Calendar size={14} className="text-[var(--color-terracotta-600)] mt-0.5 shrink-0" />
                    <div>
                      <div className={`text-xs text-[var(--color-stone-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{t("Founded", "التأسيس")}</div>
                      <div className={`text-sm font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                        {place!.dateDisplayEn ?? `${place!.foundedYear} CE`}
                      </div>
                    </div>
                  </div>
                )}
                {patron && (
                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <User size={14} className="text-[var(--color-terracotta-600)] mt-0.5 shrink-0" />
                    <div>
                      <div className={`text-xs text-[var(--color-stone-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{t("Patron / Founder", "الباني / المؤسس")}</div>
                      <div className={`text-sm font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{patron}</div>
                    </div>
                  </div>
                )}
                {originalFunction && (
                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Building size={14} className="text-[var(--color-terracotta-600)] mt-0.5 shrink-0" />
                    <div>
                      <div className={`text-xs text-[var(--color-stone-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{t("Original Function", "الوظيفة الأصلية")}</div>
                      <div className={`text-sm font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{originalFunction}</div>
                    </div>
                  </div>
                )}
                {currentFunction && (
                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Building size={14} className="text-[var(--color-terracotta-600)] mt-0.5 shrink-0" />
                    <div>
                      <div className={`text-xs text-[var(--color-stone-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{t("Current Function", "الوظيفة الحالية")}</div>
                      <div className={`text-sm font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{currentFunction}</div>
                    </div>
                  </div>
                )}
                {place!.lat && place!.lng && (
                  <div className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <MapPin size={14} className="text-[var(--color-terracotta-600)] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--color-stone-400)]">{t("Location", "الموقع")}</div>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${place!.lat}&mlon=${place!.lng}&zoom=17`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--color-terracotta-600)] hover:underline"
                      >
                        {t("View on map", "عرض على الخريطة")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Opening hours */}
            {openingHours && (
              <div className="notebook-card">
                <h3 className={`font-semibold text-[var(--color-stone-900)] mb-2 ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
                  {t("Opening Hours", "ساعات العمل")}
                </h3>
                <p className={`text-sm text-[var(--color-stone-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                  {openingHours}
                </p>
                {isStale && (
                  <p className="text-xs text-[var(--color-gold-500)] mt-2 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {t("May be outdated", "قد تكون قديمة")}
                  </p>
                )}
              </div>
            )}

            {/* Photography */}
            {place!.photographyAllowed && place!.photographyAllowed !== "unknown" && (
              <div className="notebook-card">
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <Camera size={14} className="text-[var(--color-stone-500)]" />
                  <span className={`text-sm text-[var(--color-stone-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                    {place!.photographyAllowed === "yes" && t("Photography allowed", "التصوير مسموح")}
                    {place!.photographyAllowed === "exterior_only" && t("Exterior photography only", "التصوير الخارجي فقط")}
                    {place!.photographyAllowed === "no" && t("No photography", "لا تصوير")}
                    {place!.photographyAllowed === "ask" && t("Ask on site", "اسأل في الموقع")}
                  </span>
                </div>
              </div>
            )}

            {/* Compare link */}
            <Link href={`/compare?add=${place!.id}`}>
              <div className="notebook-card cursor-pointer hover:border-[var(--color-terracotta-600)] transition-colors group">
                <p className={`text-sm text-[var(--color-stone-600)] group-hover:text-[var(--color-terracotta-600)] transition-colors ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                  {t("Compare with other monuments →", "قارن مع معالم أخرى ←")}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
