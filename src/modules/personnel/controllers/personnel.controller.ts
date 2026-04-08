import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUserGuard } from '../../auth/guards/current-user.guard';
import { CreatePersonnelDto } from '../dto/create-personnel.dto';
import { ListPersonnelDto } from '../dto/list-personnel.dto';
import { UpdatePersonnelDto } from '../dto/update-personnel.dto';
import { PersonnelService } from '../services/personnel.service';

@Controller('personnel')
@UseGuards(CurrentUserGuard)
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Post()
  create(@Body() payload: CreatePersonnelDto) {
    return this.personnelService.create(payload);
  }

  @Get()
  findAll(@Query() query: ListPersonnelDto) {
    return this.personnelService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personnelService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdatePersonnelDto) {
    return this.personnelService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personnelService.remove(id);
  }
}
