import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CurrentUser } from '../decorators/current-user.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { CurrentUserGuard } from '../guards/current-user.guard';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() payload: LoginDto, @Req() request: Request) {
    return this.authService.login(payload, this.extractRequestContext(request));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() payload: RefreshTokenDto, @Req() request: Request) {
    return this.authService.refresh(payload, this.extractRequestContext(request));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() payload: LogoutDto, @Req() request: Request) {
    return this.authService.logout(payload, this.extractRequestContext(request));
  }

  @Post('change-password')
  @UseGuards(CurrentUserGuard)
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ChangePasswordDto,
    @Req() request: Request,
  ) {
    return this.authService.changePassword(
      user,
      payload,
      this.extractRequestContext(request),
    );
  }

  private extractRequestContext(request: Request): {
    ipAddress: string | null;
    userAgent: string | null;
  } {
    const userAgentHeader = request.headers['user-agent'];

    return {
      ipAddress: request.ip ?? null,
      userAgent:
        typeof userAgentHeader === 'string' ? userAgentHeader : userAgentHeader?.[0] ?? null,
    };
  }
}
