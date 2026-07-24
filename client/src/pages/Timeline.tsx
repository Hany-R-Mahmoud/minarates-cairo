import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Clock3 } from "lucide-react";
import PageIntro from "@/components/PageIntro";

export default function Timeline() {
  const { lang, isRTL, t } = useLang();
  const { data: places, isLoading } = trpc.places.timeline.useQuery();
  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <PageIntro variant="explore" icon={<Clock3 size={24} />} eyebrow={t("Layered chronology", "تسلسل الطبقات")} title={t("Cairo Through Time", "القاهرة عبر الزمن")} description={t("Trace the published monuments from their earliest recorded dates, then open a place to follow its later phases.", "تتبع المعالم المنشورة من أقدم تواريخها المسجلة، ثم افتح المكان لمتابعة مراحله اللاحقة.")} />
      <main className="container py-10">
        {isLoading ? <div className="space-y-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="skeleton h-24 rounded-lg" />)}</div> : places?.length ? <div className="relative border-s border-[var(--color-terracotta-600)]/30 ps-6 space-y-5">{places.map(place => {
          const name = lang === "ar" ? place.nameAr : place.nameEn;
          return <article key={place.id} className="relative monument-card p-5"><span className="absolute -start-[31px] top-7 h-3 w-3 rounded-full bg-[var(--color-terracotta-600)] ring-4 ring-[var(--color-background)]" /><div className={`flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between ${isRTL ? "sm:flex-row-reverse" : ""}`}><div><p className="font-mono text-sm font-semibold text-[var(--color-terracotta-600)]">{place.foundedYear}{place.foundedYearEnd ? `–${place.foundedYearEnd}` : ""}</p><h2 className={`mt-1 text-lg font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>{name}</h2></div><Link href={`/monuments/${place.slug}`} className="text-sm hover:underline">{t("Open record →", "فتح السجل ←")}</Link></div>{(lang === "ar" ? place.briefAr : place.briefEn) && <p className={`mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--color-stone-600)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>{lang === "ar" ? place.briefAr : place.briefEn}</p>}</article>;
        })}</div> : <div className="notebook-card py-12 text-center text-[var(--color-stone-500)]">{t("No dated published records are available yet.", "لا توجد سجلات منشورة مؤرخة بعد.")}</div>}
      </main>
    </div>
  );
}
