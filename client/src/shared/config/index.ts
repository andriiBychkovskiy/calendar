export const API_BASE_URL = '/api';

/** Must match Android intent `android:scheme` / `android:host` and server `NATIVE_OAUTH_REDIRECT`. */
export const NATIVE_OAUTH_CALLBACK_URL = 'com.calendar.app://auth/callback' as const;

export const ROUTES = {
  HOME: '/',
  CALENDAR: '/calendar',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
} as const;
