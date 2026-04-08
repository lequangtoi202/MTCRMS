import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TrainingModuleEntity } from './training-module.entity';
import { TrainingProgramEntity } from './training-program.entity';

@Entity({ name: 'training_courses' })
export class TrainingCourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'program_id', type: 'char', length: 36 })
  programId!: string;

  @ManyToOne(() => TrainingProgramEntity, (program) => program.courses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'program_id' })
  program!: TrainingProgramEntity;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'duration_hours', type: 'int', default: 0 })
  durationHours!: number;

  @Column({ name: 'pass_criteria', type: 'varchar', length: 255, nullable: true })
  passCriteria!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany(() => TrainingModuleEntity, (module) => module.course)
  modules!: TrainingModuleEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
