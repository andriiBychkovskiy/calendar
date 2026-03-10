export const jwtConfig = {
  get accessSecret() { return process.env.JWT_ACCESS_SECRET as string; },
  get refreshSecret() { return process.env.JWT_REFRESH_SECRET as string; },
  get accessExpires() { return process.env.JWT_ACCESS_EXPIRES || '15m'; },
  get refreshExpires() { return process.env.JWT_REFRESH_EXPIRES || '7d'; },
};
