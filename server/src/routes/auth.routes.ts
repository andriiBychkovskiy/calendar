import { Router } from 'express';
import { register, login, refresh, logout, googleCallback } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validation/auth.schema';
import passport from '../config/passport.config';

const router = Router();

const googleEnabled = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);


router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/google', (req, res, next) => {
  if (!googleEnabled()) {
    res.status(503).json({ message: 'Google OAuth is not configured' });
    return;
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!googleEnabled()) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    return;
  }
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  })(req, res, next);
}, googleCallback);

export default router;
