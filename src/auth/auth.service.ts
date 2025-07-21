import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as dayjs from 'dayjs';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GoogleAuthService } from './providers/google/google-auth.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
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

    // 4. Cria uma sessão para o usuário
    return this._createSession(user);
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

    // 3. Verifica se o usuário tem senha definida
    if (!user.password) {
      throw new UnauthorizedException('Usuário sem senha, use o login social.');
    }

    // 4. Comparar a senha enviada com a do banco
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // 5. Se as senhas não baterem, lança um erro
    if (!isPasswordMatch) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    // 6. Cria uma sessão para o usuário
    return this._createSession(user);
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const { code } = googleLoginDto;

    // 1. Obtém os tokens do Google
    const { access_token } =
      await this.googleAuthService.getAuthGoogleAccessToken(code);

    // 2. Obtém as informações do usuário do Google
    const { name, email, avatar } =
      await this.googleAuthService.getAuthGoogleUserInfo(access_token);

    // 3. Verifica se o usuário já existe
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 4. Se não existir, cria um novo usuário
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          avatar,
        },
      });
    }

    // 3. Cria uma sessão para o usuário
    return this._createSession(user);
  }

  async logout(token: string) {
    await this.prisma.userSession.deleteMany({
      where: {
        token,
      },
    });

    return;
  }

  private async _createSession(user: User) {
    // 1. Gerar o token JWT
    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);

    const expiresAt = dayjs().add(30, 'days').toDate();

    // 2. Criar uma sessão no banco de dados
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    return {
      success: true,
      statusCode: 201,
      message: 'Usuário autenticado com sucesso.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    };
  }
}
