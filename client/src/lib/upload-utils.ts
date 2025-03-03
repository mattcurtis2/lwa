
/**
 * Shared utilities for file uploads to S3
 */

/**
 * Uploads a file to S3 and returns the URL
 */
export async function uploadFileToS3(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await uploadResponse.json();
        errorMessage = errorData.error || errorData.message || errorData.details || 'Upload failed';
        console.error('Upload error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
      throw new Error(`Failed to upload image: ${errorMessage}`);
    }

    // Get the S3 URL from the response
    const uploadData = await uploadResponse.json();
    
    if (!uploadData || !uploadData[0] || !uploadData[0].url) {
      console.error('Invalid upload response:', uploadData);
      throw new Error('Server returned invalid upload data');
    }
    
    console.log('S3 upload successful:', uploadData[0].url);
    return uploadData[0].url;
  } catch (error) {
    console.error('Error during S3 upload:', error);
    throw error;
  }
}
