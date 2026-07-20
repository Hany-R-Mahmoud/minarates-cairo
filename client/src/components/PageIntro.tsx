import React from "react";
import { useLang } from "@/contexts/LanguageContext";

export type PageIntroVariant = "arrival" | "explore" | "editorial" | "utility" | "studio";

interface PageIntroProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: PageIntroVariant;
}

const variantClasses: Record<PageIntroVariant, string> = {
  arrival: "py-20 md:py-24",
  explore: "py-14 md:py-16",
  editorial: "py-12 md:py-14",
  utility: "py-10 md:py-12",
  studio: "py-10 md:py-12 border-b border-[var(--color-gold-400)]/20",
};

export default function PageIntro({
  title,
  description,
  eyebrow,
  metadata,
  actions,
  icon,
  variant = "explore",
}: PageIntroProps) {
  const { lang, isRTL } = useLang();

  return (
    <header className={`bg-[var(--color-stone-900)] ${variantClasses[variant]}`}>
      <div className="container">
        {eyebrow && (
          <div className={`mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-gold-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] tracking-normal" : ""}`}>
            {eyebrow}
          </div>
        )}
        <div className={`flex items-start justify-between gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="min-w-0">
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              {icon && <span className="shrink-0 text-[var(--color-gold-400)]">{icon}</span>}
              <h1 className={`text-3xl md:text-5xl font-bold text-[var(--color-parchment-100)] ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
                {title}
              </h1>
            </div>
            {description && (
              <p className={`mt-3 max-w-3xl text-[var(--color-stone-400)] text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                {description}
              </p>
            )}
            {metadata && (
              <div className={`mt-4 text-sm text-[var(--color-stone-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                {metadata}
              </div>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
