
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

/**
 * Uploads a file via the server API and returns the Firebase Storage URL.
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      let errorMessage = "Unknown error";
      try {
        const errorData = await uploadResponse.json();
        errorMessage =
          errorData.error || errorData.message || errorData.details || "Upload failed";
        console.error("Upload error details:", errorData);
      } catch (e) {
        console.error("Could not parse error response:", e);
      }
      throw new Error(`Failed to upload file: ${errorMessage}`);
    }

    const uploadData = await uploadResponse.json();

    if (!uploadData || !uploadData[0] || !uploadData[0].url) {
      console.error("Invalid upload response:", uploadData);
      throw new Error("Server returned invalid upload data");
    }

    console.log("Upload successful:", uploadData[0].url);
    return uploadData[0].url;
  } catch (error) {
    console.error("Error during upload:", error);
    throw error;
  }
}

/** @deprecated Use uploadFile instead */
export const uploadFileToS3 = uploadFile;
