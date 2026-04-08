import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './controllers/auth.controller';
import { AuthAuditLogEntity } from './entities/auth-audit-log.entity';
import { AuthSessionEntity } from './entities/auth-session.entity';
import { RoleEntity } from './entities/role.entity';
import { UserEntity } from './entities/user.entity';
import { CurrentUserGuard } from './guards/current-user.guard';
import { AuthBootstrapService } from './services/auth-bootstrap.service';
import { AuthAuditLogRepository } from './repositories/auth-audit-log.repository';
import { AuthSessionRepository } from './repositories/auth-session.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UserEntity,
      RoleEntity,
      AuthSessionEntity,
      AuthAuditLogEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthBootstrapService,
    PasswordService,
    TokenService,
    UserRepository,
    RoleRepository,
    AuthSessionRepository,
    AuthAuditLogRepository,
    CurrentUserGuard,
  ],
  exports: [CurrentUserGuard, TokenService],
})
export class AuthModule {}
