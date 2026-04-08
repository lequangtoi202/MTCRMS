import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RoleEntity } from '../entities/role.entity';
import { UserEntity, UserStatus } from '../entities/user.entity';
import { RoleRepository } from '../repositories/role.repository';
import { UserRepository } from '../repositories/user.repository';
import { PasswordService } from './password.service';

@Injectable()
export class AuthBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const adminMssq = this.configService
      .get<string>('auth.bootstrapAdmin.mssq', '')
      .trim();
    const adminPassword = this.configService.get<string>(
      'auth.bootstrapAdmin.password',
      '',
    );
    const adminFullName = this.configService
      .get<string>('auth.bootstrapAdmin.fullName', '')
      .trim();
    const adminRoleCode = this.configService
      .get<string>('auth.bootstrapAdmin.roleCode', '')
      .trim();

    if (!adminMssq || !adminPassword || !adminFullName || !adminRoleCode) {
      return;
    }

    let role = await this.roleRepository.findByCode(adminRoleCode);

    if (!role) {
      role = new RoleEntity();
      role.code = adminRoleCode;
      role.name = adminRoleCode.replace(/_/g, ' ');
      role.description = 'Bootstrap role for initial authentication setup';
      role = await this.roleRepository.save(role);
    }

    const existingUser = await this.userRepository.findByMssq(adminMssq);

    if (existingUser) {
      return;
    }

    const user = new UserEntity();
    user.mssq = adminMssq;
    user.fullName = adminFullName;
    user.passwordHash = await this.passwordService.hashPassword(adminPassword);
    user.status = UserStatus.ACTIVE;
    user.roleId = role.id;
    user.role = role;
    user.mustChangePassword = true;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = null;

    await this.userRepository.save(user);
    this.logger.log(`Bootstrapped admin user for MSSQ ${adminMssq}`);
  }
}
