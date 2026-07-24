import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu, Map, BookOpen, Compass, BarChart2, Zap, BookMarked,
  PenLine, Globe, Home, Layers, Blocks, Clock3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/_core/hooks/useAuth";
import { BRAND_LOGO_URL, startLogin } from "@/const";

interface NavItem {
  href: string;
  labelKey: string;
  labelEn: string;
  labelAr: string;
  icon: React.ReactNode;
}

interface NavGroup {
  labelEn: string;
  labelAr: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    labelEn: "Explore",
    labelAr: "استكشف",
    items: [
      { href: "/monuments", labelKey: "nav.monuments", labelEn: "Monuments", labelAr: "المعالم", icon: <BookOpen size={16} /> },
      { href: "/map", labelKey: "nav.map", labelEn: "Map", labelAr: "الخريطة", icon: <Map size={16} /> },
      { href: "/walks", labelKey: "nav.walks", labelEn: "Walks", labelAr: "الجولات", icon: <Compass size={16} /> },
      { href: "/periods", labelKey: "nav.periods", labelEn: "Periods", labelAr: "الحقب", icon: <Layers size={16} /> },
      { href: "/architecture", labelKey: "nav.architecture", labelEn: "Architecture", labelAr: "العمارة", icon: <Blocks size={16} /> },
      { href: "/timeline", labelKey: "nav.timeline", labelEn: "Timeline", labelAr: "الخط الزمني", icon: <Clock3 size={16} /> },
    ],
  },
  {
    labelEn: "Learn",
    labelAr: "تعلّم",
    items: [
      { href: "/stories", labelKey: "nav.stories", labelEn: "Stories", labelAr: "القصص", icon: <BookMarked size={16} /> },
      { href: "/compare", labelKey: "nav.compare", labelEn: "Compare", labelAr: "مقارنة", icon: <BarChart2 size={16} /> },
      { href: "/detective", labelKey: "nav.play", labelEn: "Play", labelAr: "اكتشف", icon: <Zap size={16} /> },
    ],
  },
  {
    labelEn: "Plan",
    labelAr: "خطط",
    items: [
      { href: "/itinerary", labelKey: "nav.itinerary", labelEn: "Itinerary", labelAr: "خطة الزيارة", icon: <PenLine size={16} /> },
      { href: "/notebook", labelKey: "nav.notebook", labelEn: "Notebook", labelAr: "مفكرتي", icon: <BookOpen size={16} /> },
    ],
  },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { lang, toggleLang, isRTL, t } = useLang();
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = location === "/";
  const isStudio = location.startsWith("/studio");
  const isNavItemActive = (href: string) => location === href || location.startsWith(`${href}/`);

  return (
    <div className={`min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]`} dir={isRTL ? "rtl" : "ltr"}>
      <a
        href="#main-content"
        className="absolute left-4 top-2 z-[60] -translate-y-24 rounded bg-[var(--color-stone-950)] px-4 py-3 text-sm font-medium text-white transition-transform focus:translate-y-0 rtl:left-auto rtl:right-4"
      >
        {t("Skip to main content", "انتقل إلى المحتوى الرئيسي")}
      </a>

      {/* ── Navigation Header ── */}
      <header className={`sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-sm ${isHome ? "bg-[var(--color-stone-950)]/90 border-[var(--color-stone-800)]" : ""}`}>
        <div className="container">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link
              href="/"
              aria-label={t("Minarets of Cairo home", "الرئيسية — مآذن القاهرة")}
              className="flex items-center gap-2 shrink-0"
            >
              <img
                src={`${BRAND_LOGO_URL}?tr=w-96,h-96,q-85,f-auto`}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-sm object-cover"
              />
              <div className="hidden sm:block">
                <div className={`font-[var(--font-serif)] font-semibold text-sm leading-tight ${isHome ? "text-[var(--color-parchment-100)]" : "text-[var(--color-stone-900)]"}`}>
                  {lang === "ar" ? "مآذن القاهرة" : "Minarets of Cairo"}
                </div>
                <div className={`text-xs leading-tight ${isHome ? "text-[var(--color-stone-400)]" : "text-[var(--color-stone-500)]"}`}>
                  {lang === "ar" ? "دليل التراث الإسلامي" : "Islamic Heritage Companion"}
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav aria-label={t("Primary navigation", "التنقل الرئيسي")} className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navGroups.map(group => {
                const isGroupActive = group.items.some(item => location === item.href || location.startsWith(`${item.href}/`));
                return (
                  <DropdownMenu key={group.labelEn}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-150 ${
                          isGroupActive
                            ? "bg-[var(--color-terracotta-600)] text-white"
                            : isHome
                              ? "text-[var(--color-stone-300)] hover:text-white hover:bg-[var(--color-stone-800)]"
                              : "text-[var(--color-stone-600)] hover:text-[var(--color-stone-900)] hover:bg-[var(--color-parchment-200)]"
                        }`}
                      >
                        {lang === "ar" ? group.labelAr : group.labelEn}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? "end" : "start"}>
                      <div dir={isRTL ? "rtl" : "ltr"}>
                        {group.items.map(item => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="flex min-h-11 items-center gap-2">
                              {item.icon}
                              {lang === "ar" ? item.labelAr : item.labelEn}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
              {user?.role === "admin" && (
                <Link href="/studio">
                  <span className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    isStudio
                      ? "bg-[var(--color-gold-400)]/20 text-[var(--color-gold-500)]"
                      : isHome
                        ? "text-[var(--color-stone-300)] hover:text-white hover:bg-[var(--color-stone-800)]"
                        : "text-[var(--color-stone-600)] hover:text-[var(--color-stone-900)] hover:bg-[var(--color-parchment-200)]"
                  }`}>
                    {t("Studio", "الاستوديو")}
                  </span>
                </Link>
              )}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language toggle */}
              <button
                onClick={toggleLang}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border transition-colors duration-150
                  ${isHome
                    ? "border-[var(--color-stone-700)] text-[var(--color-stone-300)] hover:bg-[var(--color-stone-800)]"
                    : "border-[var(--color-border)] text-[var(--color-stone-600)] hover:bg-[var(--color-parchment-200)]"
                  }`}
                aria-label="Toggle language"
              >
                <Globe size={14} />
                <span>{lang === "ar" ? "EN" : "عربي"}</span>
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <Link href="/notebook">
                  <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150 cursor-pointer
                    ${isHome
                      ? "text-[var(--color-stone-300)] hover:bg-[var(--color-stone-800)]"
                      : "text-[var(--color-stone-600)] hover:bg-[var(--color-parchment-200)]"
                    }`}>
                    {user?.name?.split(" ")[0] ?? t("Account", "حساب")}
                  </span>
                </Link>
              ) : (
                <button
                  onClick={() => startLogin()}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150
                    ${isHome
                      ? "text-[var(--color-stone-300)] hover:bg-[var(--color-stone-800)]"
                      : "text-[var(--color-stone-600)] hover:bg-[var(--color-parchment-200)]"
                    }`}
                >
                  {t("Sign In", "تسجيل الدخول")}
                </button>
              )}

              {/* Admin link */}
              {user?.role === "admin" && (
                <Link href="/studio">
                  <span className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[var(--color-gold-400)]/20 text-[var(--color-gold-500)] hover:bg-[var(--color-gold-400)]/30 transition-colors cursor-pointer`}>
                    Studio
                  </span>
                </Link>
              )}

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className={`lg:hidden p-2 rounded ${isHome ? "text-[var(--color-stone-300)]" : "text-[var(--color-stone-600)]"}`} aria-label="Open menu">
                    <Menu size={20} />
                  </button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "right" : "left"} className="w-72 bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
                  <div className="flex flex-col gap-1 mt-8">
                    <Link href="/" onClick={() => setMobileOpen(false)}>
                      <span className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[var(--color-stone-600)] hover:bg-[var(--color-parchment-200)] cursor-pointer">
                        <Home size={16} />
                        {t("Home", "الرئيسية")}
                      </span>
                    </Link>
                    {navGroups.map(group => (
                      <div key={group.labelEn} className="mb-3">
                        <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-stone-400)]">
                          {lang === "ar" ? group.labelAr : group.labelEn}
                        </p>
                        {group.items.map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                            <span className={`flex min-h-11 items-center gap-3 px-3 py-2.5 rounded text-sm font-medium cursor-pointer transition-colors
                              ${isNavItemActive(item.href)
                                ? "bg-[var(--color-terracotta-600)] text-white"
                                : "text-[var(--color-stone-600)] hover:bg-[var(--color-parchment-200)]"
                              }`}>
                              {item.icon}
                              {lang === "ar" ? item.labelAr : item.labelEn}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ))}
                    <div className="border-t border-[var(--color-border)] mt-2 pt-2">
                      {!isAuthenticated && (
                        <button
                          onClick={() => { startLogin(); setMobileOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[var(--color-stone-600)] hover:bg-[var(--color-parchment-200)] w-full"
                        >
                          {t("Sign In", "تسجيل الدخول")}
                        </button>
                      )}
                      {user?.role === "admin" && (
                        <Link href="/studio" onClick={() => setMobileOpen(false)}>
                          <span className={`flex min-h-11 items-center gap-3 px-3 py-2.5 rounded text-sm font-medium text-[var(--color-gold-500)] hover:bg-[var(--color-parchment-200)] cursor-pointer ${isStudio ? "bg-[var(--color-parchment-200)]" : ""}`}>
                            {t("Studio", "الاستوديو")}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus-visible:outline-2 focus-visible:outline-[var(--color-terracotta-500)] focus-visible:outline-offset-2">
        {children}
      </main>

      {/* ── Footer ── */}
      {!isStudio && (
        <footer className="bg-[var(--color-stone-950)] text-[var(--color-stone-400)] border-t border-[var(--color-stone-800)]">
          <div className="container py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={`${BRAND_LOGO_URL}?tr=w-128,h-128,q-85,f-auto`}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="h-14 w-14 rounded-sm object-cover"
                  />
                  <span className="font-[var(--font-serif)] text-[var(--color-parchment-200)] font-semibold">
                    {lang === "ar" ? "مآذن القاهرة" : "Minarets of Cairo"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">
                  {t("A visual companion to Islamic Cairo", "دليل بصري للقاهرة الإسلامية")}
                </p>
                <p className="text-xs mt-2 text-[var(--color-stone-500)]">
                  {t("Practical information may change. Always verify before visiting.", "قد تتغير المعلومات العملية. تحقق دائماً قبل الزيارة.")}
                </p>
              </div>
              <div>
                <h4 className="text-[var(--color-parchment-300)] font-medium mb-3 text-sm">{t("Monuments", "المعالم")}</h4>
                <div className="flex flex-col gap-1.5 text-sm">
                  <Link href="/monuments"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("Monuments", "المعالم")}</span></Link>
                  <Link href="/map"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("Map", "الخريطة")}</span></Link>
                  <Link href="/walks"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("Walks", "الجولات")}</span></Link>
                  <Link href="/periods"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("Periods", "الحقب")}</span></Link>
                </div>
              </div>
              <div>
                <h4 className="text-[var(--color-parchment-300)] font-medium mb-3 text-sm">{t("About", "حول")}</h4>
                <div className="flex flex-col gap-1.5 text-sm">
                  <Link href="/stories"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("Stories", "القصص")}</span></Link>
                  <Link href="/compare"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("Compare", "مقارنة")}</span></Link>
                  <Link href="/detective"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("Play Detective", "اكتشف")}</span></Link>
                  <Link href="/notebook"><span className="hover:text-[var(--color-parchment-200)] cursor-pointer transition-colors">{t("My Notebook", "مفكرتي")}</span></Link>
                </div>
              </div>
            </div>
            <div className="border-t border-[var(--color-stone-800)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--color-stone-500)]">
              <span>© 2025 Minarets of Cairo | مآذن القاهرة</span>
              <span>{t("Source Methodology", "منهجية المصادر")}</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
