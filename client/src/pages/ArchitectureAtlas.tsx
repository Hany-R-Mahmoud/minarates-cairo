import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Blocks, ExternalLink } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import { Badge } from "@/components/ui/badge";

export default function ArchitectureAtlas() {
  const { lang, isRTL, t } = useLang();
  const { data: entries, isLoading } = trpc.places.architectureAtlas.useQuery();

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <PageIntro variant="explore" icon={<Blocks size={24} />} eyebrow={t("Evidence atlas", "أطلس الأدلة")} title={t("Architecture Atlas", "أطلس العمارة")} description={t("Compare the recorded architectural language of Cairo's monuments, with claims and features kept close to their sources.", "قارن اللغة المعمارية المسجلة لمعالم القاهرة، مع إبقاء الادعاءات والعناصر قريبة من مصادرها.")} />
      <main className="container py-10">
        {isLoading ? <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton h-48 rounded-lg" />)}</div> : entries?.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {entries.map(entry => {
              const name = lang === "ar" ? entry.place.nameAr : entry.place.nameEn;
              return <article key={entry.place.id} className="monument-card overflow-hidden">
                {entry.place.coverImageUrl && <img src={entry.place.coverImageUrl} alt={name} className="h-44 w-full object-cover" loading="lazy" />}
                <div className="p-5">
                  <div className={`flex items-start justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div><h2 className={`text-lg font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>{name}</h2><p className="mt-1 text-xs text-[var(--color-stone-400)]">{entry.place.dateDisplayEn ?? entry.place.foundedYear}</p></div>
                    <Link href={`/monuments/${entry.place.slug}`} aria-label={t(`Open ${entry.place.nameEn}`, `فتح ${entry.place.nameAr}`)}><ExternalLink size={16} /></Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">{entry.features.map(feature => <Badge key={feature.featureId} variant="secondary">{lang === "ar" ? feature.labelAr ?? feature.labelEn : feature.labelEn}</Badge>)}</div>
                  <div className="mt-4 space-y-3">{entry.claims.slice(0, 3).map(claim => <p key={claim.claimId} className={`text-sm leading-relaxed text-[var(--color-stone-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>{lang === "ar" ? claim.textAr ?? claim.textEn : claim.textEn}</p>)}</div>
                </div>
              </article>;
            })}
          </div>
        ) : <div className="notebook-card py-12 text-center text-[var(--color-stone-500)]">{t("No approved architecture records are available yet.", "لا توجد سجلات عمارة معتمدة بعد.")}</div>}
      </main>
    </div>
  );
}
