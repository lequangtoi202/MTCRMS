import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { REQUEST_USER_KEY } from '../decorators/current-user.decorator';
import { TokenService } from '../services/token.service';

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = authorization.slice(7).trim();
    const payload = await this.tokenService.verifyAccessToken(token);

    (request as Request & Record<string, unknown>)[REQUEST_USER_KEY] = payload;

    return true;
  }
}
