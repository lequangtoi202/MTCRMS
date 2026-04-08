import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  AuthAuditAction,
  AuthAuditLogEntity,
} from '../entities/auth-audit-log.entity';

interface CreateAuditLogParams {
  userId?: string | null;
  mssq: string;
  action: AuthAuditAction;
  success: boolean;
  failureReason?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuthAuditLogRepository {
  constructor(
    @InjectRepository(AuthAuditLogEntity)
    private readonly auditLogRepository: Repository<AuthAuditLogEntity>,
  ) {}

  async createLog(params: CreateAuditLogParams): Promise<AuthAuditLogEntity> {
    const auditLog = this.auditLogRepository.create({
      userId: params.userId ?? null,
      mssq: params.mssq,
      action: params.action,
      success: params.success,
      failureReason: params.failureReason ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    });

    return this.auditLogRepository.save(auditLog);
  }
}
