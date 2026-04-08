import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';

import { AuthSessionEntity } from '../entities/auth-session.entity';

interface CreateSessionParams {
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuthSessionRepository {
  constructor(
    @InjectRepository(AuthSessionEntity)
    private readonly sessionRepository: Repository<AuthSessionEntity>,
  ) {}

  async createSession(params: CreateSessionParams): Promise<AuthSessionEntity> {
    const session = this.sessionRepository.create({
      userId: params.userId,
      refreshTokenHash: params.refreshTokenHash,
      expiresAt: params.expiresAt,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });

    return this.sessionRepository.save(session);
  }

  async findActiveByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<AuthSessionEntity | null> {
    return this.sessionRepository.findOne({
      where: {
        refreshTokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: {
        user: {
          role: true,
        },
      },
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      revokedAt: new Date(),
    });
  }
}
