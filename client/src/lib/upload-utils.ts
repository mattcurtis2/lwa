
/**
 * Shared utilities for file uploads to Firebase Storage
 */

/**
 * Returns true when an image URL should be proxied for CORS (cropping).
 */
export function needsImageProxy(url: string | null | undefined): boolean {
  if (!url || url.includes("proxy-image")) {
    return false;
  }

  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("storage.googleapis.com") ||
    url.includes("lwacontent.s3") ||
    url.includes("s3.amazonaws.com") ||
    url.startsWith("https://s3")
  );
}

/**
 * Rewrites remote storage URLs through the image proxy when needed.
 */
export function getProxiedImageUrl(url: string): string {
  if (needsImageProxy(url)) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
// Vercel serverless requests are capped at 4.5MB. Pedigree PNGs are larger than that,
// so those files upload directly to Firebase with a signed URL.
const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024;

const EXTENSION_MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

export function mimeTypeForFile(file: File): string {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return EXTENSION_MIME_TYPES[extension] || "application/octet-stream";
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.error || errorData.message || errorData.details || fallback;
  } catch {
    return fallback;
  }
}

async function uploadFileViaApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errorMessage = await readErrorMessage(uploadResponse, "Upload failed");
    const error = new Error(`Failed to upload file: ${errorMessage}`);
    (error as Error & { status?: number }).status = uploadResponse.status;
    throw error;
  }

  const uploadData = await uploadResponse.json();
  const url = Array.isArray(uploadData) ? uploadData[0]?.url : uploadData?.url;
  if (!url) {
    throw new Error("Server returned invalid upload data");
  }
  return url;
}

async function uploadFileDirect(file: File): Promise<string> {
  const mimeType = mimeTypeForFile(file);
  const signedResponse = await fetch("/api/upload/signed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      mimeType,
      size: file.size,
    }),
  });

  if (!signedResponse.ok) {
    throw new Error(await readErrorMessage(signedResponse, "Failed to start upload"));
  }

  const signed = await signedResponse.json();
  const putResponse = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": signed.contentType || mimeType },
    body: file,
  });

  if (!putResponse.ok) {
    throw new Error("Failed to upload file to storage");
  }

  const finalizeResponse = await fetch("/api/upload/finalize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      objectName: signed.objectName,
      token: signed.token,
    }),
  });

  if (!finalizeResponse.ok) {
    throw new Error(await readErrorMessage(finalizeResponse, "Failed to finish upload"));
  }

  const finalized = await finalizeResponse.json();
  if (!finalized?.url) {
    throw new Error("Server returned invalid upload data");
  }
  return finalized.url;
}

/**
 * Uploads a file and returns the Firebase Storage URL.
 * Files larger than the serverless request limit upload directly to storage.
 */
export async function uploadFile(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large (max 50MB)");
  }

  try {
    if (file.size > SERVER_UPLOAD_LIMIT) {
      return await uploadFileDirect(file);
    }

    try {
      return await uploadFileViaApi(file);
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 413) {
        return await uploadFileDirect(file);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error during upload:", error);
    throw error;
  }
}

/** @deprecated Use uploadFile instead */
export const uploadFileToS3 = uploadFile;
