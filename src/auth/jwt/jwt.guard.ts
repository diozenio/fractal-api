/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    console.log('Token from cookie:', token);

    if (!token) {
      throw new UnauthorizedException('Token não encontrado.');
    }

    try {
      // 1. Verifica se o token JWT é válido
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 2. Verifica se a sessão existe no banco de dados
      const session = await this.prisma.userSession.findUnique({
        where: { token },
      });

      if (!session) {
        throw new UnauthorizedException('Sessão inválida.');
      }

      // 3. Busca o usuário e anexa à requisição

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        // Opcional: remova a senha do objeto de usuário
        select: { id: true, name: true, email: true, avatar: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado.');
      }

      request['user'] = user;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const cookieName =
      this.configService.get<string>('JWT_COOKIE_NAME') || 'session_token';
    console.log('Cookies:', request.cookies);
    const token = request.cookies?.[cookieName];
    return token;
  }
}
