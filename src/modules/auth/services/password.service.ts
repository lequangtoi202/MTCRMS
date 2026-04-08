import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    this.validatePasswordPolicy(password);

    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }

  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, key] = storedHash.split(':');

    if (!salt || !key) {
      throw new UnauthorizedException('Stored password hash is invalid');
    }

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    const storedKeyBuffer = Buffer.from(key, 'hex');

    if (storedKeyBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedKeyBuffer, derivedKey);
  }

  validatePasswordPolicy(password: string): void {
    const minLength = this.configService.get<number>(
      'auth.passwordPolicy.minLength',
      8,
    );

    if (password.length < minLength) {
      throw new BadRequestException(
        `Password must be at least ${minLength} characters long`,
      );
    }

    const rules: Array<[boolean, string]> = [
      [
        this.configService.get<boolean>(
          'auth.passwordPolicy.requireUppercase',
          true,
        ) && !/[A-Z]/.test(password),
        'Password must include at least one uppercase character',
      ],
      [
        this.configService.get<boolean>(
          'auth.passwordPolicy.requireLowercase',
          true,
        ) && !/[a-z]/.test(password),
        'Password must include at least one lowercase character',
      ],
      [
        this.configService.get<boolean>(
          'auth.passwordPolicy.requireNumber',
          true,
        ) && !/\d/.test(password),
        'Password must include at least one number',
      ],
      [
        this.configService.get<boolean>(
          'auth.passwordPolicy.requireSpecial',
          true,
        ) && !/[^\w\s]/.test(password),
        'Password must include at least one special character',
      ],
    ];

    const failedRule = rules.find(([hasFailed]) => hasFailed);

    if (failedRule) {
      throw new BadRequestException(failedRule[1]);
    }
  }
}
