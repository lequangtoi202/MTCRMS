import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TrainingCourseEntity } from '../entities/training-course.entity';

@Injectable()
export class TrainingCourseRepository {
  constructor(
    @InjectRepository(TrainingCourseEntity)
    private readonly courseRepository: Repository<TrainingCourseEntity>,
  ) {}

  async findById(id: string): Promise<TrainingCourseEntity | null> {
    return this.courseRepository.findOne({
      where: { id },
      relations: {
        program: true,
        modules: true,
      },
    });
  }

  async findByCode(code: string): Promise<TrainingCourseEntity | null> {
    return this.courseRepository.findOne({ where: { code } });
  }

  async save(course: TrainingCourseEntity): Promise<TrainingCourseEntity> {
    return this.courseRepository.save(course);
  }

  async remove(course: TrainingCourseEntity): Promise<void> {
    await this.courseRepository.remove(course);
  }
}
