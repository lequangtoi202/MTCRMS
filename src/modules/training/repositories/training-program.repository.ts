import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TrainingProgramEntity } from '../entities/training-program.entity';

@Injectable()
export class TrainingProgramRepository {
  constructor(
    @InjectRepository(TrainingProgramEntity)
    private readonly programRepository: Repository<TrainingProgramEntity>,
  ) {}

  async findAll(): Promise<TrainingProgramEntity[]> {
    return this.programRepository.find({
      relations: {
        courses: {
          modules: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<TrainingProgramEntity | null> {
    return this.programRepository.findOne({
      where: { id },
      relations: {
        courses: {
          modules: true,
        },
      },
    });
  }

  async findByCode(code: string): Promise<TrainingProgramEntity | null> {
    return this.programRepository.findOne({ where: { code } });
  }

  async save(program: TrainingProgramEntity): Promise<TrainingProgramEntity> {
    return this.programRepository.save(program);
  }

  async remove(program: TrainingProgramEntity): Promise<void> {
    await this.programRepository.remove(program);
  }
}
