import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { TrainingDeliveryType } from '../entities/training-program.entity';

export class UpdateTrainingProgramDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationHours?: number;

  @IsOptional()
  @IsEnum(TrainingDeliveryType)
  deliveryType?: TrainingDeliveryType;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  passCriteria?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
