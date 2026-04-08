import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  mssq!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  password!: string;
}
