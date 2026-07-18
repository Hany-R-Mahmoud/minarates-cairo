import { useState } from "react";
import { Link } from "wouter";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Heart, BookOpen, StickyNote, Download, Lock, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Notebook() {
  const { lang, isRTL, t } = useLang();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
        <div className="bg-[var(--color-stone-900)] py-16">
          <div className="container">
            <h1 className={`text-4xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
              {t("My Notebook", "دفتر ملاحظاتي")}
            </h1>
          </div>
        </div>
        <div className="container py-20 text-center">
          <Lock size={40} className="mx-auto text-[var(--color-stone-300)] mb-4" />
          <p className={`text-[var(--color-stone-500)] mb-6 text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Sign in to access your personal notebook — favorites, notes, and visited records.", "سجّل الدخول للوصول إلى دفتر ملاحظاتك الشخصي — المفضلة والملاحظات والسجلات.")}
          </p>
          <Button onClick={() => startLogin()} className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)]">
            {t("Sign In", "تسجيل الدخول")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="bg-[var(--color-stone-900)] py-16">
        <div className="container">
          <h1 className={`text-4xl md:text-5xl font-bold text-[var(--color-parchment-100)] mb-3 ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
            {t("My Notebook", "دفتر ملاحظاتي")}
          </h1>
          <p className={`text-[var(--color-stone-400)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Your personal space for favorites, notes, and visited places", "مساحتك الشخصية للمفضلة والملاحظات والأماكن التي زرتها")}
          </p>
        </div>
      </div>

      <div className="container py-10">
        <Tabs defaultValue="favorites" dir={isRTL ? "rtl" : "ltr"}>
          <TabsList className="mb-6 bg-[var(--color-parchment-200)]">
            <TabsTrigger value="favorites" className={`data-[state=active]:bg-white ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              <Heart size={13} className="mr-1" />
              {t("Favorites", "المفضلة")}
            </TabsTrigger>
            <TabsTrigger value="notes" className={`data-[state=active]:bg-white ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              <StickyNote size={13} className="mr-1" />
              {t("Notes", "الملاحظات")}
            </TabsTrigger>
            <TabsTrigger value="visited" className={`data-[state=active]:bg-white ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
              <Star size={13} className="mr-1" />
              {t("Visited", "زرت")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            <FavoritesTab />
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab />
          </TabsContent>
          <TabsContent value="visited">
            <VisitedTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FavoritesTab() {
  const { lang, isRTL, t } = useLang();
  const { data: favorites, isLoading } = trpc.notebook.getFavorites.useQuery();
  const utils = trpc.useUtils();

  const removeFavorite = trpc.notebook.toggleFavorite.useMutation({
    onSuccess: () => {
      toast.success(t("Removed from favorites.", "تمت الإزالة من المفضلة."));
      utils.notebook.getFavorites.invalidate();
    },
  });

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded" />)}</div>;

  if (!favorites?.length) {
    return (
      <div className="text-center py-16 text-[var(--color-stone-400)]">
        <Heart size={36} className="mx-auto mb-3 opacity-30" />
        <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
          {t("No favorites yet. Heart a monument to save it here.", "لا توجد مفضلة بعد. انقر على القلب في أي معلم لحفظه هنا.")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map(fav => (
        <div key={fav.id} className="monument-card p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <Link href={`/monuments/${(fav as any).placeSlug ?? ""}`}>
              <p className={`text-sm font-medium text-[var(--color-stone-800)] hover:text-[var(--color-terracotta-600)] cursor-pointer truncate ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                {lang === "ar" ? (fav as any).placeNameAr : (fav as any).placeNameEn}
              </p>
            </Link>
          </div>
          <button
            onClick={() => removeFavorite.mutate({ placeId: fav.placeId })}
            className="text-[var(--color-stone-300)] hover:text-red-500 transition-colors shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function NotesTab() {
  const { lang, isRTL, t } = useLang();
  const [newNote, setNewNote] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const { data: notes, isLoading } = trpc.notebook.getNotes.useQuery();
  const utils = trpc.useUtils();

  const addNote = trpc.notebook.upsertNote.useMutation({
    onSuccess: () => {
      toast.success(t("Note saved!", "تم حفظ الملاحظة!"));
      setNewNote("");
      setNewNoteTitle("");
      utils.notebook.getNotes.invalidate();
    },
  });

  const deleteNote = trpc.notebook.deleteNote.useMutation({
    onSuccess: () => {
      toast.success(t("Note deleted.", "تم حذف الملاحظة."));
      utils.notebook.getNotes.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      {/* Add note form */}
      <div className="notebook-card space-y-3">
        <h3 className={`font-semibold text-[var(--color-stone-900)] text-sm ${lang === "ar" ? "font-[var(--font-arabic)]" : ""}`}>
          {t("New Note", "ملاحظة جديدة")}
        </h3>
        <Input
          placeholder={t("Title (optional)", "العنوان (اختياري)")}
          value={newNoteTitle}
          onChange={e => setNewNoteTitle(e.target.value)}
          className={`bg-white border-[var(--color-border)] ${isRTL ? "text-right font-[var(--font-arabic-sans)]" : ""}`}
        />
        <Textarea
          placeholder={t("Write your private note here...", "اكتب ملاحظتك الخاصة هنا...")}
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          rows={3}
          className={`bg-white border-[var(--color-border)] resize-none ${isRTL ? "text-right font-[var(--font-arabic-sans)]" : ""}`}
        />
        <Button
          size="sm"
          onClick={() => newNote.trim() && addNote.mutate({ content: newNote.trim() })}
          disabled={!newNote.trim()}
          className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)]"
        >
          <Plus size={13} className="mr-1" />
          {t("Save Note", "حفظ الملاحظة")}
        </Button>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded" />)}</div>
      ) : (notes ?? []).length === 0 ? (
        <div className="text-center py-12 text-[var(--color-stone-400)]">
          <StickyNote size={36} className="mx-auto mb-3 opacity-30" />
          <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>{t("No notes yet.", "لا توجد ملاحظات بعد.")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(notes ?? []).map((note: any) => (
            <div key={note.id} className="notebook-card">
              <div className={`flex items-start justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="flex-1 min-w-0">
                  {note.title && (
                    <p className={`text-sm font-semibold text-[var(--color-stone-800)] mb-1 ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                      {note.title}
                    </p>
                  )}
                  <p className={`text-sm text-[var(--color-stone-600)] whitespace-pre-wrap ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                    {note.content}
                  </p>
                  <p className="text-xs text-[var(--color-stone-400)] mt-2">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteNote.mutate({ id: note.id })}
                  className="text-[var(--color-stone-300)] hover:text-red-500 transition-colors shrink-0 mt-0.5"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VisitedTab() {
  const { lang, isRTL, t } = useLang();
  const { data: visited, isLoading } = trpc.notebook.getVisited.useQuery();

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded" />)}</div>;

  if (!visited?.length) {
    return (
      <div className="text-center py-16 text-[var(--color-stone-400)]">
        <Star size={36} className="mx-auto mb-3 opacity-30" />
        <p className={lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}>
          {t("No visited places logged yet. Mark monuments as visited from their detail pages.", "لم تُسجَّل أماكن مزارة بعد. علّم المعالم كمزارة من صفحات تفاصيلها.")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {visited.map((v: any) => (
        <div key={v.id} className="monument-card p-4">
          <Link href={`/monuments/${(v as any).placeSlug ?? ""}`}>
            <p className={`text-sm font-medium text-[var(--color-stone-800)] hover:text-[var(--color-terracotta-600)] cursor-pointer ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
              {lang === "ar" ? (v as any).placeNameAr : (v as any).placeNameEn}
            </p>
          </Link>
          <p className="text-xs text-[var(--color-stone-400)] mt-1">
            {t("Visited", "زرت")} {v.visitedAt ? new Date(v.visitedAt).toLocaleDateString() : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
