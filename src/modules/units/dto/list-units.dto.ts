import { IsBooleanString, IsOptional, IsUUID } from 'class-validator';

export class ListUnitsDto {
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBooleanString()
  includeInactive?: string;
}
