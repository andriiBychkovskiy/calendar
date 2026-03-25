import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from '@entities/user/store';
import { axiosInstance } from '@shared/api/axios';
import { NATIVE_OAUTH_CALLBACK_URL, ROUTES } from '@shared/config';

const parseCallbackParams = (url: string): URLSearchParams | null => {
  if (!url.startsWith(NATIVE_OAUTH_CALLBACK_URL)) {
    return null;
  }
  const q = url.indexOf('?');
  if (q === -1) {
    return null;
  }
  return new URLSearchParams(url.slice(q + 1));
};

export const NativeOAuthBridge: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return undefined;
    }

    let cancelled = false;
    let appUrlSub: { remove: () => void } | null = null;

    const handle = async (url: string) => {
      const params = parseCallbackParams(url);
      if (!params) {
        return;
      }
      const token = params.get('token');
      const refresh = params.get('refresh');
      const id = params.get('id');
      const email = params.get('email');
      const name = params.get('name');
      if (token && id && email && name) {
        setAuth({ id, email, name }, token);
        if (refresh) {
          try {
            await axiosInstance.post('/auth/native-bridge', { refreshToken: refresh });
          } catch {
            console.warn('[NativeOAuthBridge] native-bridge failed; refresh cookie may be missing');
          }
        }
        await Browser.close();
        navigate(ROUTES.CALENDAR, { replace: true });
      } else {
        await Browser.close();
        navigate(`${ROUTES.LOGIN}?error=google_failed`, { replace: true });
      }
    };

    const setup = async () => {
      const launch = await App.getLaunchUrl();
      if (cancelled) {
        return;
      }
      if (launch?.url) {
        await handle(launch.url);
      }
      if (cancelled) {
        return;
      }
      const sub = await App.addListener('appUrlOpen', (event) => {
        void handle(event.url);
      });
      appUrlSub = sub;
      if (cancelled) {
        sub.remove();
      }
    };

    void setup();

    return () => {
      cancelled = true;
      appUrlSub?.remove();
    };
  }, [navigate, setAuth]);

  return null;
};
