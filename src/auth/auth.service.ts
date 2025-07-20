import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, name, password } = signupDto;

    // 1. Verifica se o e-mail já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    // 2. Faz o hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Cria o usuário no banco
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // 4. Gera um token JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    // 5. Retorna o token e os dados do usuário
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Encontrar o usuário pelo e-mail
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Se não encontrar, lança um erro
    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // 3. Comparar a senha enviada com a do banco
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // 4. Se as senhas não baterem, lança um erro
    if (!isPasswordMatch) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // 5. Gerar o Token JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    // 6. Retornar o token e os dados do usuário
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
