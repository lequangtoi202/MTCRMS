import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UnitsModule } from '../units/units.module';
import { PersonnelController } from './controllers/personnel.controller';
import { PersonnelEntity } from './entities/personnel.entity';
import { PersonnelRepository } from './repositories/personnel.repository';
import { PersonnelService } from './services/personnel.service';

@Module({
  imports: [TypeOrmModule.forFeature([PersonnelEntity]), AuthModule, UnitsModule],
  controllers: [PersonnelController],
  providers: [PersonnelService, PersonnelRepository],
})
export class PersonnelModule {}
