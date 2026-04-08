import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findByCode(code: string): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({
      where: { code },
    });
  }

  async save(role: RoleEntity): Promise<RoleEntity> {
    return this.roleRepository.save(role);
  }
}
