import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        role: true,
      },
    });
  }

  async findByMssq(mssq: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { mssq },
      relations: {
        role: true,
      },
    });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }
}
