import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UnitRepository } from '../../units/repositories/unit.repository';
import { CreatePersonnelDto } from '../dto/create-personnel.dto';
import { ListPersonnelDto } from '../dto/list-personnel.dto';
import { UpdatePersonnelDto } from '../dto/update-personnel.dto';
import { PersonnelEntity, PersonnelStatus } from '../entities/personnel.entity';
import { PersonnelRepository } from '../repositories/personnel.repository';

@Injectable()
export class PersonnelService {
  constructor(
    private readonly personnelRepository: PersonnelRepository,
    private readonly unitRepository: UnitRepository,
  ) {}

  async create(payload: CreatePersonnelDto) {
    await this.ensureMssqIsUnique(payload.mssq);
    const unit = await this.getUnitOrFail(payload.unitId);

    const personnel = new PersonnelEntity();
    personnel.mssq = payload.mssq.trim().toUpperCase();
    personnel.fullName = payload.fullName.trim();
    personnel.rank = payload.rank.trim();
    personnel.status = payload.status ?? PersonnelStatus.ACTIVE;
    personnel.unitId = payload.unitId;
    personnel.unit = unit;
    personnel.dateOfBirth = payload.dateOfBirth ?? null;
    personnel.positionTitle = payload.positionTitle?.trim() ?? null;
    personnel.notes = payload.notes?.trim() ?? null;

    const createdPersonnel = await this.personnelRepository.save(personnel);
    const createdPersonnelWithUnit = await this.getPersonnelOrFail(
      createdPersonnel.id,
    );

    return {
      message: 'Personnel created successfully',
      data: this.toPersonnelDetail(createdPersonnelWithUnit),
    };
  }

  async findAll(query: ListPersonnelDto) {
    const records = await this.personnelRepository.search(query);

    return {
      message: 'Personnel retrieved successfully',
      data: records.map((record) => this.toPersonnelDetail(record)),
      meta: {
        total: records.length,
      },
    };
  }

  async findOne(id: string) {
    const personnel = await this.getPersonnelOrFail(id);

    return {
      message: 'Personnel retrieved successfully',
      data: this.toPersonnelDetail(personnel),
    };
  }

  async update(id: string, payload: UpdatePersonnelDto) {
    const personnel = await this.getPersonnelOrFail(id);

    if (payload.unitId && payload.unitId !== personnel.unitId) {
      const targetUnit = await this.getUnitOrFail(payload.unitId);
      personnel.unitId = payload.unitId;
      personnel.unit = targetUnit;
    }

    if (payload.fullName) {
      personnel.fullName = payload.fullName.trim();
    }

    if (payload.rank) {
      personnel.rank = payload.rank.trim();
    }

    if (payload.status) {
      personnel.status = payload.status;
    }

    if (payload.dateOfBirth !== undefined) {
      personnel.dateOfBirth = payload.dateOfBirth ?? null;
    }

    if (payload.positionTitle !== undefined) {
      personnel.positionTitle = payload.positionTitle?.trim() ?? null;
    }

    if (payload.notes !== undefined) {
      personnel.notes = payload.notes?.trim() ?? null;
    }

    const updatedPersonnel = await this.personnelRepository.save(personnel);
    const updatedPersonnelWithUnit = await this.getPersonnelOrFail(
      updatedPersonnel.id,
    );

    return {
      message: 'Personnel updated successfully',
      data: this.toPersonnelDetail(updatedPersonnelWithUnit),
    };
  }

  async remove(id: string) {
    const personnel = await this.getPersonnelOrFail(id);
    await this.personnelRepository.remove(personnel);

    return {
      message: 'Personnel deleted successfully',
      data: null,
    };
  }

  private async getPersonnelOrFail(id: string): Promise<PersonnelEntity> {
    const personnel = await this.personnelRepository.findById(id);

    if (!personnel) {
      throw new NotFoundException('Personnel not found');
    }

    return personnel;
  }

  private async ensureMssqIsUnique(mssq: string): Promise<void> {
    const existingRecord = await this.personnelRepository.findByMssq(
      mssq.trim().toUpperCase(),
    );

    if (existingRecord) {
      throw new ConflictException('Personnel MSSQ already exists');
    }
  }

  private async getUnitOrFail(unitId: string) {
    const unit = await this.unitRepository.findById(unitId);

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  private toPersonnelDetail(personnel: PersonnelEntity) {
    return {
      id: personnel.id,
      mssq: personnel.mssq,
      fullName: personnel.fullName,
      rank: personnel.rank,
      status: personnel.status,
      unitId: personnel.unitId,
      unitName: personnel.unit?.name ?? null,
      positionTitle: personnel.positionTitle,
      dateOfBirth: personnel.dateOfBirth,
      notes: personnel.notes,
      createdAt: personnel.createdAt,
      updatedAt: personnel.updatedAt,
    };
  }
}
