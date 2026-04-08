import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUserGuard } from '../../auth/guards/current-user.guard';
import { CreateTrainingCourseDto } from '../dto/create-training-course.dto';
import { CreateTrainingModuleDto } from '../dto/create-training-module.dto';
import { CreateTrainingProgramDto } from '../dto/create-training-program.dto';
import { UpdateTrainingCourseDto } from '../dto/update-training-course.dto';
import { UpdateTrainingModuleDto } from '../dto/update-training-module.dto';
import { UpdateTrainingProgramDto } from '../dto/update-training-program.dto';
import { TrainingService } from '../services/training.service';

@Controller('training-programs')
@UseGuards(CurrentUserGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  createProgram(@Body() payload: CreateTrainingProgramDto) {
    return this.trainingService.createProgram(payload);
  }

  @Get()
  getPrograms() {
    return this.trainingService.getPrograms();
  }

  @Get(':id')
  getProgram(@Param('id') id: string) {
    return this.trainingService.getProgram(id);
  }

  @Patch(':id')
  updateProgram(
    @Param('id') id: string,
    @Body() payload: UpdateTrainingProgramDto,
  ) {
    return this.trainingService.updateProgram(id, payload);
  }

  @Delete(':id')
  deleteProgram(@Param('id') id: string) {
    return this.trainingService.deleteProgram(id);
  }

  @Post(':programId/courses')
  createCourse(
    @Param('programId') programId: string,
    @Body() payload: CreateTrainingCourseDto,
  ) {
    return this.trainingService.createCourse(programId, payload);
  }

  @Patch('courses/:id')
  updateCourse(
    @Param('id') id: string,
    @Body() payload: UpdateTrainingCourseDto,
  ) {
    return this.trainingService.updateCourse(id, payload);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) {
    return this.trainingService.deleteCourse(id);
  }

  @Post('courses/:courseId/modules')
  createModule(
    @Param('courseId') courseId: string,
    @Body() payload: CreateTrainingModuleDto,
  ) {
    return this.trainingService.createModule(courseId, payload);
  }

  @Patch('modules/:id')
  updateModule(
    @Param('id') id: string,
    @Body() payload: UpdateTrainingModuleDto,
  ) {
    return this.trainingService.updateModule(id, payload);
  }

  @Delete('modules/:id')
  deleteModule(@Param('id') id: string) {
    return this.trainingService.deleteModule(id);
  }
}
