import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  lockout: {
    maxFailedAttempts: Number(process.env.AUTH_MAX_FAILED_ATTEMPTS ?? 5),
    lockoutMinutes: Number(process.env.AUTH_LOCKOUT_MINUTES ?? 15),
  },
  passwordPolicy: {
    minLength: Number(process.env.AUTH_PASSWORD_MIN_LENGTH ?? 8),
    requireUppercase: process.env.AUTH_PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.AUTH_PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumber: process.env.AUTH_PASSWORD_REQUIRE_NUMBER !== 'false',
    requireSpecial: process.env.AUTH_PASSWORD_REQUIRE_SPECIAL !== 'false',
  },
  bootstrapAdmin: {
    mssq: process.env.AUTH_BOOTSTRAP_ADMIN_MSSQ ?? '',
    password: process.env.AUTH_BOOTSTRAP_ADMIN_PASSWORD ?? '',
    fullName: process.env.AUTH_BOOTSTRAP_ADMIN_FULL_NAME ?? '',
    roleCode: process.env.AUTH_BOOTSTRAP_ADMIN_ROLE_CODE ?? '',
  },
}));
