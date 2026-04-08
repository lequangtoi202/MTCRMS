import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ChangePasswordDto } from '../dto/change-password.dto';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthAuditAction } from '../entities/auth-audit-log.entity';
import { UserEntity, UserStatus } from '../entities/user.entity';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthAuditLogRepository } from '../repositories/auth-audit-log.repository';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

interface RequestContext {
  ipAddress: string | null;
  userAgent: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
    private readonly authSessionRepository: AuthSessionRepository,
    private readonly authAuditLogRepository: AuthAuditLogRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(payload: LoginDto, requestContext: RequestContext) {
    const mssq = payload.mssq.trim();
    const user = await this.userRepository.findByMssq(mssq);

    if (!user) {
      await this.authAuditLogRepository.createLog({
        mssq,
        action: AuthAuditAction.LOGIN_FAILED,
        success: false,
        failureReason: 'INVALID_CREDENTIALS',
        ...requestContext,
      });
      throw new UnauthorizedException('Invalid MSSQ or password');
    }

    await this.assertUserCanAuthenticate(user);

    const isPasswordValid = await this.passwordService.verifyPassword(
      payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user, requestContext);
      throw new UnauthorizedException('Invalid MSSQ or password');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.status = UserStatus.ACTIVE;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokenPair = await this.issueSessionTokens(user, requestContext);

    await this.authAuditLogRepository.createLog({
      userId: user.id,
      mssq: user.mssq,
      action: AuthAuditAction.LOGIN_SUCCESS,
      success: true,
      ...requestContext,
    });

    return {
      message: 'Login successful',
      data: {
        user: this.mapUserResponse(user),
        ...tokenPair,
      },
    };
  }

  async refresh(payload: RefreshTokenDto, requestContext: RequestContext) {
    const refreshTokenHash = this.tokenService.hashRefreshToken(
      payload.refreshToken,
    );
    const session =
      await this.authSessionRepository.findActiveByRefreshTokenHash(
        refreshTokenHash,
      );

    if (!session) {
      await this.authAuditLogRepository.createLog({
        mssq: 'UNKNOWN',
        action: AuthAuditAction.REFRESH_FAILED,
        success: false,
        failureReason: 'SESSION_NOT_FOUND',
        ...requestContext,
      });
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const refreshPayload = await this.tokenService.verifyRefreshToken(
      payload.refreshToken,
    );

    if (refreshPayload.sub !== session.user.id) {
      await this.authAuditLogRepository.createLog({
        userId: session.user.id,
        mssq: session.user.mssq,
        action: AuthAuditAction.REFRESH_FAILED,
        success: false,
        failureReason: 'TOKEN_SUBJECT_MISMATCH',
        ...requestContext,
      });
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    await this.authSessionRepository.revokeSession(session.id);
    const tokenPair = await this.issueSessionTokens(session.user, requestContext);

    await this.authAuditLogRepository.createLog({
      userId: session.user.id,
      mssq: session.user.mssq,
      action: AuthAuditAction.REFRESH_SUCCESS,
      success: true,
      ...requestContext,
    });

    return {
      message: 'Token refreshed successfully',
      data: tokenPair,
    };
  }

  async logout(payload: LogoutDto, requestContext: RequestContext) {
    const session =
      await this.authSessionRepository.findActiveByRefreshTokenHash(
        this.tokenService.hashRefreshToken(payload.refreshToken),
      );

    if (session) {
      await this.authSessionRepository.revokeSession(session.id);
      await this.authAuditLogRepository.createLog({
        userId: session.user.id,
        mssq: session.user.mssq,
        action: AuthAuditAction.LOGOUT,
        success: true,
        ...requestContext,
      });
    }

    return {
      message: 'Logout successful',
      data: null,
    };
  }

  async changePassword(
    actor: AuthenticatedUser,
    payload: ChangePasswordDto,
    requestContext: RequestContext,
  ) {
    const user = await this.userRepository.findById(actor.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      payload.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (payload.currentPassword === payload.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    user.passwordHash = await this.passwordService.hashPassword(
      payload.newPassword,
    );
    user.mustChangePassword = false;
    await this.userRepository.save(user);

    await this.authAuditLogRepository.createLog({
      userId: user.id,
      mssq: user.mssq,
      action: AuthAuditAction.CHANGE_PASSWORD,
      success: true,
      ...requestContext,
    });

    return {
      message: 'Password changed successfully',
      data: null,
    };
  }

  private async handleFailedLogin(
    user: UserEntity,
    requestContext: RequestContext,
  ): Promise<void> {
    const maxFailedAttempts = this.configService.get<number>(
      'auth.lockout.maxFailedAttempts',
      5,
    );
    const lockoutMinutes = this.configService.get<number>(
      'auth.lockout.lockoutMinutes',
      15,
    );

    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= maxFailedAttempts) {
      user.lockedUntil = new Date(Date.now() + lockoutMinutes * 60_000);
      user.status = UserStatus.LOCKED;
    }

    await this.userRepository.save(user);

    await this.authAuditLogRepository.createLog({
      userId: user.id,
      mssq: user.mssq,
      action: AuthAuditAction.LOGIN_FAILED,
      success: false,
      failureReason:
        user.status === UserStatus.LOCKED
          ? 'ACCOUNT_LOCKED'
          : 'INVALID_CREDENTIALS',
      ...requestContext,
    });
  }

  private async assertUserCanAuthenticate(user: UserEntity): Promise<void> {
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        `Account is locked until ${user.lockedUntil.toISOString()}`,
      );
    }

    if (
      user.status === UserStatus.LOCKED &&
      (!user.lockedUntil || user.lockedUntil <= new Date())
    ) {
      user.status = UserStatus.ACTIVE;
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await this.userRepository.save(user);
    }
  }

  private async issueSessionTokens(
    user: UserEntity,
    requestContext: RequestContext,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const tokenPair = await this.tokenService.generateTokenPair({
      sub: user.id,
      mssq: user.mssq,
      roleCode: user.role?.code ?? null,
    });

    await this.authSessionRepository.createSession({
      userId: user.id,
      refreshTokenHash: this.tokenService.hashRefreshToken(tokenPair.refreshToken),
      expiresAt: tokenPair.refreshTokenExpiresAt,
      ...requestContext,
    });

    return tokenPair;
  }

  private mapUserResponse(user: UserEntity) {
    return {
      id: user.id,
      mssq: user.mssq,
      fullName: user.fullName,
      status: user.status,
      roleCode: user.role?.code ?? null,
      mustChangePassword: user.mustChangePassword,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
