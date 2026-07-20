import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Plus, MapPin, Calendar, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageIntro from "@/components/PageIntro";

export default function Itinerary() {
  const { lang, isRTL, t } = useLang();
  const { isAuthenticated } = useAuth();
  const [newName, setNewName] = useState("");
  const [selectedItinerary, setSelectedItinerary] = useState<number | null>(null);
  const [addPlaceId, setAddPlaceId] = useState<string>("");

  const utils = trpc.useUtils();
  const { data: itineraries, isLoading } = trpc.itinerary.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: placesData } = trpc.places.list.useQuery({ limit: 100, offset: 0, status: "published" });

  const createItinerary = trpc.itinerary.create.useMutation({
    onSuccess: () => {
      toast.success(t("Itinerary created!", "تم إنشاء خط السير!"));
      setNewName("");
      utils.itinerary.list.invalidate();
    },
  });

  const addStop = trpc.itinerary.addStop.useMutation({
    onSuccess: () => {
      toast.success(t("Stop added!", "تمت إضافة المحطة!"));
      setAddPlaceId("");
      utils.itinerary.list.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
        <PageIntro
          variant="utility"
          title={t("Itinerary Builder", "منشئ خط السير")}
        />
        <div className="container py-20 text-center">
          <Lock size={40} className="mx-auto text-[var(--color-stone-300)] mb-4" />
          <p className={`text-[var(--color-stone-500)] mb-6 text-lg ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("Sign in to create and save your personal itineraries.", "سجّل الدخول لإنشاء خطوط سيرك الشخصية وحفظها.")}
          </p>
          <Button onClick={() => startLogin()} className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)]">
            {t("Sign In", "تسجيل الدخول")}
          </Button>
        </div>
      </div>
    );
  }

  const places = placesData?.items ?? [];

  return (
    <div className="page-enter min-h-screen bg-[var(--color-background)]" dir={isRTL ? "rtl" : "ltr"}>
      <PageIntro
        variant="utility"
        title={t("Itinerary Builder", "منشئ خط السير")}
        description={t("Plan your visit to Islamic Cairo", "خطط لزيارتك للقاهرة الإسلامية")}
      />

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: itinerary list */}
          <div className="space-y-4">
            <h2 className={`text-lg font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
              {t("My Itineraries", "خطوط سيري")}
            </h2>

            {/* Create new */}
            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
              <Input
                placeholder={t("New itinerary name...", "اسم خط السير الجديد...")}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className={`bg-white border-[var(--color-border)] ${isRTL ? "text-right font-[var(--font-arabic-sans)]" : ""}`}
                onKeyDown={e => {
                  if (e.key === "Enter" && newName.trim()) {
                    createItinerary.mutate({ nameEn: newName.trim() });
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => newName.trim() && createItinerary.mutate({ nameEn: newName.trim() })}
                className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)] shrink-0"
              >
                <Plus size={14} />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {(itineraries ?? []).map(itin => (
                  <button
                    key={itin.id}
                    onClick={() => setSelectedItinerary(itin.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedItinerary === itin.id ? "border-[var(--color-terracotta-600)] bg-[var(--color-terracotta-600)]/5" : "border-[var(--color-border)] bg-white hover:bg-[var(--color-parchment-100)]"} ${isRTL ? "text-right" : ""}`}
                  >
                    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Calendar size={14} className="text-[var(--color-stone-400)] shrink-0" />
                      <span className={`text-sm font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                        {itin.nameEn}
                      </span>
                    </div>
                    {itin.days && (
                      <p className="text-xs text-[var(--color-stone-400)] mt-0.5 ml-5">
                        {t(`${itin.days} days`, `${itin.days} أيام`)}
                      </p>
                    )}
                  </button>
                ))}
                {(itineraries ?? []).length === 0 && (
                  <p className={`text-sm text-[var(--color-stone-400)] text-center py-4 ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                    {t("No itineraries yet. Create one above.", "لا توجد خطوط سير بعد. أنشئ واحداً أعلاه.")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Main: itinerary detail */}
          <div className="lg:col-span-2">
            {selectedItinerary ? (
              <ItineraryDetail
                itineraryId={selectedItinerary}
                places={places}
                addPlaceId={addPlaceId}
                setAddPlaceId={setAddPlaceId}
                onAddStop={(placeId) => addStop.mutate({ itineraryId: selectedItinerary, placeId })}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-[var(--color-stone-300)]">
                <div className="text-center">
                  <MapPin size={40} className="mx-auto mb-3 opacity-40" />
                  <p className={`text-sm ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
                    {t("Select or create an itinerary to get started.", "اختر أو أنشئ خط سير للبدء.")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItineraryDetail({
  itineraryId,
  places,
  addPlaceId,
  setAddPlaceId,
  onAddStop,
}: {
  itineraryId: number;
  places: Array<{ id: number; nameEn: string; nameAr: string }>;
  addPlaceId: string;
  setAddPlaceId: (v: string) => void;
  onAddStop: (placeId: number) => void;
}) {
  const { lang, isRTL, t } = useLang();
  const { data: itineraries } = trpc.itinerary.list.useQuery();
  const itin = itineraries?.find(i => i.id === itineraryId);
  const stops = (itin?.items as Array<{ placeId: number; day: number; order: number; notesEn?: string }> | null) ?? [];

  return (
    <div className="space-y-6">
      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
        <h2 className={`text-xl font-semibold text-[var(--color-stone-900)] ${lang === "ar" ? "font-[var(--font-arabic)]" : "font-[var(--font-serif)]"}`}>
          {itin?.nameEn ?? t("Itinerary", "خط السير")}
        </h2>
      </div>

      {/* Add stop */}
      <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Select value={addPlaceId} onValueChange={setAddPlaceId}>
          <SelectTrigger className="flex-1 bg-white border-[var(--color-border)]">
            <SelectValue placeholder={t("Add a monument stop...", "أضف محطة معلم...")} />
          </SelectTrigger>
          <SelectContent>
            {places.map(p => (
              <SelectItem key={p.id} value={String(p.id)}>
                {lang === "ar" ? p.nameAr : p.nameEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => addPlaceId && onAddStop(parseInt(addPlaceId))}
          disabled={!addPlaceId}
          className="bg-[var(--color-terracotta-600)] hover:bg-[var(--color-terracotta-700)] shrink-0"
        >
          <Plus size={14} />
          {t("Add", "أضف")}
        </Button>
      </div>

      {/* Stops list */}
      {stops.length > 0 ? (
        <div className="space-y-3">
          {stops.map((stop, i) => {
            const place = places.find(p => p.id === stop.placeId);
            return (
              <div key={i} className={`flex items-center gap-3 p-4 bg-white border border-[var(--color-border)] rounded-lg ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="w-7 h-7 rounded-full bg-[var(--color-terracotta-600)] text-white text-xs flex items-center justify-center shrink-0 font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-[var(--color-stone-800)] ${lang === "ar" ? "font-[var(--font-arabic-sans)] text-right" : ""}`}>
                    {place ? (lang === "ar" ? place.nameAr : place.nameEn) : t(`Stop ${i + 1}`, `المحطة ${i + 1}`)}
                  </p>
                  {stop.notesEn && (
                    <p className="text-xs text-[var(--color-stone-400)] mt-0.5">{stop.notesEn}</p>
                  )}
                </div>
                <span className="text-xs text-[var(--color-stone-400)] shrink-0">
                  {t(`Day ${stop.day}`, `اليوم ${stop.day}`)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-[var(--color-stone-300)]">
          <MapPin size={32} className="mx-auto mb-3 opacity-40" />
          <p className={`text-sm ${lang === "ar" ? "font-[var(--font-arabic-sans)]" : ""}`}>
            {t("No stops yet. Add monuments above.", "لا توجد محطات بعد. أضف معالم أعلاه.")}
          </p>
        </div>
      )}
    </div>
  );
}
