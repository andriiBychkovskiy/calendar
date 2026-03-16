import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Link, Alert, CircularProgress, Divider,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@shared/api/auth.api';
import { useAuthStore } from '@entities/user/store';
import { ROUTES } from '@shared/config';

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ display: 'block' }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailAutofilled, setEmailAutofilled] = useState(false);
  const [passwordAutofilled, setPasswordAutofilled] = useState(false);
  const [error, setError] = useState(searchParams.get('error') === 'google_failed' ? 'Google sign-in failed. Please try again.' : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setAuth(data.user, data.accessToken);
      navigate(ROUTES.CALENDAR);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F1F3F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary' }}>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Welcome back to Calendar
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoComplete="email"
            InputLabelProps={{ shrink: !!email || emailAutofilled }}
            inputProps={{
              onAnimationStart: (e: React.AnimationEvent<HTMLInputElement>) => {
                if (e.animationName === 'mui-auto-fill') setEmailAutofilled(true);
                if (e.animationName === 'mui-auto-fill-cancel') setEmailAutofilled(false);
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
            InputLabelProps={{ shrink: !!password || passwordAutofilled }}
            inputProps={{
              onAnimationStart: (e: React.AnimationEvent<HTMLInputElement>) => {
                if (e.animationName === 'mui-auto-fill') setPasswordAutofilled(true);
                if (e.animationName === 'mui-auto-fill-cancel') setPasswordAutofilled(false);
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ mt: 1, py: 1.25 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Sign in'}
          </Button>
        </Box>

        <Divider sx={{ my: 2.5 }}>
          <Typography variant="caption" color="text.secondary">or</Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => { window.location.href = '/api/auth/google'; }}
          startIcon={<GoogleIcon />}
          sx={{ py: 1.25, borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' } }}
        >
          Sign in with Google
        </Button>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to={ROUTES.REGISTER} underline="hover" color="primary">
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
