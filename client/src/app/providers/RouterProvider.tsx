import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@shared/config';
import { useAuthStore } from '@entities/user/store';
import { NativeOAuthBridge } from '../NativeOAuthBridge';

const CalendarPage = React.lazy(() => import('@pages/calendar/CalendarPage'));
const LoginPage = React.lazy(() => import('@pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@pages/auth/RegisterPage'));
const GoogleCallbackPage = React.lazy(() => import('@pages/auth/GoogleCallbackPage'));

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to={ROUTES.CALENDAR} replace /> : <>{children}</>;
};

export const RouterProvider: React.FC = () => (
  <BrowserRouter>
    <NativeOAuthBridge />
    <React.Suspense fallback={null}>
      <Routes>
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.CALENDAR} replace />} />
        <Route
          path={ROUTES.CALENDAR}
          element={
            <PrivateRoute>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.REGISTER}
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route path={ROUTES.AUTH_CALLBACK} element={<GoogleCallbackPage />} />
      </Routes>
    </React.Suspense>
  </BrowserRouter>
);
