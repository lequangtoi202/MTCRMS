import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UnitEntity } from '../../units/entities/unit.entity';

export enum PersonnelStatus {
  ACTIVE = 'ACTIVE',
  RESERVE = 'RESERVE',
  INACTIVE = 'INACTIVE',
}

@Entity({ name: 'personnel' })
export class PersonnelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  mssq!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName!: string;

  @Column({ type: 'varchar', length: 100 })
  rank!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PersonnelStatus.ACTIVE,
  })
  status!: PersonnelStatus;

  @Column({ name: 'unit_id', type: 'char', length: 36 })
  unitId!: string;

  @ManyToOne(() => UnitEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_id' })
  unit!: UnitEntity;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: string | null;

  @Column({ name: 'position_title', type: 'varchar', length: 150, nullable: true })
  positionTitle!: string | null;

  @Column({ name: 'notes', type: 'varchar', length: 255, nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
