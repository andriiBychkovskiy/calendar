import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@entities/user/store';
import { ROUTES } from '@shared/config';

const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const email = searchParams.get('email');
    const name = searchParams.get('name');

    if (token && id && email && name) {
      setAuth({ id, email, name }, token);
      navigate(ROUTES.CALENDAR, { replace: true });
    } else {
      navigate(ROUTES.LOGIN + '?error=google_failed', { replace: true });
    }
  }, [searchParams, setAuth, navigate]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <CircularProgress />
    </Box>
  );
};

export default GoogleCallbackPage;
