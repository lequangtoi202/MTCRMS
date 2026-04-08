import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PersonnelStatus } from '../entities/personnel.entity';

export class UpdatePersonnelDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  rank?: string;

  @IsOptional()
  @IsEnum(PersonnelStatus)
  status?: PersonnelStatus;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  positionTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}
