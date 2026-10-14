/**
 * Utility to process and compress images pasted via Ctrl+V or file upload
 * Resizes image on canvas to max 256x256 JPEG for optimal speed and storage
 */
export function processImageFile(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Crops a bounding box [ymin, xmin, ymax, xmax] (normalized 0-1000) from an image base64
 */
export function cropImageRegion(
  imageBase64: string,
  box: [number, number, number, number]
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const [ymin, xmin, ymax, xmax] = box;
      // Convert normalized 0-1000 coordinates to actual pixel dimensions
      const rawX = (xmin / 1000) * img.width;
      const rawY = (ymin / 1000) * img.height;
      const rawW = ((xmax - xmin) / 1000) * img.width;
      const rawH = ((ymax - ymin) / 1000) * img.height;

      // Add a small safety margin of 2%
      const padX = rawW * 0.02;
      const padY = rawH * 0.02;

      const x = Math.max(0, Math.floor(rawX - padX));
      const y = Math.max(0, Math.floor(rawY - padY));
      const w = Math.min(img.width - x, Math.ceil(rawW + padX * 2));
      const h = Math.min(img.height - y, Math.ceil(rawH + padY * 2));

      if (w <= 0 || h <= 0) {
        resolve(imageBase64);
        return;
      }

      const canvas = document.createElement('canvas');
      const maxSize = 256;
      let targetW = w;
      let targetH = h;
      if (targetW > maxSize || targetH > maxSize) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxSize) / targetW);
          targetW = maxSize;
        } else {
          targetW = Math.round((targetW * maxSize) / targetH);
          targetH = maxSize;
        }
      }

      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, w, h, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve(imageBase64);
      }
    };
    img.onerror = () => resolve(imageBase64);
    img.src = imageBase64;
  });
}
