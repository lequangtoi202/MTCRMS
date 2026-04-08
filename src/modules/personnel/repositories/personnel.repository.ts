import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { ListPersonnelDto } from '../dto/list-personnel.dto';
import { PersonnelEntity } from '../entities/personnel.entity';

@Injectable()
export class PersonnelRepository {
  constructor(
    @InjectRepository(PersonnelEntity)
    private readonly personnelRepository: Repository<PersonnelEntity>,
  ) {}

  async findById(id: string): Promise<PersonnelEntity | null> {
    return this.personnelRepository.findOne({
      where: { id },
      relations: {
        unit: true,
      },
    });
  }

  async findByMssq(mssq: string): Promise<PersonnelEntity | null> {
    return this.personnelRepository.findOne({
      where: { mssq },
    });
  }

  async search(query: ListPersonnelDto): Promise<PersonnelEntity[]> {
    const qb = this.createBaseQueryBuilder();

    if (query.mssq) {
      qb.andWhere('personnel.mssq = :mssq', {
        mssq: query.mssq.trim().toUpperCase(),
      });
    }

    if (query.q) {
      qb.andWhere(
        '(personnel.mssq LIKE :keyword OR personnel.full_name LIKE :keyword)',
        {
          keyword: `%${query.q.trim()}%`,
        },
      );
    }

    if (query.unitId) {
      qb.andWhere('personnel.unit_id = :unitId', { unitId: query.unitId });
    }

    if (query.rank) {
      qb.andWhere('personnel.rank = :rank', { rank: query.rank.trim() });
    }

    if (query.status) {
      qb.andWhere('personnel.status = :status', { status: query.status });
    }

    qb.orderBy('personnel.full_name', 'ASC');

    return qb.getMany();
  }

  async save(personnel: PersonnelEntity): Promise<PersonnelEntity> {
    return this.personnelRepository.save(personnel);
  }

  async remove(personnel: PersonnelEntity): Promise<void> {
    await this.personnelRepository.remove(personnel);
  }

  private createBaseQueryBuilder(): SelectQueryBuilder<PersonnelEntity> {
    return this.personnelRepository
      .createQueryBuilder('personnel')
      .leftJoinAndSelect('personnel.unit', 'unit');
  }
}
