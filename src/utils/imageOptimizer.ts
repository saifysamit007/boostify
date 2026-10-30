/**
 * Boostify Image Optimization Utility
 * 
 * Provides automated WebP conversion, responsive srcSet generation,
 * CDN parameter injection (Unsplash, ImageKit, Cloudinary),
 * and client-side canvas WebP compression for uploads.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 1 to 100
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';
  fit?: 'crop' | 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
}

/**
 * Checks if a string is a base64 data URL
 */
export function isDataUrl(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}

/**
 * Checks if a URL is an Unsplash image
 */
export function isUnsplashUrl(url: string): boolean {
  return typeof url === 'string' && (url.includes('images.unsplash.com') || url.includes('unsplash.com'));
}

/**
 * Checks if a URL is an ImageKit image
 */
export function isImageKitUrl(url: string): boolean {
  return typeof url === 'string' && url.includes('ik.imagekit.io');
}

/**
 * Checks if a URL is a Cloudinary image
 */
export function isCloudinaryUrl(url: string): boolean {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

/**
 * Transforms an image URL to serve in WebP format with optimal sizing and quality.
 * Supports direct parameters for Unsplash, ImageKit, and Cloudinary, as well as
 * our backend image optimization proxy for external images.
 */
export function getOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!src || typeof src !== 'string') {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  }

  // If already a data URL, return as is (already compressed if through our upload handler)
  if (isDataUrl(src)) {
    return src;
  }

  const {
    width = 1200,
    height,
    quality = 80,
    format = 'webp',
    fit = 'crop'
  } = options;

  // 1. Unsplash Optimization (Direct CDN Native WebP)
  if (isUnsplashUrl(src)) {
    try {
      const url = new URL(src);
      url.searchParams.set('fm', format === 'auto' ? 'webp' : format);
      url.searchParams.set('auto', 'format,compress');
      url.searchParams.set('q', quality.toString());
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('fit', fit === 'cover' ? 'crop' : fit);
      return url.toString();
    } catch {
      // If URL parsing fails, append parameters safely
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}fm=${format}&auto=format,compress&q=${quality}&w=${width}&fit=${fit}`;
    }
  }

  // 2. ImageKit Optimization (Direct CDN Native WebP)
  if (isImageKitUrl(src)) {
    try {
      const url = new URL(src);
      // Construct ImageKit transformation query: tr=f-webp,w-800,q-80
      const transformations = [`f-${format === 'auto' ? 'webp' : format}`, `q-${quality}`];
      if (width) transformations.push(`w-${width}`);
      if (height) transformations.push(`h-${height}`);
      if (fit) transformations.push(`cm-extract`); // or pad_resize

      url.searchParams.set('tr', transformations.join(','));
      return url.toString();
    } catch {
      return src;
    }
  }

  // 3. Cloudinary Optimization
  if (isCloudinaryUrl(src)) {
    const transformStr = `f_${format},q_${quality}${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''},c_fill`;
    return src.replace('/upload/', `/upload/${transformStr}/`);
  }

  // 4. For standard external HTTP/HTTPS images, use our server proxy
  if (src.startsWith('http://') || src.startsWith('https://')) {
    const encoded = encodeURIComponent(src);
    return `/api/images/optimize?url=${encoded}&w=${width}&q=${quality}&fmt=${format}`;
  }

  return src;
}

/**
 * Standard responsive breakpoints for project and blog card images
 */
export const RESPONSIVE_WIDTHS = [400, 800, 1200, 1600];

/**
 * Generates a responsive srcset string with WebP formatting for an image
 */
export function generateSrcSet(
  src: string,
  widths: number[] = RESPONSIVE_WIDTHS,
  quality: number = 80
): string {
  if (!src || isDataUrl(src)) return '';

  return widths
    .map(w => {
      const optimizedUrl = getOptimizedImageUrl(src, { width: w, quality, format: 'webp' });
      return `${optimizedUrl} ${w}w`;
    })
    .join(', ');
}

/**
 * Client-side Canvas Image Compression to WebP
 * Converts any uploaded PNG, JPEG, or HEIC file to a lightweight WebP data URL
 * before storing it in localStorage or server store.
 */
export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function compressImageFileToWebP(
  file: File,
  optionsOrMaxWidth: number | CompressImageOptions = 1600,
  qualityParam: number = 0.82
): Promise<string> {
  const options: CompressImageOptions = typeof optionsOrMaxWidth === 'number'
    ? { maxWidth: optionsOrMaxWidth, quality: qualityParam }
    : { maxWidth: 1600, quality: 0.82, ...optionsOrMaxWidth };

  const maxWidth = options.maxWidth || 1600;
  const maxHeight = options.maxHeight || 1600;
  const quality = options.quality ?? 0.82;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in canvas'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved scaling
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with specified quality
        try {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          // If browser doesn't support webp export, it falls back to png, which is fine
          resolve(webpDataUrl);
        } catch {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
