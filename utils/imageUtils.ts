// utils/imageUtils.ts

/**
 * Converts an image File (JPEG, PNG, etc.) to a WebP File using the browser's Canvas API.
 * The original file name is retained, but the extension is changed to .webp.
 * The quality is set to 0.8 (80%) for good balance between size and quality.
 *
 * @param file The original image File object.
 * @returns A Promise that resolves with the new WebP File object.
 * @throws An error if canvas context cannot be obtained or conversion fails.
 */
export const convertImageToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Exclude SVG files from WebP conversion
    if (file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    if (!file.type.startsWith('image/')) {
      resolve(file); // Not an image, return original file
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas 2D context.'));
          return;
        }
        ctx.drawImage(img, 0, 0);

        // Convert canvas content to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed.'));
              return;
            }
            // Create a new File object with .webp extension
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            const webpFile = new File([blob], newName, { type: 'image/webp', lastModified: Date.now() });
            resolve(webpFile);
          },
          'image/webp',
          0.8 // Quality: 0.8 (80%)
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for conversion.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};