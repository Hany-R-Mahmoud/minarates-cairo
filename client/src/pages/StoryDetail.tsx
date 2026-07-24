import { useParams, Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Streamdown } from "streamdown";
import { buildImageKitSrcSet, buildImageKitUrl } from "@shared/media";
import { Badge } from "@/components/ui/badge";

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL, t } = useLang();
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const { data: story, isLoading } = trpc.stories.bySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });
  const { data: storyResearch } = trpc.places.researchByStory.useQuery({ slug: slug ?? "" }, { enabled: !!slug });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container py-12 space-y-4">
          <div className="skeleton h-8 w-32 rounded" />
          <div className="skeleton h-12 w-3/4 rounded" />
          <div className="skeleton h-64 rounded" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--color-stone-500)] mb-4">{t("Story not found.", "لم يتم العثور على القصة.")}</p>
          <Link href="/stories"><Button variant="outline">{t("Back to Stories", "العودة إلى القصص")}</Button></Link>
        </div>
      </div>
    );
  }

  const title = lang === "ar" ? story.titleAr : story.titleEn;
  const summary = lang === "ar" ? story.summaryAr : story.summaryEn;
  const body = lang === "ar" ? story.bodyAr : story.bodyEn;

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="bg-[var(--color-stone-900)] py-12">
        <div className="container">
          <Link href="/stories">
            <span className={`flex items-center gap-2 text-[var(--color-stone-400)] hover:text-[var(--color-stone-200)] text-sm mb-6 cursor-pointer transition-colors w-fit ${isRTL ? "flex-row-reverse" : ""}`}>
              <BackIcon size={14} />
              {t("Back to Stories", "العودة إلى القصص")}
            </span>
          </Link>
          <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-4 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {title}
          </h1>
          {summary && (
            <p className={`text-lg text-[var(--color-stone-300)] max-w-2xl leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
              {summary}
            </p>
          )}
        </div>
      </div>

      {/* Cover image */}
      {story.coverImageUrl && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img
            src={buildImageKitUrl(story.coverImageUrl, 1280)}
            srcSet={buildImageKitSrcSet(story.coverImageUrl)}
            sizes="100vw"
            alt={title}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          {story.coverImageAttribution && (
            <div className="text-xs text-[var(--color-stone-400)] text-center py-1 bg-[var(--color-parchment-100)]">
              {story.coverImageAttribution}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {body ? (
            <div className={`prose prose-stone max-w-none ${lang === "ar" ? "font-[var(--font-arabic)] text-right prose-headings:font-[var(--font-arabic)]" : "prose-headings:font-[var(--font-serif)]"}`}>
              <Streamdown>{body}</Streamdown>
            </div>
          ) : (
            <div className="text-center py-20 text-[var(--color-stone-400)]">
              <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
              <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
                {t("Full story content coming soon.", "محتوى القصة الكامل قريباً.")}
              </p>
            </div>
          )}
        </div>
        {storyResearch && storyResearch.claims.length > 0 && (
          <section className="max-w-3xl mx-auto mt-12 border-t border-[var(--color-border)] pt-8" aria-labelledby="story-research-heading">
            <div className={`flex flex-wrap items-center gap-2 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
              <h2 id="story-research-heading" className={`text-xl font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                {t("Research notes connected to this story", "ملاحظات بحثية مرتبطة بهذه القصة")}
              </h2>
              <Badge variant="secondary">
                {t(`${storyResearch.claims.length} accepted claims`, `${storyResearch.claims.length} ادعاء مقبول`)}
              </Badge>
            </div>
            <div className="space-y-3">
              {storyResearch.claims.map(claim => (
                <article key={claim.claimId} className={`p-4 bg-[var(--color-parchment-100)] border border-[var(--color-border)] rounded-lg ${lang === "ar" ? "text-right" : ""}`}>
                  <div className={`flex flex-wrap items-center gap-2 mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <Badge variant="outline" className="text-[10px]">{claim.claimType}</Badge>
                    <span className="text-[10px] text-[var(--color-stone-500)]">
                      {t(`${claim.confidence ?? "unknown"} confidence`, `ثقة ${claim.confidence ?? "غير معروفة"}`)}
                    </span>
                  </div>
                  <p className={`text-sm text-[var(--color-stone-700)] leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                    {lang === "ar" ? claim.textAr ?? claim.textEn : claim.textEn}
                  </p>
                </article>
              ))}
            </div>
            {storyResearch.places.length > 0 && (
              <div className={`mt-5 flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                {storyResearch.places.map(place => (
                  <Link key={place.id} href={`/monuments/${place.slug}`}>
                    <span className="text-xs text-[var(--color-terracotta-600)] hover:underline cursor-pointer">
                      {lang === "ar" ? place.nameAr : place.nameEn}
                    </span>
                  </Link>
                ))}
                <span className="text-xs text-[var(--color-stone-500)]">
                  {t(`${storyResearch.sources.length} linked sources`, `${storyResearch.sources.length} مصادر مرتبطة`)}
                </span>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
