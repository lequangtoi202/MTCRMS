import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';

import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

interface TokenPayload {
  sub: string;
  mssq: string;
  roleCode: string | null;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokenPair(payload: TokenPayload): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const accessSecret = this.configService.getOrThrow<string>(
      'auth.jwt.accessSecret',
    );
    const accessExpiresIn = this.configService.getOrThrow<string>(
      'auth.jwt.accessExpiresIn',
    );
    const refreshSecret = this.configService.getOrThrow<string>(
      'auth.jwt.refreshSecret',
    );
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'auth.jwt.refreshExpiresIn',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
        jwtid: randomUUID(),
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
        jwtid: randomUUID(),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: new Date(
        Date.now() + this.parseDurationToMilliseconds(refreshExpiresIn),
      ),
    };
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    try {
      return await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
        secret: this.configService.getOrThrow<string>('auth.jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }

  async verifyRefreshToken(token: string): Promise<AuthenticatedUser> {
    try {
      return await this.jwtService.verifyAsync<AuthenticatedUser>(token, {
        secret: this.configService.getOrThrow<string>('auth.jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseDurationToMilliseconds(value: string): number {
    const match = value.trim().match(/^(\d+)([smhd])$/i);

    if (!match) {
      throw new Error(`Unsupported duration format: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const unitMap: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return amount * unitMap[unit];
  }
}
