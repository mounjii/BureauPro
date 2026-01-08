// API Configuration
// If VITE_API_URL is set, use it. Otherwise, use relative URL for same-domain deployment
// Check both PROD and MODE to ensure production detection works
const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production' || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isProduction ? '/api' : 'http://localhost:3001/api');

// Log for debugging (only in development)
if (!isProduction) {
  console.log('🔧 API_BASE_URL:', API_BASE_URL);
  console.log('🔧 PROD:', import.meta.env.PROD);
  console.log('🔧 MODE:', import.meta.env.MODE);
}

