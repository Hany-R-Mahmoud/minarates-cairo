import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Lock, BookOpen, Image, FileText, History, CheckCircle, XCircle, Eye, EyeOff, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import PageIntro from "@/components/PageIntro";

export default function CuratorStudio() {
  const { lang, isRTL, t } = useLang();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
        <PageIntro
          variant="studio"
          title={t("Curator Studio", "استوديو المنسق")}
        />
        <div className="container py-20 text-center">
          <Lock size={40} className="mx-auto text-[var(--color-stone-300)] mb-4" />
          <p className={`text-[var(--color-stone-500)] mb-6 ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Sign in with a curator account to access the studio.", "سجّل الدخول بحساب منسق للوصول إلى الاستوديو.")}
          </p>
          <Button onClick={() => startLogin()} className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)]">
            {t("Sign In", "تسجيل الدخول")}
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="page-enter min-h-screen bg-[var(--color-background)] flex items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center">
          <Lock size={40} className="mx-auto text-[var(--color-stone-300)] mb-4" />
          <p className={`text-[var(--color-stone-500)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Curator access required.", "مطلوب صلاحية المنسق.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <PageIntro
        variant="studio"
        icon={<BookOpen size={24} />}
        title={t("Curator Studio", "استوديو المنسق")}
        description={t("Manage places, media, sources, and review publication workflow", "إدارة الأماكن والوسائط والمصادر ومراجعة سير عمل النشر")}
      />

      <div className="container py-8">
        <Tabs defaultValue="places" dir={isRTL ? "rtl" : "ltr"}>
          <TabsList className="mb-6 bg-[var(--color-parchment-200)] flex-wrap h-auto gap-1">
            <TabsTrigger value="places" className={`data-[state=active]:bg-white ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              {t("Places", "الأماكن")}
            </TabsTrigger>
            <TabsTrigger value="media" className={`data-[state=active]:bg-white ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              <Image size={12} className="mr-1" />
              {t("Media", "الوسائط")}
            </TabsTrigger>
            <TabsTrigger value="sources" className={`data-[state=active]:bg-white ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              <FileText size={12} className="mr-1" />
              {t("Sources", "المصادر")}
            </TabsTrigger>
            <TabsTrigger value="audit" className={`data-[state=active]:bg-white ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              <History size={12} className="mr-1" />
              {t("Audit Log", "سجل التدقيق")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="places"><PlacesTab /></TabsContent>
          <TabsContent value="media"><MediaTab /></TabsContent>
          <TabsContent value="sources"><SourcesTab /></TabsContent>
          <TabsContent value="audit"><AuditTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PlacesTab() {
  const { lang, isRTL, t } = useLang();
  const utils = trpc.useUtils();
  const { data: allPlaces, isLoading } = trpc.places.list.useQuery({ limit: 100, offset: 0 });

  const publishPlace = trpc.curator.publishPlace.useMutation({
    onSuccess: () => { toast.success(t("Place published!", "تم نشر المكان!")); utils.places.list.invalidate(); },
  });
  const unpublishPlace = trpc.curator.unpublishPlace.useMutation({
    onSuccess: () => { toast.success(t("Place unpublished.", "تم إلغاء نشر المكان.")); utils.places.list.invalidate(); },
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-parchment-200)]">
              <th className={`p-3 text-left text-xs font-semibold text-[var(--color-stone-600)] uppercase tracking-wide ${isRTL ? "text-right" : ""}`}>{t("Name", "الاسم")}</th>
              <th className={`p-3 text-left text-xs font-semibold text-[var(--color-stone-600)] uppercase tracking-wide ${isRTL ? "text-right" : ""}`}>{t("Status", "الحالة")}</th>
              <th className={`p-3 text-left text-xs font-semibold text-[var(--color-stone-600)] uppercase tracking-wide ${isRTL ? "text-right" : ""}`}>{t("Type", "النوع")}</th>
              <th className="p-3 text-xs font-semibold text-[var(--color-stone-600)] uppercase tracking-wide">{t("Actions", "الإجراءات")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-6 text-center text-[var(--color-stone-400)]">{t("Loading...", "جارٍ التحميل...")}</td></tr>
            ) : (allPlaces?.items ?? []).map(place => (
              <tr key={place.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-parchment-100)]">
                <td className={`p-3 ${isRTL ? "text-right" : ""}`}>
                  <p className={`font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                    {lang === "ar" ? place.nameAr : place.nameEn}
                  </p>
                  <p className="text-xs text-[var(--color-stone-400)]">{place.slug}</p>
                </td>
                <td className="p-3">
                  <Badge variant={place.status === "published" ? "default" : "secondary"} className={place.status === "published" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                    {place.status}
                  </Badge>
                </td>
                <td className={`p-3 text-xs text-[var(--color-stone-500)] ${isRTL ? "text-right" : ""}`}>{place.placeTypeId ? `Type ${place.placeTypeId}` : "—"}</td>
                <td className="p-3">
                  <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                    {place.status === "draft" ? (
                      <Button size="sm" variant="outline" onClick={() => publishPlace.mutate({ id: place.id })} className="text-green-700 border-green-300 hover:bg-green-50 text-xs h-7">
                        <Eye size={11} className="mr-1" />
                        {t("Publish", "نشر")}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => unpublishPlace.mutate({ id: place.id })} className="text-amber-700 border-amber-300 hover:bg-amber-50 text-xs h-7">
                        <EyeOff size={11} className="mr-1" />
                        {t("Unpublish", "إلغاء النشر")}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MediaTab() {
  const { lang, isRTL, t } = useLang();
  const [url, setUrl] = useState("");
  const [altEn, setAltEn] = useState("");
  const [attribution, setAttribution] = useState("");
  const utils = trpc.useUtils();

  const { data: media, isLoading } = trpc.curator.listMedia.useQuery();
  const addMedia = trpc.curator.addMedia.useMutation({
    onSuccess: () => {
      toast.success(t("Media added!", "تمت إضافة الوسائط!"));
      setUrl(""); setAltEn(""); setAttribution("");
      utils.curator.listMedia.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      {/* Add media form */}
      <div className="notebook-card space-y-3">
        <h3 className={`font-semibold text-[var(--color-stone-900)] text-sm ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>
          {t("Ingest Media Asset", "استيراد أصل وسائط")}
        </h3>
        <label htmlFor="curator-media-url" className="text-sm font-medium text-[var(--color-stone-700)]">
          {t("Image URL", "رابط الصورة")}
        </label>
        <Input id="curator-media-url" placeholder={t("Image URL (Wikimedia Commons, Openverse...)", "رابط الصورة...")} value={url} onChange={e => setUrl(e.target.value)} className="bg-white border-[var(--color-border)]" />
        <label htmlFor="curator-media-alt" className="text-sm font-medium text-[var(--color-stone-700)]">
          {t("Alt text (English)", "النص البديل (إنجليزي)")}
        </label>
        <Input id="curator-media-alt" placeholder={t("Alt text (English)", "النص البديل (إنجليزي)")} value={altEn} onChange={e => setAltEn(e.target.value)} className="bg-white border-[var(--color-border)]" />
        <label htmlFor="curator-media-attribution" className="text-sm font-medium text-[var(--color-stone-700)]">
          {t("Attribution / License", "الإسناد / الترخيص")}
        </label>
        <Input id="curator-media-attribution" placeholder={t("Attribution / License", "الإسناد / الترخيص")} value={attribution} onChange={e => setAttribution(e.target.value)} className="bg-white border-[var(--color-border)]" />
        <Button
          size="sm"
          onClick={() => url && altEn && addMedia.mutate({ url, altEn, attribution: attribution || undefined })}
          disabled={!url || !altEn}
          className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)]"
        >
          <Plus size={13} className="mr-1" />
          {t("Add Media", "إضافة وسائط")}
        </Button>
      </div>

      {/* Media list */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-32 rounded" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(media ?? []).map((asset: any) => (
            <div key={asset.id} className="monument-card overflow-hidden">
              <div className="h-28 bg-[var(--color-stone-200)] overflow-hidden">
                <img src={asset.url} alt={asset.altEn} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="p-2">
                <p className="text-xs text-[var(--color-stone-600)] truncate">{asset.altEn}</p>
                {asset.attribution && <p className="text-xs text-[var(--color-stone-400)] truncate mt-0.5">{asset.attribution}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesTab() {
  const { lang, isRTL, t } = useLang();
  const [slug, setSlug] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const utils = trpc.useUtils();

  const { data: sources, isLoading } = trpc.curator.listSources.useQuery();
  const addSource = trpc.curator.addSource.useMutation({
    onSuccess: () => {
      toast.success(t("Source added!", "تمت إضافة المصدر!"));
      setSlug(""); setTitleEn(""); setAuthors(""); setYear("");
      utils.curator.listSources.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      <div className="notebook-card space-y-3">
        <h3 className={`font-semibold text-[var(--color-stone-900)] text-sm ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>
          {t("Register Source", "تسجيل مصدر")}
        </h3>
        <label htmlFor="curator-source-slug" className="text-sm font-medium text-[var(--color-stone-700)]">
          {t("Slug", "المعرف")}
        </label>
        <Input id="curator-source-slug" placeholder={t("Slug (e.g. creswell-1952)", "المعرف (مثال: creswell-1952)")} value={slug} onChange={e => setSlug(e.target.value)} className="bg-white border-[var(--color-border)]" />
        <label htmlFor="curator-source-title" className="text-sm font-medium text-[var(--color-stone-700)]">
          {t("Title (English)", "العنوان (إنجليزي)")}
        </label>
        <Input id="curator-source-title" placeholder={t("Title (English)", "العنوان (إنجليزي)")} value={titleEn} onChange={e => setTitleEn(e.target.value)} className="bg-white border-[var(--color-border)]" />
        <label htmlFor="curator-source-authors" className="text-sm font-medium text-[var(--color-stone-700)]">
          {t("Authors", "المؤلفون")}
        </label>
        <Input id="curator-source-authors" placeholder={t("Authors", "المؤلفون")} value={authors} onChange={e => setAuthors(e.target.value)} className="bg-white border-[var(--color-border)]" />
        <label htmlFor="curator-source-year" className="text-sm font-medium text-[var(--color-stone-700)]">
          {t("Year", "السنة")}
        </label>
        <Input id="curator-source-year" placeholder={t("Year", "السنة")} value={year} onChange={e => setYear(e.target.value)} type="number" className="bg-white border-[var(--color-border)]" />
        <Button
          size="sm"
          onClick={() => slug && titleEn && addSource.mutate({ slug, titleEn, authors: authors || undefined, year: year ? parseInt(year) : undefined })}
          disabled={!slug || !titleEn}
          className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)]"
        >
          <Plus size={13} className="mr-1" />
          {t("Add Source", "إضافة مصدر")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
      ) : (
        <div className="space-y-2">
          {(sources ?? []).map((src: any) => (
            <div key={src.id} className={`flex items-center gap-3 p-3 bg-white border border-[var(--color-border)] rounded-lg ${isRTL ? "flex-row-reverse" : ""}`}>
              <FileText size={14} className="text-[var(--color-stone-400)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-[var(--color-stone-800)] truncate ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>{src.titleEn}</p>
                <p className="text-xs text-[var(--color-stone-400)]">{src.authors} {src.year ? `(${src.year})` : ""}</p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">{src.sourceType ?? "academic"}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditTab() {
  const { lang, isRTL, t } = useLang();
  const { data: logs, isLoading, refetch } = trpc.curator.getAuditLog.useQuery({ limit: 100 });

  const ACTION_COLORS: Record<string, string> = {
    publish: "bg-green-100 text-green-700",
    unpublish: "bg-amber-100 text-amber-700",
    create: "bg-blue-100 text-blue-700",
    update: "bg-purple-100 text-purple-700",
    delete: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
        <h3 className={`font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>
          {t("Full Audit History", "سجل التدقيق الكامل")}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-[var(--color-stone-400)]">
          <RefreshCw size={13} className="mr-1" />
          {t("Refresh", "تحديث")}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 rounded" />)}</div>
      ) : (logs ?? []).length === 0 ? (
        <div className="text-center py-12 text-[var(--color-stone-400)]">
          <History size={36} className="mx-auto mb-3 opacity-30" />
          <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>{t("No audit entries yet.", "لا توجد إدخالات تدقيق بعد.")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(logs ?? []).map((log: any) => (
            <div key={log.id} className={`flex items-start gap-3 p-3 bg-white border border-[var(--color-border)] rounded-lg ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                    {log.action}
                  </span>
                  <span className="text-xs text-[var(--color-stone-500)]">{log.entityType} #{log.entityId}</span>
                </div>
                {log.afterData?.summary && (
                  <p className="text-xs text-[var(--color-stone-400)] mt-1">{log.afterData.summary}</p>
                )}
              </div>
              <span className="text-xs text-[var(--color-stone-400)] shrink-0 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
