// API Configuration
// If VITE_API_URL is set, use it. Otherwise, use relative URL for same-domain deployment

// Detect if we're in production
// Check multiple conditions to ensure reliable detection
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname === '0.0.0.0');

const isProduction = import.meta.env.PROD || 
  import.meta.env.MODE === 'production' || 
  (!isLocalhost && typeof window !== 'undefined');

// Determine API base URL
// Priority: 1. VITE_API_URL env var, 2. Relative /api in production, 3. localhost in dev
let API_BASE_URL: string;

if (import.meta.env.VITE_API_URL) {
  // Explicit API URL from environment variable (highest priority)
  API_BASE_URL = import.meta.env.VITE_API_URL;
  // Don't allow localhost in production if explicitly set
  if (isProduction && API_BASE_URL.includes('localhost')) {
    console.warn('⚠️ VITE_API_URL points to localhost in production! Using relative /api instead.');
    API_BASE_URL = '/api';
  }
} else if (isProduction) {
  // In production, use relative URL (same domain - Railway serves both frontend and backend)
  API_BASE_URL = '/api';
} else {
  // Development: use localhost
  API_BASE_URL = 'http://localhost:3001/api';
}

// Log for debugging (always log in production to help troubleshoot)
console.log('🔧 API Configuration:');
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   VITE_API_URL env:', import.meta.env.VITE_API_URL || 'not set');
console.log('   PROD:', import.meta.env.PROD);
console.log('   MODE:', import.meta.env.MODE);
console.log('   Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side');
console.log('   isLocalhost:', isLocalhost);
console.log('   isProduction:', isProduction);

export { API_BASE_URL };

