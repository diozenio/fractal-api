import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

const MIN_LENGTH = 8;

export class SignupDto {
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
  name!: string;

  @IsEmail({}, { message: 'O e-mail informado não é válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(MIN_LENGTH, {
    message: `A senha deve ter no mínimo ${MIN_LENGTH} caracteres.`,
  })
  @Matches(/[A-Z]/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula.',
  })
  @Matches(/[a-z]/, {
    message: 'A senha deve conter pelo menos uma letra minúscula.',
  })
  @Matches(/\d/, {
    message: 'A senha deve conter pelo menos um número.',
  })
  @Matches(/[^\w\s]/, {
    message: 'A senha deve conter pelo menos um caractere especial (@$!%*?#&).',
  })
  password!: string;
}
