import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTrainingCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

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
