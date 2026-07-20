import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowRight, ArrowLeft, Map, Compass, BarChart2, Zap, BookMarked, BookOpen, ChevronRight, ImageOff } from "lucide-react";
import { buildImageKitSrcSet, buildImageKitUrl } from "@shared/media";
import type { Place } from "@shared/types";

const ERA_COLORS: Record<string, string> = {
  "tulunid": "era-tulunid",
  "fatimid": "era-fatimid",
  "ayyubid": "era-ayyubid",
  "mamluk": "era-mamluk",
  "bahri-mamluk": "era-mamluk",
  "burji-mamluk": "era-mamluk",
  "ottoman": "era-ottoman",
  "early-ottoman": "era-ottoman",
  "late-ottoman": "era-ottoman",
  "muhammad-ali": "era-modern",
  "modern": "era-modern",
};

const ENTRY_POINTS = [
  { href: "/monuments", icon: <BookOpen size={28} />, labelEn: "Monuments", labelAr: "المعالم", descEn: "48+ published places", descAr: "٤٨+ موقعاً منشوراً" },
  { href: "/map", icon: <Map size={28} />, labelEn: "Interactive Map", labelAr: "الخريطة التفاعلية", descEn: "Explore by location", descAr: "استكشف حسب الموقع" },
  { href: "/walks", icon: <Compass size={28} />, labelEn: "District Walks", labelAr: "جولات الأحياء", descEn: "18 curated routes", descAr: "١٨ مسار منسق" },
  { href: "/compare", icon: <BarChart2 size={28} />, labelEn: "Compare Eras", labelAr: "مقارنة الحقب", descEn: "Side-by-side analysis", descAr: "تحليل جنباً إلى جنب" },
  { href: "/detective", icon: <Zap size={28} />, labelEn: "Play Detective", labelAr: "العب المحقق", descEn: "Visual learning activities", descAr: "أنشطة تعلم بصري" },
  { href: "/stories", icon: <BookMarked size={28} />, labelEn: "Visual Stories", labelAr: "القصص البصرية", descEn: "Deep architectural dives", descAr: "تعمق معماري" },
];

export default function Home() {
  const { lang, isRTL, t } = useLang();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const { data: periods } = trpc.periods.list.useQuery();
  const { data: placesData } = trpc.places.list.useQuery({ limit: 6, offset: 0 });
  const { data: stories } = trpc.stories.list.useQuery();

  const getPlaceImageAlt = (place: Place) =>
    lang === "ar" ? (place.coverImageAltAr ?? place.coverImageAlt) : place.coverImageAlt;
  const hasVerifiedPlaceImage = (place: Place) => Boolean(
    place.coverImageUrl &&
    getPlaceImageAlt(place) &&
    place.coverImageAttribution &&
    place.coverImageLicense,
  );

  return (
    <div className="page-enter" dir={isRTL ? "rtl" : "ltr"}>
      {/* ── Cinematic Hero ── */}
      <section className="relative min-h-screen bg-[var(--color-stone-950)] flex flex-col justify-end overflow-hidden">
        {/* Cinematic tonal field */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,oklch(32%_0.04_42_/_0.45),transparent_55%)]" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-stone-950)]/40 via-transparent to-[var(--color-stone-950)]/90" />

        {/* Hero content */}
        <div className="relative z-10 container pb-20 pt-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-12 bg-[var(--color-gold-400)]" />
              <span className="text-[var(--color-gold-400)] text-sm font-medium tracking-widest uppercase">
                {t("Islamic Cairo", "القاهرة الإسلامية")}
              </span>
            </div>

            <h1 className={`text-5xl md:text-7xl font-bold leading-tight mb-6 text-[var(--color-parchment-100)] ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
              {lang === "ar" ? "مآذن القاهرة" : "Minarets\nof Cairo"}
            </h1>

            <p className={`text-xl md:text-2xl text-[var(--color-stone-300)] leading-relaxed mb-4 ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>
              {t("Walk through a thousand years of stone, wood, light, and sound.", "رحلة عبر ألف عام من الحجر والخشب والضوء والصوت.")}
            </p>
            <p className={`text-base text-[var(--color-stone-400)] leading-relaxed mb-10 ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>
              {t("Discover Islamic Cairo — its monuments, streets, patrons, and living heritage.", "اكتشف القاهرة الإسلامية — معالمها وشوارعها وأصحاب العمائر وتراثها الحي.")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/monuments">
                <span className="btn-heritage flex items-center gap-2 text-base px-6 py-3 cursor-pointer">
                  {t("Explore Monuments", "استكشف المعالم")}
                  <ArrowIcon size={18} />
                </span>
              </Link>
              <Link href="/map">
                <span className="flex items-center gap-2 px-6 py-3 rounded border border-[var(--color-stone-600)] text-[var(--color-stone-300)] hover:border-[var(--color-stone-400)] hover:text-white transition-colors cursor-pointer text-base">
                  <Map size={18} />
                  {t("Open Map", "افتح الخريطة")}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-stone-500)]">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[var(--color-stone-500)]" />
          <span className="text-xs tracking-widest uppercase">{t("Scroll", "مرر")}</span>
        </div>
      </section>

      {/* ── Period Ribbon ── */}
      <section className="bg-[var(--color-stone-900)] border-b border-[var(--color-stone-800)]">
        <div className="container py-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-[var(--color-stone-400)] uppercase tracking-widest font-medium">
              {t("Historical Periods", "الحقب التاريخية")}
            </span>
            <div className="flex-1 h-px bg-[var(--color-stone-800)]" />
            <Link href="/periods">
              <span className="text-xs text-[var(--color-terracotta-400)] hover:text-[var(--color-terracotta-300)] cursor-pointer transition-colors flex items-center gap-1">
                {t("All Periods", "جميع الحقب")} <ChevronRight size={12} />
              </span>
            </Link>
          </div>
          <div className="period-ribbon gap-1">
            {periods?.map(period => (
              <Link key={period.id} href={`/monuments?period=${period.id}`}>
                <div className="period-ribbon-item group cursor-pointer">
                  <div className={`text-xs font-medium text-[var(--color-stone-300)] group-hover:text-white transition-colors ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                    {lang === "ar" ? period.nameAr : period.nameEn}
                  </div>
                  <div className="text-[10px] text-[var(--color-stone-500)] mt-0.5">
                    {period.startYear && period.endYear ? `${period.startYear}–${period.endYear}` : period.startYear ?? ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Entry Points Grid ── */}
      <section className="py-20 bg-[var(--color-parchment-50)]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold text-[var(--color-stone-900)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
              {t("Explore Islamic Cairo", "استكشف القاهرة الإسلامية")}
            </h2>
            <p className={`text-[var(--color-stone-500)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              {t("Six ways to discover a thousand years of heritage", "ستة طرق لاكتشاف ألف عام من التراث")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ENTRY_POINTS.map((ep, i) => (
              <Link key={ep.href} href={ep.href}>
                <div className="monument-card p-6 cursor-pointer group h-full">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-terracotta-600)]/10 flex items-center justify-center text-[var(--color-terracotta-600)] mb-4 group-hover:bg-[var(--color-terracotta-600)] group-hover:text-white transition-colors duration-200">
                    {ep.icon}
                  </div>
                  <h3 className={`font-semibold text-lg text-[var(--color-stone-900)] mb-1 ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
                    {lang === "ar" ? ep.labelAr : ep.labelEn}
                  </h3>
                  <p className={`text-sm text-[var(--color-stone-500)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                    {lang === "ar" ? ep.descAr : ep.descEn}
                  </p>
                  <div className={`flex items-center gap-1 mt-4 text-[var(--color-terracotta-600)] text-sm font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
                    <span>{t("Explore", "استكشف")}</span>
                    <ArrowIcon size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Monuments ── */}
      <section className="py-20 bg-[var(--color-parchment-100)]">
        <div className="container">
          <div className={`flex items-end justify-between mb-10 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div>
              <h2 className={`text-3xl font-bold text-[var(--color-stone-900)] mb-2 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                {t("Featured Monuments", "معالم مميزة")}
              </h2>
              <p className={`text-[var(--color-stone-500)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                {t("Highlights from Islamic Cairo's architectural heritage", "أبرز التراث المعماري للقاهرة الإسلامية")}
              </p>
            </div>
            <Link href="/monuments">
              <span className={`text-[var(--color-terracotta-600)] hover:text-[var(--color-terracotta-700)] text-sm font-medium flex items-center gap-1 cursor-pointer transition-colors ${isRTL ? "flex-row-reverse" : ""}`}>
                {t("See all", "عرض الكل")} <ArrowIcon size={14} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {placesData?.items.slice(0, 6).map(place => (
              <Link key={place.id} href={`/monuments/${place.slug}`}>
                <div className="monument-card cursor-pointer group overflow-hidden">
                  {/* Use only media with complete provenance and descriptive text. */}
                  <div className="h-48 bg-[var(--color-stone-800)] relative overflow-hidden">
                    {hasVerifiedPlaceImage(place) ? (
                      <img
                        src={buildImageKitUrl(place.coverImageUrl!, 800)}
                        srcSet={buildImageKitSrcSet(place.coverImageUrl!)}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        alt={getPlaceImageAlt(place)!}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-stone-400)]">
                        <ImageOff size={24} aria-hidden="true" />
                        <span className="text-xs">{t("Image not yet verified", "الصورة لم تُتحقق بعد")}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-stone-900)]/60 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-5">
                    <h3 className={`font-semibold text-[var(--color-stone-900)] mb-1 leading-snug ${lang === "ar" ? "font-[var(--font-arabic)] text-right text-lg" : "font-[var(--font-serif)]"}`}>
                      {lang === "ar" ? place.nameAr : place.nameEn}
                    </h3>
                    {lang === "en" && place.nameAr && (
                      <p className="text-sm text-[var(--color-stone-400)] font-[var(--font-arabic)] mb-2">{place.nameAr}</p>
                    )}
                    {lang === "ar" && place.nameEn && (
                      <p className="text-sm text-[var(--color-stone-400)] mb-2">{place.nameEn}</p>
                    )}
                    {place.foundedYear && (
                      <p className="text-xs text-[var(--color-stone-500)]">
                        {t("Founded", "التأسيس")} {place.foundedYear} {t("CE", "م")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stories Preview ── */}
      {stories && stories.length > 0 && (
        <section className="py-20 bg-[var(--color-stone-950)]">
          <div className="container">
            <div className={`flex items-end justify-between mb-10 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div>
                <h2 className={`text-3xl font-bold text-[var(--color-parchment-100)] mb-2 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                  {t("Visual Stories", "القصص البصرية")}
                </h2>
                <p className={`text-[var(--color-stone-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                  {t("Deep dives into Cairo's architectural and urban history", "تعمق في التاريخ المعماري والحضري للقاهرة")}
                </p>
              </div>
              <Link href="/stories">
                <span className={`text-[var(--color-terracotta-400)] hover:text-[var(--color-terracotta-300)] text-sm font-medium flex items-center gap-1 cursor-pointer transition-colors ${isRTL ? "flex-row-reverse" : ""}`}>
                  {t("All Stories", "جميع القصص")} <ArrowIcon size={14} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.slice(0, 3).map(story => (
                <Link key={story.id} href={`/stories/${story.slug}`}>
                  <div className="bg-[var(--color-stone-900)] border border-[var(--color-stone-800)] rounded-lg p-6 cursor-pointer hover:border-[var(--color-stone-700)] transition-colors group">
                    <div className="text-xs text-[var(--color-terracotta-400)] uppercase tracking-widest mb-3 font-medium">
                      {t("Story", "قصة")}
                    </div>
                    <h3 className={`font-semibold text-[var(--color-parchment-100)] mb-2 leading-snug ${lang === "ar" ? "font-[var(--font-arabic)] text-right text-lg" : "font-[var(--font-serif)]"}`}>
                      {lang === "ar" ? story.titleAr : story.titleEn}
                    </h3>
                    <p className={`text-sm text-[var(--color-stone-400)] leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                      {lang === "ar" ? (story.summaryAr ?? "") : (story.summaryEn ?? "")}
                    </p>
                    <div className={`flex items-center gap-1 mt-4 text-[var(--color-terracotta-400)] text-sm ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>{t("Read Story", "اقرأ القصة")}</span>
                      <ArrowIcon size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 bg-[var(--color-terracotta-600)]">
        <div className="container text-center">
          <h2 className={`text-3xl md:text-4xl font-bold text-white mb-4 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("Start Your Journey", "ابدأ رحلتك")}
          </h2>
          <p className={`text-white/80 text-lg mb-8 max-w-xl mx-auto ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Build a personal itinerary, save favorites, and explore at your own pace.", "ابنِ خطة زيارة شخصية، احفظ المفضلة، واستكشف بوتيرتك الخاصة.")}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/itinerary">
              <span className="flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-terracotta-600)] rounded font-semibold hover:bg-[var(--color-parchment-100)] transition-colors cursor-pointer">
                {t("Build Itinerary", "بناء الخطة")}
                <ArrowIcon size={18} />
              </span>
            </Link>
            <Link href="/notebook">
              <span className="flex items-center gap-2 px-6 py-3 border border-white/40 text-white rounded font-medium hover:bg-white/10 transition-colors cursor-pointer">
                {t("My Notebook", "مفكرتي")}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
