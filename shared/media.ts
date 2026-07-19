export const IMAGEKIT_WIDTHS = [480, 800, 1280, 1600] as const;

export type ImageKitWidth = (typeof IMAGEKIT_WIDTHS)[number];

function isImageKitHostname(hostname: string): boolean {
  return hostname === "ik.imagekit.io" || hostname.endsWith(".ik.imagekit.io");
}

export function buildImageKitUrl(sourceUrl: string, width: ImageKitWidth): string {
  let url: URL;

  try {
    url = new URL(sourceUrl);
  } catch {
    return sourceUrl;
  }

  if (!isImageKitHostname(url.hostname)) return sourceUrl;

  const transformation = `w-${width},q-80,f-auto`;
  const existingTransformation = url.searchParams.get("tr");
  url.searchParams.set(
    "tr",
    existingTransformation ? `${existingTransformation},${transformation}` : transformation,
  );
  return url.toString();
}

export function buildImageKitSrcSet(sourceUrl: string): string {
  return IMAGEKIT_WIDTHS.map((width) => `${buildImageKitUrl(sourceUrl, width)} ${width}w`).join(", ");
}
