// Configuration constants for the VPSMonit app

// API URLs
export const API_BASE_URL = 'http://localhost:3000';
export const API_ENDPOINTS = {
  REALTIME: `${API_BASE_URL}/realtime`,
  STATS: `${API_BASE_URL}/stats`,
  LOGS: `${API_BASE_URL}/logs`,
};

// UI Configuration
export const UI_CONFIG = {
  REFRESH_INTERVAL: 5000, // milliseconds
  ANIMATION_DURATION: 300, // milliseconds
  DEFAULT_TIMEOUT: 10000, // milliseconds
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'vpsmonit_theme',
  SERVER_URL: 'vpsmonit_server_url',
  AUTH_TOKEN: 'vpsmonit_auth_token',
};

// Default Settings
export const DEFAULT_SETTINGS = {
  SERVER_URL: API_BASE_URL,
  THEME: 'system', // 'light', 'dark', or 'system'
  NOTIFICATIONS_ENABLED: true,
};