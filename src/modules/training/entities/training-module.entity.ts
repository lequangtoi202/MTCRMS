import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TrainingCourseEntity } from './training-course.entity';

@Entity({ name: 'training_modules' })
export class TrainingModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'course_id', type: 'char', length: 36 })
  courseId!: string;

  @ManyToOne(() => TrainingCourseEntity, (course) => course.modules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: TrainingCourseEntity;

  @Column({ type: 'varchar', length: 50, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'module_type', type: 'varchar', length: 100 })
  moduleType!: string;

  @Column({ name: 'duration_hours', type: 'int', default: 0 })
  durationHours!: number;

  @Column({ name: 'pass_criteria', type: 'varchar', length: 255, nullable: true })
  passCriteria!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
