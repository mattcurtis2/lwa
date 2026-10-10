interface PreviewDocument {
  url: string;
  mimeType?: string | null;
  name?: string | null;
}

function pathWithoutQuery(url: string): string {
  const withoutQuery = url.split("?")[0]?.split("#")[0] || "";
  try {
    return decodeURIComponent(withoutQuery).toLowerCase();
  } catch {
    return withoutQuery.toLowerCase();
  }
}

export function documentPreviewKind(document: PreviewDocument) {
  const mime = (document.mimeType || "").toLowerCase();
  const path = pathWithoutQuery(document.url);
  const name = (document.name || "").toLowerCase();

  const isPdf =
    mime === "application/pdf" || path.endsWith(".pdf") || name.endsWith(".pdf");
  const isImage =
    mime.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp)$/i.test(path) ||
    /\.(jpe?g|png|gif|webp)$/i.test(name);
  const isVideo =
    mime.startsWith("video/") ||
    /\.(mp4|webm|mov)$/i.test(path) ||
    /\.(mp4|webm|mov)$/i.test(name);

  return { isPdf, isImage, isVideo };
}
