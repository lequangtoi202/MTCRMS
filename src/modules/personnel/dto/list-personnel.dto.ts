import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { PersonnelStatus } from '../entities/personnel.entity';

export class ListPersonnelDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  mssq?: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  rank?: string;

  @IsOptional()
  @IsEnum(PersonnelStatus)
  status?: PersonnelStatus;
}
