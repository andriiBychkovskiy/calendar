import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { User, IUser } from '../models/User.model';
import { jwtConfig } from '../config/jwt.config';

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpires as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ userId }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpires as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }

    const user = await User.create({ email, password, name });
    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      accessToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.json({
      accessToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ message: 'No refresh token' });
      return;
    }

    const payload = jwt.verify(token, jwtConfig.refreshSecret) as { userId: string };
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== hashToken(token)) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: hashToken(token) });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('[logout]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    const params = new URLSearchParams({
      token: accessToken,
      id: String(user._id),
      email: user.email,
      name: user.name,
    });
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params}`);
  } catch (err) {
    console.error('[googleCallback]', err);
    res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
  }
};
