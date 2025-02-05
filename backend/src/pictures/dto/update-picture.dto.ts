import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';
import { CreatePictureDto } from './create-picture.dto';

export class UpdatePictureDto extends PartialType(
  OmitType(CreatePictureDto, ['tags']),
) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(2, 30, { each: true })
  tags?: string[];
}
