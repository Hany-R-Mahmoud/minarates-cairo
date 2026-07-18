import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ChevronRight, BookOpen } from "lucide-react";

export default function Stories() {
  const { lang, isRTL, t } = useLang();
  const { data: stories, isLoading } = trpc.stories.list.useQuery();

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[var(--color-stone-900)] py-16">
        <div className="container">
          <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("Visual Stories", "قصص بصرية")}
          </h1>
          <p className={`text-[var(--color-stone-400)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Immersive narratives following people, ideas, and transformations across Islamic Cairo", "روايات غامرة تتبع الناس والأفكار والتحولات عبر القاهرة الإسلامية")}
          </p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(stories ?? []).map(story => (
              <Link key={story.id} href={`/stories/${story.slug}`}>
                <div className="monument-card cursor-pointer group h-full flex flex-col overflow-hidden">
                  {/* Cover image area */}
                  <div className="h-44 bg-[var(--color-stone-800)] geometric-pattern relative overflow-hidden shrink-0">
                    {story.coverImageUrl ? (
                      <img
                        src={story.coverImageUrl}
                        alt={lang === "ar" ? story.titleAr : story.titleEn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen size={32} className="text-[var(--color-gold-400)]/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-stone-900)]/60 to-transparent" />
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className={`font-semibold text-[var(--color-stone-900)] mb-2 leading-snug ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
                      {lang === "ar" ? story.titleAr : story.titleEn}
                    </h3>
                    {(lang === "ar" ? story.summaryAr : story.summaryEn) && (
                      <p className={`text-sm text-[var(--color-stone-500)] line-clamp-3 flex-1 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                        {lang === "ar" ? story.summaryAr : story.summaryEn}
                      </p>
                    )}
                    <div className={`flex items-center gap-1 mt-4 text-[var(--color-terracotta-600)] text-xs font-medium ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span>{t("Read Story", "اقرأ القصة")}</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (stories ?? []).length === 0 && (
          <div className="text-center py-20 text-[var(--color-stone-400)]">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
              {t("No stories published yet.", "لم تُنشر قصص بعد.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
