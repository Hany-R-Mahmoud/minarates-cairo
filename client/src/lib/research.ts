export type ResearchStop = {
  placeSlug?: string;
  placeId?: number;
  order?: number;
  orderIndex?: number;
  noteEn?: string;
  noteAr?: string;
  activeWorship?: boolean;
};

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function readResearchStops(value: unknown): ResearchStop[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
    .map(item => ({
      placeSlug: typeof item.placeSlug === "string" ? item.placeSlug : undefined,
      placeId: typeof item.placeId === "number" ? item.placeId : undefined,
      order: typeof item.order === "number" ? item.order : undefined,
      orderIndex: typeof item.orderIndex === "number" ? item.orderIndex : undefined,
      noteEn: typeof item.noteEn === "string" ? item.noteEn : undefined,
      noteAr: typeof item.noteAr === "string" ? item.noteAr : undefined,
      activeWorship: typeof item.activeWorship === "boolean" ? item.activeWorship : undefined,
    }));
}

export function readResearchPlaceIds(value: unknown): number[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is number => typeof item === "number" && Number.isInteger(item));
}
