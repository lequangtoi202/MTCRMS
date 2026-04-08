import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TrainingCourseEntity } from './training-course.entity';

export enum TrainingDeliveryType {
  THEORY = 'THEORY',
  PRACTICAL = 'PRACTICAL',
  MIXED = 'MIXED',
}

@Entity({ name: 'training_programs' })
export class TrainingProgramEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description!: string | null;

  @Column({ name: 'duration_hours', type: 'int', default: 0 })
  durationHours!: number;

  @Column({
    name: 'delivery_type',
    type: 'varchar',
    length: 20,
    default: TrainingDeliveryType.MIXED,
  })
  deliveryType!: TrainingDeliveryType;

  @Column({ name: 'pass_criteria', type: 'varchar', length: 255, nullable: true })
  passCriteria!: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => TrainingCourseEntity, (course) => course.program)
  courses!: TrainingCourseEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
