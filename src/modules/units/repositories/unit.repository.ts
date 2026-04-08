import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { UnitEntity } from '../entities/unit.entity';

@Injectable()
export class UnitRepository {
  constructor(
    @InjectRepository(UnitEntity)
    private readonly unitRepository: Repository<UnitEntity>,
  ) {}

  async findAll(): Promise<UnitEntity[]> {
    return this.unitRepository.find({
      order: {
        level: 'ASC',
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findRoots(includeInactive: boolean): Promise<UnitEntity[]> {
    return this.unitRepository.find({
      where: {
        parentId: IsNull(),
        ...(includeInactive ? {} : { isActive: true }),
      },
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<UnitEntity | null> {
    return this.unitRepository.findOne({
      where: { id },
      relations: {
        parent: true,
        children: true,
      },
    });
  }

  async findByCode(code: string): Promise<UnitEntity | null> {
    return this.unitRepository.findOne({
      where: { code },
    });
  }

  async save(unit: UnitEntity): Promise<UnitEntity> {
    return this.unitRepository.save(unit);
  }

  async remove(unit: UnitEntity): Promise<void> {
    await this.unitRepository.remove(unit);
  }
}
