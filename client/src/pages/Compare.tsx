import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Plus, X, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COMPARE_FIELDS: Array<{ keyEn: string; keyAr: string; field: string; render: (p: Record<string, unknown>, lang: string) => string }> = [
  { keyEn: "Founded", keyAr: "التأسيس", field: "foundedYear", render: (p) => p.foundedYear ? `${p.foundedYear} CE` : "—" },
  { keyEn: "Patron / Founder", keyAr: "الباني", field: "patronEn", render: (p, lang) => String((lang === "ar" ? p.patronAr : p.patronEn) ?? "—") },
  { keyEn: "Original Function", keyAr: "الوظيفة الأصلية", field: "originalFunctionEn", render: (p, lang) => String((lang === "ar" ? p.originalFunctionAr : p.originalFunctionEn) ?? "—") },
  { keyEn: "Current Function", keyAr: "الوظيفة الحالية", field: "currentFunctionEn", render: (p, lang) => String((lang === "ar" ? p.currentFunctionAr : p.currentFunctionEn) ?? "—") },
  { keyEn: "Active Worship", keyAr: "عبادة نشطة", field: "activeWorship", render: (p, lang) => p.activeWorship ? (lang === "ar" ? "نعم" : "Yes") : (lang === "ar" ? "لا" : "No") },
  { keyEn: "Ticketed Entry", keyAr: "دخول بتذكرة", field: "ticketed", render: (p, lang) => p.ticketed === null ? "—" : (p.ticketed ? (lang === "ar" ? "نعم" : "Yes") : (lang === "ar" ? "لا" : "No")) },
];

export default function Compare() {
  const { lang, isRTL, t } = useLang();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const addId = params.get("add");

  const [selectedIds, setSelectedIds] = useState<number[]>(addId ? [parseInt(addId)] : []);
  const [addingSlot, setAddingSlot] = useState<boolean>(false);
  const [selectValue, setSelectValue] = useState<string>("");

  const { data: allPlaces } = trpc.places.list.useQuery({ limit: 100, offset: 0, status: "published" });
  const { data: comparedPlaces } = trpc.comparisons.custom.useQuery(
    { placeIds: selectedIds },
    { enabled: selectedIds.length >= 2 }
  );

  const availablePlaces = (allPlaces?.items ?? []).filter(p => !selectedIds.includes(p.id));

  const addPlace = (id: number) => {
    if (selectedIds.length >= 4) return;
    setSelectedIds(prev => [...prev, id]);
    setSelectValue("");
    setAddingSlot(false);
  };

  const removePlace = (id: number) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const places = comparedPlaces ?? [];

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[var(--color-stone-900)] py-16">
        <div className="container">
          <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("Compare Monuments", "مقارنة المعالم")}
          </h1>
          <p className={`text-[var(--color-stone-400)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Compare 2–4 monuments side by side across 14 architectural dimensions", "قارن ٢–٤ معالم جنباً إلى جنب عبر ١٤ بُعداً معمارياً")}
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Place selector */}
        <div className={`flex flex-wrap gap-3 mb-8 items-center ${isRTL ? "flex-row-reverse" : ""}`}>
          {selectedIds.map(id => {
            const place = (allPlaces?.items ?? []).find(p => p.id === id);
            if (!place) return null;
            return (
              <div key={id} className={`flex items-center gap-2 bg-[var(--color-parchment-200)] border border-[var(--color-border)] rounded-full px-3 py-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                <span className={`text-sm font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                  {lang === "ar" ? place.nameAr : place.nameEn}
                </span>
                <button onClick={() => removePlace(id)} className="text-[var(--color-stone-400)] hover:text-[var(--color-stone-700)] transition-colors">
                  <X size={13} />
                </button>
              </div>
            );
          })}

          {selectedIds.length < 4 && (
            addingSlot ? (
              <Select value={selectValue} onValueChange={v => { setSelectValue(v); addPlace(parseInt(v)); }}>
                <SelectTrigger className="w-56 bg-white border-[var(--color-border)]">
                  <SelectValue placeholder={t("Select a monument...", "اختر معلماً...")} />
                </SelectTrigger>
                <SelectContent>
                  {availablePlaces.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {lang === "ar" ? p.nameAr : p.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingSlot(true)}
                className="border-dashed border-[var(--color-stone-400)] text-[var(--color-stone-500)] hover:border-[var(--color-terracotta-600)] hover:text-[var(--color-terracotta-600)]"
              >
                <Plus size={14} className="mr-1" />
                {t("Add Monument", "أضف معلماً")}
              </Button>
            )
          )}

          {selectedIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-[var(--color-stone-400)]">
              {t("Clear all", "مسح الكل")}
            </Button>
          )}
        </div>

        {/* Prompt */}
        {selectedIds.length < 2 && (
          <div className="text-center py-20">
            <ArrowLeftRight size={40} className="mx-auto text-[var(--color-stone-300)] mb-4" />
            <p className={`text-[var(--color-stone-400)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              {t("Select at least 2 monuments to compare.", "اختر معلمَين على الأقل للمقارنة.")}
            </p>
          </div>
        )}

        {/* Comparison table */}
        {selectedIds.length >= 2 && places.length >= 2 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={`text-left p-3 bg-[var(--color-stone-900)] text-[var(--color-stone-400)] text-xs font-medium uppercase tracking-wide w-36 ${isRTL ? "text-right" : ""}`}>
                    {t("Feature", "الخاصية")}
                  </th>
                  {places.map(place => (
                    <th key={place.id} className="p-3 bg-[var(--color-stone-800)] text-center min-w-40">
                      <div className={`font-semibold text-[var(--color-parchment-100)] text-sm leading-snug ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                        {lang === "ar" ? place.nameAr : place.nameEn}
                      </div>
                      {place.foundedYear && (
                        <div className="text-xs text-[var(--color-stone-400)] mt-0.5">{place.foundedYear}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_FIELDS.map((field, i) => (
                  <tr key={field.field} className={i % 2 === 0 ? "bg-white" : "bg-[var(--color-parchment-100)]"}>
                    <td className={`p-3 text-xs font-semibold text-[var(--color-stone-600)] border-r border-[var(--color-border)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                      {lang === "ar" ? field.keyAr : field.keyEn}
                    </td>
                    {places.map(place => (
                      <td key={place.id} className={`p-3 text-sm text-[var(--color-stone-700)] text-center border-r border-[var(--color-border)] last:border-r-0 ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                        {field.render(place as unknown as Record<string, unknown>, lang)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Brief comparison row */}
                <tr className="bg-[var(--color-parchment-200)]">
                  <td className={`p-3 text-xs font-semibold text-[var(--color-stone-600)] border-r border-[var(--color-border)] align-top ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                    {t("History Brief", "النبذة التاريخية")}
                  </td>
                  {places.map(place => (
                    <td key={place.id} className={`p-3 text-xs text-[var(--color-stone-600)] border-r border-[var(--color-border)] last:border-r-0 align-top ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                      {(lang === "ar" ? place.briefAr : place.briefEn) ?? (<span className="italic text-[var(--color-stone-400)]">{t("Coming soon", "قريباً")}</span>)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Curated comparisons */}
        <div className="mt-12">
          <h2 className={`text-xl font-semibold text-[var(--color-stone-900)] mb-5 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("Curated Comparisons", "مقارنات منتقاة")}
          </h2>
          <CuratedComparisons />
        </div>
      </div>
    </div>
  );
}

function CuratedComparisons() {
  const { lang, isRTL, t } = useLang();
  const { data: comparisons } = trpc.comparisons.list.useQuery();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {(comparisons ?? []).map(comp => (
        <div key={comp.id} className="monument-card p-4 cursor-pointer hover:border-[var(--color-terracotta-600)] transition-colors group">
          <h3 className={`font-medium text-[var(--color-stone-900)] mb-2 text-sm leading-snug ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
            {lang === "ar" ? comp.titleAr : comp.titleEn}
          </h3>
          {(lang === "ar" ? comp.descriptionAr : comp.descriptionEn) && (
            <p className={`text-xs text-[var(--color-stone-500)] line-clamp-2 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
              {lang === "ar" ? comp.descriptionAr : comp.descriptionEn}
            </p>
          )}
          <span className={`text-xs text-[var(--color-terracotta-600)] mt-3 inline-flex items-center gap-1 group-hover:underline ${isRTL ? "flex-row-reverse" : ""}`}>
            {t("Compare →", "قارن ←")}
          </span>
        </div>
      ))}
    </div>
  );
}
