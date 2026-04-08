import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateTrainingModuleDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  moduleType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationHours?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  passCriteria?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
