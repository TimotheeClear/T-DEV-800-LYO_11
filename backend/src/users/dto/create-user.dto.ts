import { IsEmail, Length } from 'class-validator';

export class CreateUserDto {
  @Length(2, 30)
  username: string;

  @IsEmail()
  email: string;

  @Length(2, 30)
  password: string;
}
