import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.model';

export function setupGoogleStrategy(): void {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    console.warn('[passport] Google OAuth credentials not set — Google login disabled');
    return;
  }

  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error('No email provided by Google'));

          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = await User.create({
                email,
                name: profile.displayName || email.split('@')[0],
                googleId: profile.id,
              });
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

export default passport;
