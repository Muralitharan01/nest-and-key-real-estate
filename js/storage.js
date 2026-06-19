// ─── Firebase Storage — Image Upload ───────────────────────────────────────
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";
import { storage } from "./firebase-config.js";

/**
 * Helper to compress and convert file to base64 data URL.
 */
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale to max 600px width/height
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 0.5 quality to keep size under 35KB
        const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target.result); // Fallback to raw base64 if not an image
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a single image file; resolves with its public download URL.
 * Falls back to local compressed base64 if Firebase Storage upload fails (e.g. CORS on localhost).
 * @param {File}     file        - Image File from <input type="file">
 * @param {string}   propertyId  - Namespaces the storage path
 * @param {Function} onProgress  - Optional callback(percent: number)
 */
export async function uploadPropertyImage(file, propertyId, onProgress) {
  // Set fast timeout to fail quickly on CORS blocks (2 seconds)
  storage.maxUploadRetryTime = 2000;
  storage.maxOperationRetryTime = 2000;

  const path    = `properties/${propertyId}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, path);

  try {
    const task = uploadBytesResumable(fileRef, file);
    return await new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          if (onProgress) onProgress(pct);
        },
        reject,
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  } catch (err) {
    console.warn("Firebase Storage upload failed, falling back to compressed base64 data URL:", err);
    return await convertToBase64(file);
  }
}

/**
 * Upload multiple image files in parallel and return an array of download URLs.
 * Calls onProgress(uploadedCount, totalCount) after each file completes.
 *
 * @param {File[]}   files       - Array of File objects
 * @param {string}   propertyId  - Namespaces the storage path
 * @param {Function} onProgress  - Optional callback(done, total)
 * @returns {Promise<string[]>}  - Array of download URLs (same order as files)
 */
export async function uploadMultipleImages(files, propertyId, onProgress) {
  let done = 0;
  const uploads = files.map((file) =>
    uploadPropertyImage(file, propertyId).then((url) => {
      done++;
      if (onProgress) onProgress(done, files.length);
      return url;
    })
  );
  return Promise.all(uploads);
}

/**
 * Delete a single image from Storage by download URL.
 * Fails silently — a stale URL should never crash the UI.
 */
export async function deletePropertyImage(downloadUrl) {
  try {
    await deleteObject(ref(storage, downloadUrl));
  } catch {
    // Already gone or wrong URL — safe to ignore.
  }
}

/**
 * Delete every URL in an array (used when removing a whole property).
 */
export async function deleteAllPropertyImages(urls = []) {
  await Promise.allSettled(urls.map(deletePropertyImage));
}
