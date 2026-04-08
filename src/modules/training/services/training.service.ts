import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateTrainingCourseDto } from '../dto/create-training-course.dto';
import { CreateTrainingModuleDto } from '../dto/create-training-module.dto';
import { CreateTrainingProgramDto } from '../dto/create-training-program.dto';
import { UpdateTrainingCourseDto } from '../dto/update-training-course.dto';
import { UpdateTrainingModuleDto } from '../dto/update-training-module.dto';
import { UpdateTrainingProgramDto } from '../dto/update-training-program.dto';
import { TrainingCourseEntity } from '../entities/training-course.entity';
import { TrainingModuleEntity } from '../entities/training-module.entity';
import {
  TrainingDeliveryType,
  TrainingProgramEntity,
} from '../entities/training-program.entity';
import { TrainingCourseRepository } from '../repositories/training-course.repository';
import { TrainingModuleRepository } from '../repositories/training-module.repository';
import { TrainingProgramRepository } from '../repositories/training-program.repository';

@Injectable()
export class TrainingService {
  constructor(
    private readonly programRepository: TrainingProgramRepository,
    private readonly courseRepository: TrainingCourseRepository,
    private readonly moduleRepository: TrainingModuleRepository,
  ) {}

  async createProgram(payload: CreateTrainingProgramDto) {
    await this.ensureProgramCodeIsUnique(payload.code);

    const program = new TrainingProgramEntity();
    program.code = payload.code.trim().toUpperCase();
    program.name = payload.name.trim();
    program.description = payload.description?.trim() ?? null;
    program.durationHours = payload.durationHours ?? 0;
    program.deliveryType = payload.deliveryType ?? TrainingDeliveryType.MIXED;
    program.passCriteria = payload.passCriteria?.trim() ?? null;
    program.isActive = payload.isActive ?? true;

    const createdProgram = await this.programRepository.save(program);

    return {
      message: 'Training program created successfully',
      data: this.toProgramDetail(await this.getProgramOrFail(createdProgram.id)),
    };
  }

  async getPrograms() {
    const programs = await this.programRepository.findAll();

    return {
      message: 'Training programs retrieved successfully',
      data: programs.map((program) => this.toProgramDetail(program)),
    };
  }

  async getProgram(id: string) {
    return {
      message: 'Training program retrieved successfully',
      data: this.toProgramDetail(await this.getProgramOrFail(id)),
    };
  }

  async updateProgram(id: string, payload: UpdateTrainingProgramDto) {
    const program = await this.getProgramOrFail(id);

    if (payload.name) {
      program.name = payload.name.trim();
    }

    if (payload.description !== undefined) {
      program.description = payload.description?.trim() ?? null;
    }

    if (typeof payload.durationHours === 'number') {
      program.durationHours = payload.durationHours;
    }

    if (payload.deliveryType) {
      program.deliveryType = payload.deliveryType;
    }

    if (payload.passCriteria !== undefined) {
      program.passCriteria = payload.passCriteria?.trim() ?? null;
    }

    if (typeof payload.isActive === 'boolean') {
      program.isActive = payload.isActive;
    }

    await this.programRepository.save(program);

    return {
      message: 'Training program updated successfully',
      data: this.toProgramDetail(await this.getProgramOrFail(program.id)),
    };
  }

  async deleteProgram(id: string) {
    const program = await this.getProgramOrFail(id);
    await this.programRepository.remove(program);

    return {
      message: 'Training program deleted successfully',
      data: null,
    };
  }

  async createCourse(programId: string, payload: CreateTrainingCourseDto) {
    const program = await this.getProgramOrFail(programId);
    await this.ensureCourseCodeIsUnique(payload.code);

    const course = new TrainingCourseEntity();
    course.programId = program.id;
    course.program = program;
    course.code = payload.code.trim().toUpperCase();
    course.name = payload.name.trim();
    course.durationHours = payload.durationHours ?? 0;
    course.passCriteria = payload.passCriteria?.trim() ?? null;
    course.sortOrder = payload.sortOrder ?? 0;

    const createdCourse = await this.courseRepository.save(course);

    return {
      message: 'Training course created successfully',
      data: this.toCourseDetail(await this.getCourseOrFail(createdCourse.id)),
    };
  }

  async updateCourse(id: string, payload: UpdateTrainingCourseDto) {
    const course = await this.getCourseOrFail(id);

    if (payload.name) {
      course.name = payload.name.trim();
    }

    if (typeof payload.durationHours === 'number') {
      course.durationHours = payload.durationHours;
    }

    if (payload.passCriteria !== undefined) {
      course.passCriteria = payload.passCriteria?.trim() ?? null;
    }

    if (typeof payload.sortOrder === 'number') {
      course.sortOrder = payload.sortOrder;
    }

    await this.courseRepository.save(course);

    return {
      message: 'Training course updated successfully',
      data: this.toCourseDetail(await this.getCourseOrFail(course.id)),
    };
  }

  async deleteCourse(id: string) {
    const course = await this.getCourseOrFail(id);
    await this.courseRepository.remove(course);

    return {
      message: 'Training course deleted successfully',
      data: null,
    };
  }

  async createModule(courseId: string, payload: CreateTrainingModuleDto) {
    const course = await this.getCourseOrFail(courseId);
    await this.ensureModuleCodeIsUnique(payload.code);

    const moduleItem = new TrainingModuleEntity();
    moduleItem.courseId = course.id;
    moduleItem.course = course;
    moduleItem.code = payload.code.trim().toUpperCase();
    moduleItem.name = payload.name.trim();
    moduleItem.moduleType = payload.moduleType.trim();
    moduleItem.durationHours = payload.durationHours ?? 0;
    moduleItem.passCriteria = payload.passCriteria?.trim() ?? null;
    moduleItem.sortOrder = payload.sortOrder ?? 0;

    const createdModule = await this.moduleRepository.save(moduleItem);

    return {
      message: 'Training module created successfully',
      data: this.toModuleDetail(await this.getModuleOrFail(createdModule.id)),
    };
  }

  async updateModule(id: string, payload: UpdateTrainingModuleDto) {
    const moduleItem = await this.getModuleOrFail(id);

    if (payload.name) {
      moduleItem.name = payload.name.trim();
    }

    if (payload.moduleType) {
      moduleItem.moduleType = payload.moduleType.trim();
    }

    if (typeof payload.durationHours === 'number') {
      moduleItem.durationHours = payload.durationHours;
    }

    if (payload.passCriteria !== undefined) {
      moduleItem.passCriteria = payload.passCriteria?.trim() ?? null;
    }

    if (typeof payload.sortOrder === 'number') {
      moduleItem.sortOrder = payload.sortOrder;
    }

    await this.moduleRepository.save(moduleItem);

    return {
      message: 'Training module updated successfully',
      data: this.toModuleDetail(await this.getModuleOrFail(moduleItem.id)),
    };
  }

  async deleteModule(id: string) {
    const moduleItem = await this.getModuleOrFail(id);
    await this.moduleRepository.remove(moduleItem);

    return {
      message: 'Training module deleted successfully',
      data: null,
    };
  }

  private async getProgramOrFail(id: string) {
    const program = await this.programRepository.findById(id);

    if (!program) {
      throw new NotFoundException('Training program not found');
    }

    return program;
  }

  private async getCourseOrFail(id: string) {
    const course = await this.courseRepository.findById(id);

    if (!course) {
      throw new NotFoundException('Training course not found');
    }

    return course;
  }

  private async getModuleOrFail(id: string) {
    const moduleItem = await this.moduleRepository.findById(id);

    if (!moduleItem) {
      throw new NotFoundException('Training module not found');
    }

    return moduleItem;
  }

  private async ensureProgramCodeIsUnique(code: string) {
    const existingProgram = await this.programRepository.findByCode(
      code.trim().toUpperCase(),
    );

    if (existingProgram) {
      throw new ConflictException('Training program code already exists');
    }
  }

  private async ensureCourseCodeIsUnique(code: string) {
    const existingCourse = await this.courseRepository.findByCode(
      code.trim().toUpperCase(),
    );

    if (existingCourse) {
      throw new ConflictException('Training course code already exists');
    }
  }

  private async ensureModuleCodeIsUnique(code: string) {
    const existingModule = await this.moduleRepository.findByCode(
      code.trim().toUpperCase(),
    );

    if (existingModule) {
      throw new ConflictException('Training module code already exists');
    }
  }

  private toProgramDetail(program: TrainingProgramEntity) {
    return {
      id: program.id,
      code: program.code,
      name: program.name,
      description: program.description,
      durationHours: program.durationHours,
      deliveryType: program.deliveryType,
      passCriteria: program.passCriteria,
      isActive: program.isActive,
      courses: (program.courses ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .map((course) => this.toCourseDetail(course)),
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    };
  }

  private toCourseDetail(course: TrainingCourseEntity) {
    return {
      id: course.id,
      programId: course.programId,
      code: course.code,
      name: course.name,
      durationHours: course.durationHours,
      passCriteria: course.passCriteria,
      sortOrder: course.sortOrder,
      modules: (course.modules ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
        .map((moduleItem) => this.toModuleDetail(moduleItem)),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  private toModuleDetail(moduleItem: TrainingModuleEntity) {
    return {
      id: moduleItem.id,
      courseId: moduleItem.courseId,
      code: moduleItem.code,
      name: moduleItem.name,
      moduleType: moduleItem.moduleType,
      durationHours: moduleItem.durationHours,
      passCriteria: moduleItem.passCriteria,
      sortOrder: moduleItem.sortOrder,
      createdAt: moduleItem.createdAt,
      updatedAt: moduleItem.updatedAt,
    };
  }
}
