import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, HelpCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 border-green-200",
  intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  advanced: "bg-red-100 text-red-700 border-red-200",
};

const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  find_detail: "🔍",
  match_silhouette: "🏛️",
  street_or_qibla: "🧭",
  build_complex: "🏗️",
  which_century: "📅",
  material_microscope: "🔬",
  layer_reveal: "📚",
  route_riddle: "🗺️",
  patron_network: "👤",
  vocabulary_deck: "📖",
};

type Activity = {
  id: number;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  activityType: string;
  promptEn: string | null;
  promptAr: string | null;
  options: unknown;
  correctAnswer: string | null;
  explanationEn: string | null;
  explanationAr: string | null;
  difficulty: string;
  pointsValue?: number | null;
};

function ActivityCard({ activity }: { activity: Activity }) {
  const { lang, isRTL, t } = useLang();
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const options = (activity.options as Array<{ value: string; labelEn: string; labelAr: string }> | null) ?? [];
  const title = lang === "ar" ? activity.titleAr : activity.titleEn;
  const prompt = lang === "ar" ? activity.promptAr : activity.promptEn;
  const explanation = lang === "ar" ? activity.explanationAr : activity.explanationEn;

  const handleSelect = (value: string) => {
    if (revealed) return;
    setSelected(value);
    setRevealed(true);
    const correct = value === activity.correctAnswer;
    if (correct) {
      toast.success(t("Correct! Well done.", "صحيح! أحسنت."));
    } else {
      toast.error(t("Not quite. See the explanation below.", "ليس تماماً. انظر التفسير أدناه."));
    }
  };

  const reset = () => { setSelected(null); setRevealed(false); };

  return (
    <div className="monument-card p-5">
      {/* Header */}
      <div className={`flex items-start justify-between gap-3 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className="flex-1">
          <div className={`flex items-center gap-2 mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
            <span className="text-lg">{ACTIVITY_TYPE_ICONS[activity.activityType] ?? "🏛️"}</span>
            <h3 className={`font-semibold text-[var(--color-stone-900)] leading-snug ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : "font-[var(--font-serif)]"}`}>
              {title}
            </h3>
          </div>
          {activity.descriptionEn && (
            <p className={`text-xs text-[var(--color-stone-500)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
              {lang === "ar" ? activity.descriptionAr : activity.descriptionEn}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {activity.difficulty && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[activity.difficulty] ?? ""}`}>
              {activity.difficulty}
            </span>
          )}
          {activity.pointsValue && (
            <span className="text-xs text-[var(--color-gold-500)] font-semibold">{activity.pointsValue}pt</span>
          )}
        </div>
      </div>

      {/* Prompt */}
      {prompt && (
        <div className={`bg-[var(--color-parchment-200)] rounded-lg p-4 mb-4 ${isRTL ? "text-right" : ""}`}>
          <p className={`text-sm text-[var(--color-stone-700)] leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic)] text-right" : ""}`}>
            {prompt}
          </p>
        </div>
      )}

      {/* Options */}
      {options.length > 0 && (
        <div className="space-y-2 mb-4">
          {options.map(opt => {
            const isCorrect = opt.value === activity.correctAnswer;
            const isSelected = opt.value === selected;
            let cls = "border border-[var(--color-border)] bg-white hover:bg-[var(--color-parchment-100)] text-[var(--color-stone-700)]";
            if (revealed) {
              if (isCorrect) cls = "border-2 border-green-500 bg-green-50 text-green-800";
              else if (isSelected && !isCorrect) cls = "border-2 border-red-400 bg-red-50 text-red-800";
              else cls = "border border-[var(--color-border)] bg-white text-[var(--color-stone-400)]";
            }
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                disabled={revealed}
                className={`w-full text-left p-3 rounded-lg transition-all text-sm ${cls} ${isRTL ? "text-right" : ""} disabled:cursor-default`}
              >
                <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  {revealed && isCorrect && <CheckCircle size={14} className="text-green-600 shrink-0" />}
                  {revealed && isSelected && !isCorrect && <XCircle size={14} className="text-red-500 shrink-0" />}
                  <span className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
                    {lang === "ar" ? opt.labelAr : opt.labelEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      {revealed && explanation && (
        <div className="bg-[var(--color-parchment-100)] border border-[var(--color-border)] rounded-lg p-3 mb-3">
          <p className={`text-xs text-[var(--color-stone-600)] leading-relaxed ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
            <strong>{t("Explanation: ", "التفسير: ")}</strong>{explanation}
          </p>
        </div>
      )}

      {revealed && (
        <Button variant="ghost" size="sm" onClick={reset} className="text-[var(--color-stone-400)] text-xs">
          {t("Try again", "حاول مجدداً")}
        </Button>
      )}
    </div>
  );
}

export default function Detective() {
  const { lang, isRTL, t } = useLang();
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced" | undefined>(undefined);

  const { data: activities, isLoading } = trpc.detective.list.useQuery({ difficulty });

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="bg-[var(--color-stone-900)] py-16">
        <div className="container">
          <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("Play Detective", "العب المحقق")}
          </h1>
          <p className={`text-[var(--color-stone-400)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Test your knowledge of Islamic architecture through 10 interactive challenges", "اختبر معرفتك بالعمارة الإسلامية من خلال ١٠ تحديات تفاعلية")}
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Difficulty filter */}
        <div className={`flex gap-2 mb-8 ${isRTL ? "flex-row-reverse" : ""}`}>
          {([undefined, "beginner", "intermediate", "advanced"] as const).map(d => (
            <Button
              key={d ?? "all"}
              variant={difficulty === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(d)}
              className={difficulty === d ? "bg-[var(--color-terracotta-600)]" : "border-[var(--color-border)]"}
            >
              <span className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
                {d === undefined ? t("All", "الكل") : d === "beginner" ? t("Beginner", "مبتدئ") : d === "intermediate" ? t("Intermediate", "متوسط") : t("Advanced", "متقدم")}
              </span>
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(activities ?? []).map(activity => (
              <ActivityCard key={activity.id} activity={activity as unknown as Activity} />
            ))}
          </div>
        )}

        {!isLoading && (activities ?? []).length === 0 && (
          <div className="text-center py-20 text-[var(--color-stone-400)]">
            <HelpCircle size={40} className="mx-auto mb-4 opacity-30" />
            <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
              {t("No activities available yet.", "لا توجد أنشطة متاحة بعد.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
