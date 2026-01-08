/**
 * Normalizes image URLs to handle mixed content issues
 * Converts localhost URLs to proper HTTPS URLs in production
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) {
    // Return a data URI placeholder for missing images
    return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f3f4f6\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%239ca3af\' font-family=\'sans-serif\' font-size=\'16\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EImage non disponible%3C/text%3E%3C/svg%3E';
  }

  // If already a valid HTTPS URL (Cloudinary, external, etc.), return as-is
  if (url.startsWith('https://')) {
    return url;
  }

  // Check if we're in production
  const isProduction = typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.') &&
    !window.location.hostname.startsWith('10.');

  if (isProduction) {
    // In production, localhost URLs won't work - convert to current domain
    if (url.startsWith('http://localhost:') || url.startsWith('https://localhost:')) {
      try {
        // Extract the path from localhost URL
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        
        // If it's an upload path, try to serve it through the current domain
        if (path.startsWith('/uploads/')) {
          // Return the path relative to current domain (HTTPS)
          return `${window.location.origin}${path}`;
        }
        
        // For other localhost URLs, return placeholder
        return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f3f4f6\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%239ca3af\' font-family=\'sans-serif\' font-size=\'16\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EImage non disponible%3C/text%3E%3C/svg%3E';
      } catch (e) {
        // Invalid URL format, return placeholder
        return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23f3f4f6\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%239ca3af\' font-family=\'sans-serif\' font-size=\'16\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3EImage non disponible%3C/text%3E%3C/svg%3E';
      }
    }
    
    // If it's HTTP (not HTTPS) in production, upgrade to HTTPS
    if (url.startsWith('http://') && !url.startsWith('http://localhost')) {
      return url.replace('http://', 'https://');
    }
    
    // If it's a relative path starting with /uploads, make it absolute with HTTPS
    if (url.startsWith('/uploads/')) {
      return `${window.location.origin}${url}`;
    }
  } else {
    // In development, upgrade HTTP to HTTPS for external URLs to avoid mixed content
    if (url.startsWith('http://') && !url.startsWith('http://localhost') && !url.startsWith('http://127.0.0.1')) {
      return url.replace('http://', 'https://');
    }
  }

  // Return as-is for other cases
  return url;
}

/**
 * Normalizes an array of image URLs
 */
export function normalizeImageUrls(urls: (string | null | undefined)[]): string[] {
  return urls.map(normalizeImageUrl).filter(Boolean);
}

