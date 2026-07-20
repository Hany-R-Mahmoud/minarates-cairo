import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ChevronRight, BookOpen, ImageOff } from "lucide-react";
import { buildImageKitSrcSet, buildImageKitUrl } from "@shared/media";
import PageIntro from "@/components/PageIntro";

export default function Stories() {
  const { lang, isRTL, t } = useLang();
  const { data: stories, isLoading } = trpc.stories.list.useQuery();

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <PageIntro
        variant="editorial"
        title={t("Visual Stories", "قصص بصرية")}
        description={t("Immersive narratives following people, ideas, and transformations across Islamic Cairo", "روايات غامرة تتبع الناس والأفكار والتحولات عبر القاهرة الإسلامية")}
      />

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
                  <div className="h-44 bg-[var(--color-stone-800)] relative overflow-hidden shrink-0">
                    {story.coverImageUrl ? (
                      <img
                        src={buildImageKitUrl(story.coverImageUrl, 800)}
                        srcSet={buildImageKitSrcSet(story.coverImageUrl)}
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        alt={lang === "ar" ? story.titleAr : story.titleEn}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-stone-400)]">
                        <ImageOff size={24} aria-hidden="true" />
                        <span className="text-xs">{t("Image not yet available", "الصورة غير متاحة بعد")}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-stone-900)]/60 to-transparent pointer-events-none" />
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
