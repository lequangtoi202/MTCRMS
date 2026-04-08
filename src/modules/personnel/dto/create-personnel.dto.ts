import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PersonnelStatus } from '../entities/personnel.entity';

export class CreatePersonnelDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  mssq!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  rank!: string;

  @IsOptional()
  @IsEnum(PersonnelStatus)
  status?: PersonnelStatus;

  @IsUUID()
  unitId!: string;

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
