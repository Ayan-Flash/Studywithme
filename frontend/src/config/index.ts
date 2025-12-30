// Frontend Environment Configuration
// This file maps environment variables for the frontend

// API URL - will be replaced during build for production
const getApiUrl = (): string => {
    // Check for Vite environment variable (set during build)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Development fallback
    if (import.meta.env.DEV) {
        return 'http://localhost:3000/api';
    }

    // Production fallback - same origin
    return '/api';
};

export const config = {
    API_URL: getApiUrl(),
    APP_NAME: 'StudyWithMe',
    APP_VERSION: '1.0.0',
    IS_PRODUCTION: import.meta.env.PROD,
    IS_DEVELOPMENT: import.meta.env.DEV,
};

export default config;
