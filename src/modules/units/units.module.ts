import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UnitEntity } from './entities/unit.entity';
import { UnitRepository } from './repositories/unit.repository';
import { UnitsController } from './controllers/units.controller';
import { UnitsService } from './services/units.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnitEntity]), AuthModule],
  controllers: [UnitsController],
  providers: [UnitsService, UnitRepository],
  exports: [UnitsService, UnitRepository],
})
export class UnitsModule {}
