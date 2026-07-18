import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

interface LanguageContextValue {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ============================================================
// Translations
// ============================================================

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.monuments": "Monuments",
    "nav.walks": "Walks",
    "nav.map": "Map",
    "nav.stories": "Stories",
    "nav.compare": "Compare",
    "nav.play": "Play",
    "nav.itinerary": "Itinerary",
    "nav.notebook": "Notebook",
    "nav.studio": "Studio",
    "nav.periods": "Periods",
    "nav.search": "Search",
    "nav.language": "العربية",

    // Home
    "home.tagline": "Walk through a thousand years of stone, wood, light, and sound.",
    "home.tagline.sub": "Discover Islamic Cairo — its monuments, streets, patrons, and living heritage.",
    "home.explore": "Explore Monuments",
    "home.walks": "Plan a Walk",
    "home.stories": "Read Stories",
    "home.compare": "Compare Eras",
    "home.play": "Play Detective",
    "home.periods.title": "A Thousand Years of Cairo",
    "home.periods.subtitle": "Explore the dynasties that shaped the city",

    // Periods
    "period.tulunid": "Tulunid",
    "period.fatimid": "Fatimid",
    "period.ayyubid": "Ayyubid",
    "period.mamluk": "Mamluk",
    "period.ottoman": "Ottoman",
    "period.19c": "19th Century",
    "period.rashidun": "Rashidun & Umayyad",
    "period.abbasid": "Abbasid",
    "period.mamluk-bahri": "Bahri Mamluk",
    "period.mamluk-burji": "Burji Mamluk",
    "period.ottoman-early": "Early Ottoman",
    "period.ottoman-late": "Late Ottoman",
    "period.muhammad-ali": "Muhammad Ali",
    "period.modern": "Modern Conservation",

    // Monuments
    "monuments.title": "Monuments of Islamic Cairo",
    "monuments.subtitle": "48 published places across a thousand years",
    "monuments.filter.all": "All Periods",
    "monuments.filter.era": "Filter by Era",
    "monuments.filter.type": "Filter by Type",
    "monuments.filter.district": "Filter by District",
    "monuments.search.placeholder": "Search monuments...",
    "monuments.count": "{count} monuments",
    "monuments.founded": "Founded",
    "monuments.period": "Period",
    "monuments.type": "Type",
    "monuments.district": "District",
    "monuments.patron": "Patron / Founder",
    "monuments.function.original": "Original Function",
    "monuments.function.current": "Current Function",
    "monuments.brief": "History Brief",
    "monuments.phases": "Architectural Phases",
    "monuments.keydates": "Key Dates",
    "monuments.nearby": "Nearby Places",
    "monuments.sources": "Sources",
    "monuments.clarification": "Do Not Misunderstand",
    "monuments.worship.active": "Active Place of Worship",
    "monuments.worship.note": "This is an active place of worship. Please observe appropriate etiquette.",
    "monuments.stale": "Practical information may be outdated. Verify before visiting.",

    // Walks
    "walks.title": "District Walks",
    "walks.subtitle": "18 curated routes through Islamic Cairo",
    "walks.duration": "Duration",
    "walks.distance": "Distance",
    "walks.difficulty": "Difficulty",
    "walks.stops": "Stops",
    "walks.download": "Download Offline",
    "walks.accessibility": "Accessibility",
    "walks.worship.stops": "Active Worship Stops",
    "walks.stale.warning": "Some practical information on this walk may be outdated.",
    "walks.difficulty.easy": "Easy",
    "walks.difficulty.moderate": "Moderate",
    "walks.difficulty.challenging": "Challenging",

    // Map
    "map.title": "Interactive Map",
    "map.list.view": "List View",
    "map.map.view": "Map View",
    "map.filter.era": "Filter by Era",
    "map.filter.district": "Filter by District",
    "map.unavailable": "Map unavailable. Showing list view.",

    // Compare
    "compare.title": "Compare Monuments",
    "compare.subtitle": "Place monuments side by side across centuries",
    "compare.add": "Add Monument",
    "compare.remove": "Remove",
    "compare.max": "Maximum 4 monuments",
    "compare.min": "Select at least 2 monuments to compare",
    "compare.explanation": "Editorial Explanation",

    // Detective
    "detective.title": "Visual Detective",
    "detective.subtitle": "Learn to read Islamic Cairo through observation",
    "detective.start": "Start Activity",
    "detective.next": "Next",
    "detective.reveal": "Reveal Answer",
    "detective.correct": "Correct",
    "detective.try.again": "Try Again",
    "detective.explanation": "Explanation",

    // Stories
    "stories.title": "Visual Stories",
    "stories.subtitle": "Deep dives into Cairo's architectural and urban history",
    "stories.read": "Read Story",

    // Itinerary
    "itinerary.title": "Build Your Itinerary",
    "itinerary.days": "Number of Days",
    "itinerary.pace": "Pace",
    "itinerary.pace.leisurely": "Leisurely",
    "itinerary.pace.moderate": "Moderate",
    "itinerary.pace.intensive": "Intensive",
    "itinerary.interests": "Interests",
    "itinerary.accessibility": "Accessibility Needs",
    "itinerary.worship": "Include Active Worship Sites",
    "itinerary.family": "Family Mode",
    "itinerary.indoor": "Prefer Indoor Venues",
    "itinerary.generate": "Build Itinerary",
    "itinerary.stale.warning": "This itinerary includes places with potentially outdated practical information. Verify opening hours before visiting.",
    "itinerary.worship.warning": "This itinerary includes active places of worship. Please observe appropriate etiquette.",

    // Notebook
    "notebook.title": "My Notebook",
    "notebook.favorites": "Favorites",
    "notebook.collections": "Collections",
    "notebook.notes": "Notes",
    "notebook.visited": "Visited",
    "notebook.offline": "Offline Packs",
    "notebook.add.favorite": "Add to Favorites",
    "notebook.remove.favorite": "Remove from Favorites",
    "notebook.add.note": "Add Note",
    "notebook.mark.visited": "Mark as Visited",
    "notebook.sync": "Sync with Account",
    "notebook.export": "Export Data",
    "notebook.guest.note": "Your notebook is saved locally. Sign in to sync across devices.",

    // Studio
    "studio.title": "Curator Studio",
    "studio.dashboard": "Dashboard",
    "studio.places": "Places",
    "studio.sources": "Sources",
    "studio.media": "Media",
    "studio.walks": "Walks",
    "studio.comparisons": "Comparisons",
    "studio.activities": "Activities",
    "studio.audit": "Audit History",
    "studio.publish": "Publish",
    "studio.draft": "Draft",
    "studio.review": "In Review",
    "studio.published": "Published",

    // Common
    "common.loading": "Loading...",
    "common.error": "Something went wrong",
    "common.retry": "Try Again",
    "common.close": "Close",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.see.all": "See All",
    "common.learn.more": "Learn More",
    "common.source": "Source",
    "common.attribution": "Attribution",
    "common.license": "License",
    "common.image.credit": "Image Credit",
    "common.verified": "Verified",
    "common.tradition": "Tradition",
    "common.legend": "Legend",
    "common.ce": "CE",
    "common.century": "century",
    "common.centuries": "centuries",
    "common.signin": "Sign In",
    "common.signout": "Sign Out",
    "common.account": "Account",
    "common.offline": "Offline",
    "common.online": "Online",
    "common.download": "Download",
    "common.share": "Share",
    "common.report": "Report an Issue",

    // Footer
    "footer.about": "About",
    "footer.methodology": "Source Methodology",
    "footer.credits": "Image Credits",
    "footer.accessibility": "Accessibility",
    "footer.privacy": "Privacy",
    "footer.report": "Report an Issue",
    "footer.tagline": "A visual companion to Islamic Cairo",
    "footer.disclaimer": "Practical information may change. Always verify before visiting.",
  },
  ar: {
    // Nav
    "nav.home": "الرئيسية",
    "nav.monuments": "المعالم",
    "nav.walks": "الجولات",
    "nav.map": "الخريطة",
    "nav.stories": "القصص",
    "nav.compare": "المقارنة",
    "nav.play": "اكتشف",
    "nav.itinerary": "خطة الزيارة",
    "nav.notebook": "مفكرتي",
    "nav.studio": "الاستوديو",
    "nav.periods": "الحقب التاريخية",
    "nav.search": "بحث",
    "nav.language": "English",

    // Home
    "home.tagline": "رحلة عبر ألف عام من الحجر والخشب والضوء والصوت.",
    "home.tagline.sub": "اكتشف القاهرة الإسلامية — معالمها وشوارعها وأصحاب العمائر وتراثها الحي.",
    "home.explore": "استكشف المعالم",
    "home.walks": "خطط لجولة",
    "home.stories": "اقرأ القصص",
    "home.compare": "قارن الحقب",
    "home.play": "العب المحقق",
    "home.periods.title": "ألف عام من القاهرة",
    "home.periods.subtitle": "استكشف الأسرات الحاكمة التي شكّلت المدينة",

    // Periods
    "period.tulunid": "الطولونيون",
    "period.fatimid": "الفاطميون",
    "period.ayyubid": "الأيوبيون",
    "period.mamluk": "المماليك",
    "period.ottoman": "العثمانيون",
    "period.19c": "القرن التاسع عشر",
    "period.rashidun": "الراشدون والأمويون",
    "period.abbasid": "العباسيون",
    "period.mamluk-bahri": "المماليك البحرية",
    "period.mamluk-burji": "المماليك البرجية",
    "period.ottoman-early": "العثمانيون المبكرون",
    "period.ottoman-late": "العثمانيون المتأخرون",
    "period.muhammad-ali": "أسرة محمد علي",
    "period.modern": "الصون الحديث",

    // Monuments
    "monuments.title": "معالم القاهرة الإسلامية",
    "monuments.subtitle": "٤٨ موقعاً منشوراً عبر ألف عام",
    "monuments.filter.all": "جميع الحقب",
    "monuments.filter.era": "تصفية حسب الحقبة",
    "monuments.filter.type": "تصفية حسب النوع",
    "monuments.filter.district": "تصفية حسب الحي",
    "monuments.search.placeholder": "ابحث عن معالم...",
    "monuments.count": "{count} معلم",
    "monuments.founded": "التأسيس",
    "monuments.period": "الحقبة",
    "monuments.type": "النوع",
    "monuments.district": "الحي",
    "monuments.patron": "الباني / المؤسس",
    "monuments.function.original": "الوظيفة الأصلية",
    "monuments.function.current": "الوظيفة الحالية",
    "monuments.brief": "نبذة تاريخية",
    "monuments.phases": "المراحل المعمارية",
    "monuments.keydates": "التواريخ الرئيسية",
    "monuments.nearby": "أماكن قريبة",
    "monuments.sources": "المصادر",
    "monuments.clarification": "لا تُساء الفهم",
    "monuments.worship.active": "مكان عبادة نشط",
    "monuments.worship.note": "هذا مكان عبادة نشط. يُرجى مراعاة آداب السلوك المناسبة.",
    "monuments.stale": "قد تكون المعلومات العملية قديمة. تحقق قبل الزيارة.",

    // Walks
    "walks.title": "جولات الأحياء",
    "walks.subtitle": "١٨ مسار منسق عبر القاهرة الإسلامية",
    "walks.duration": "المدة",
    "walks.distance": "المسافة",
    "walks.difficulty": "الصعوبة",
    "walks.stops": "المحطات",
    "walks.download": "تحميل للاستخدام دون اتصال",
    "walks.accessibility": "إمكانية الوصول",
    "walks.worship.stops": "محطات العبادة النشطة",
    "walks.stale.warning": "بعض المعلومات العملية في هذه الجولة قد تكون قديمة.",
    "walks.difficulty.easy": "سهل",
    "walks.difficulty.moderate": "متوسط",
    "walks.difficulty.challenging": "صعب",

    // Map
    "map.title": "الخريطة التفاعلية",
    "map.list.view": "عرض القائمة",
    "map.map.view": "عرض الخريطة",
    "map.filter.era": "تصفية حسب الحقبة",
    "map.filter.district": "تصفية حسب الحي",
    "map.unavailable": "الخريطة غير متاحة. عرض القائمة.",

    // Compare
    "compare.title": "مقارنة المعالم",
    "compare.subtitle": "ضع المعالم جنباً إلى جنب عبر القرون",
    "compare.add": "إضافة معلم",
    "compare.remove": "إزالة",
    "compare.max": "الحد الأقصى ٤ معالم",
    "compare.min": "اختر معلمين على الأقل للمقارنة",
    "compare.explanation": "الشرح التحريري",

    // Detective
    "detective.title": "المحقق البصري",
    "detective.subtitle": "تعلّم قراءة القاهرة الإسلامية من خلال الملاحظة",
    "detective.start": "ابدأ النشاط",
    "detective.next": "التالي",
    "detective.reveal": "اكشف الإجابة",
    "detective.correct": "صحيح",
    "detective.try.again": "حاول مجدداً",
    "detective.explanation": "الشرح",

    // Stories
    "stories.title": "القصص البصرية",
    "stories.subtitle": "تعمق في التاريخ المعماري والحضري للقاهرة",
    "stories.read": "اقرأ القصة",

    // Itinerary
    "itinerary.title": "بناء خطة زيارتك",
    "itinerary.days": "عدد الأيام",
    "itinerary.pace": "الوتيرة",
    "itinerary.pace.leisurely": "هادئة",
    "itinerary.pace.moderate": "معتدلة",
    "itinerary.pace.intensive": "مكثفة",
    "itinerary.interests": "الاهتمامات",
    "itinerary.accessibility": "احتياجات إمكانية الوصول",
    "itinerary.worship": "تضمين مواقع العبادة النشطة",
    "itinerary.family": "وضع العائلة",
    "itinerary.indoor": "تفضيل الأماكن المغلقة",
    "itinerary.generate": "بناء الخطة",
    "itinerary.stale.warning": "تتضمن هذه الخطة أماكن ذات معلومات عملية قد تكون قديمة. تحقق من مواعيد الفتح قبل الزيارة.",
    "itinerary.worship.warning": "تتضمن هذه الخطة أماكن عبادة نشطة. يُرجى مراعاة آداب السلوك المناسبة.",

    // Notebook
    "notebook.title": "مفكرتي",
    "notebook.favorites": "المفضلة",
    "notebook.collections": "المجموعات",
    "notebook.notes": "الملاحظات",
    "notebook.visited": "زرتها",
    "notebook.offline": "حزم عدم الاتصال",
    "notebook.add.favorite": "إضافة إلى المفضلة",
    "notebook.remove.favorite": "إزالة من المفضلة",
    "notebook.add.note": "إضافة ملاحظة",
    "notebook.mark.visited": "تحديد كزيارة",
    "notebook.sync": "مزامنة مع الحساب",
    "notebook.export": "تصدير البيانات",
    "notebook.guest.note": "مفكرتك محفوظة محلياً. سجّل الدخول للمزامنة عبر الأجهزة.",

    // Studio
    "studio.title": "استوديو الأمين",
    "studio.dashboard": "لوحة التحكم",
    "studio.places": "الأماكن",
    "studio.sources": "المصادر",
    "studio.media": "الوسائط",
    "studio.walks": "الجولات",
    "studio.comparisons": "المقارنات",
    "studio.activities": "الأنشطة",
    "studio.audit": "سجل التدقيق",
    "studio.publish": "نشر",
    "studio.draft": "مسودة",
    "studio.review": "قيد المراجعة",
    "studio.published": "منشور",

    // Common
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ ما",
    "common.retry": "حاول مجدداً",
    "common.close": "إغلاق",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.back": "رجوع",
    "common.next": "التالي",
    "common.previous": "السابق",
    "common.see.all": "عرض الكل",
    "common.learn.more": "اعرف أكثر",
    "common.source": "المصدر",
    "common.attribution": "الإسناد",
    "common.license": "الترخيص",
    "common.image.credit": "حقوق الصورة",
    "common.verified": "موثق",
    "common.tradition": "تقليد",
    "common.legend": "أسطورة",
    "common.ce": "م",
    "common.century": "قرن",
    "common.centuries": "قرون",
    "common.signin": "تسجيل الدخول",
    "common.signout": "تسجيل الخروج",
    "common.account": "الحساب",
    "common.offline": "غير متصل",
    "common.online": "متصل",
    "common.download": "تحميل",
    "common.share": "مشاركة",
    "common.report": "الإبلاغ عن مشكلة",

    // Footer
    "footer.about": "حول",
    "footer.methodology": "منهجية المصادر",
    "footer.credits": "حقوق الصور",
    "footer.accessibility": "إمكانية الوصول",
    "footer.privacy": "الخصوصية",
    "footer.report": "الإبلاغ عن مشكلة",
    "footer.tagline": "دليل بصري للقاهرة الإسلامية",
    "footer.disclaimer": "قد تتغير المعلومات العملية. تحقق دائماً قبل الزيارة.",
  },
};

// ============================================================
// Provider
// ============================================================

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("moc-language");
    return (saved as Language) || "en";
  });

  const direction: Direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem("moc-language", language);
  }, [language, direction]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[language];
      let text = dict[key] ?? translations["en"][key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{ language, direction, setLanguage, t, isRTL: direction === "rtl" }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

// Alias for convenience
export function useLang() {
  const ctx = useLanguage();
  return {
    lang: ctx.language,
    setLang: ctx.setLanguage,
    toggleLang: () => ctx.setLanguage(ctx.language === "en" ? "ar" : "en"),
    isRTL: ctx.isRTL,
    dir: ctx.direction,
    t: (en: string, ar: string) => ctx.language === "ar" ? ar : en,
    tKey: ctx.t,
  };
}
