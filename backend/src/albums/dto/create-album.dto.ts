import { Length } from 'class-validator';

export class CreateAlbumDto {
  @Length(2, 30)
  name: string;
}
