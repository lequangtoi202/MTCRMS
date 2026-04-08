import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { TrainingDeliveryType } from '../entities/training-program.entity';

export class CreateTrainingProgramDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

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
