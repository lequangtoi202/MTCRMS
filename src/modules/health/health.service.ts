import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealth() {
    return {
      message: 'Service is healthy',
      data: {
        service: 'mtcrms-backend',
        environment: this.configService.get<string>('app.nodeEnv'),
        uptime: process.uptime(),
      },
    };
  }
}
