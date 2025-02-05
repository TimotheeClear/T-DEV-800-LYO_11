import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';

export class CreatePictureDto {
  @IsOptional()
  @Length(2, 30)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value))
  @IsArray()
  @IsString({ each: true })
  @Length(2, 30, { each: true })
  tags?: string[];
}
