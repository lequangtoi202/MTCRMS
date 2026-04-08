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
import { CreateUnitDto } from '../dto/create-unit.dto';
import { ListUnitsDto } from '../dto/list-units.dto';
import { UpdateUnitDto } from '../dto/update-unit.dto';
import { UnitsService } from '../services/units.service';

@Controller('units')
@UseGuards(CurrentUserGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  create(@Body() payload: CreateUnitDto) {
    return this.unitsService.create(payload);
  }

  @Get()
  findAll(@Query() query: ListUnitsDto) {
    return this.unitsService.findAll(query);
  }

  @Get('tree')
  getTree(@Query('includeInactive') includeInactive?: string) {
    return this.unitsService.getTree(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateUnitDto) {
    return this.unitsService.update(id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
