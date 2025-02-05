import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

enum tagsSearch {
  AND = 'AND',
  OR = 'OR',
}

export class QueryPictureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  owned: boolean;

  @IsOptional()
  @Transform(({ value }) => value.split(','))
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(tagsSearch)
  tagsSearch?: tagsSearch = tagsSearch.OR;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  since?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  until?: Date;
}
