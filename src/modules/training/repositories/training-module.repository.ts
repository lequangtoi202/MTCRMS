import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TrainingModuleEntity } from '../entities/training-module.entity';

@Injectable()
export class TrainingModuleRepository {
  constructor(
    @InjectRepository(TrainingModuleEntity)
    private readonly moduleRepository: Repository<TrainingModuleEntity>,
  ) {}

  async findById(id: string): Promise<TrainingModuleEntity | null> {
    return this.moduleRepository.findOne({
      where: { id },
      relations: {
        course: {
          program: true,
        },
      },
    });
  }

  async findByCode(code: string): Promise<TrainingModuleEntity | null> {
    return this.moduleRepository.findOne({ where: { code } });
  }

  async save(module: TrainingModuleEntity): Promise<TrainingModuleEntity> {
    return this.moduleRepository.save(module);
  }

  async remove(module: TrainingModuleEntity): Promise<void> {
    await this.moduleRepository.remove(module);
  }
}
