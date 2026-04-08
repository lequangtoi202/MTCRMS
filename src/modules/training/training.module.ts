import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { TrainingController } from './controllers/training.controller';
import { TrainingCourseEntity } from './entities/training-course.entity';
import { TrainingModuleEntity } from './entities/training-module.entity';
import { TrainingProgramEntity } from './entities/training-program.entity';
import { TrainingCourseRepository } from './repositories/training-course.repository';
import { TrainingModuleRepository } from './repositories/training-module.repository';
import { TrainingProgramRepository } from './repositories/training-program.repository';
import { TrainingService } from './services/training.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingProgramEntity,
      TrainingCourseEntity,
      TrainingModuleEntity,
    ]),
    AuthModule,
  ],
  controllers: [TrainingController],
  providers: [
    TrainingService,
    TrainingProgramRepository,
    TrainingCourseRepository,
    TrainingModuleRepository,
  ],
})
export class TrainingModule {}
