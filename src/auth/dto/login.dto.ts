import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'O e-mail informado não é válido.' })
  @IsNotEmpty({ message: 'O campo e-mail não pode estar vazio.' })
  email!: string;

  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @IsNotEmpty({ message: 'O campo senha não pode estar vazio.' })
  password!: string;
}
