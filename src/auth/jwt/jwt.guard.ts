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
import { RedisService } from 'src/redis/redis.service'; // Importa o RedisService
import { UserSession } from '@prisma/client'; // Importa o modelo UserSession

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly REDIS_SESSION_PREFIX = 'user_session:'; // Define o prefixo das sessões no Redis

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private configService: ConfigService,
    private redisService: RedisService, // Injeta o RedisService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Token não encontrado.');
    }

    try {
      // 1. Verifica a sessão no Redis primeiro
      const redisKey = `${this.REDIS_SESSION_PREFIX}${token}`;
      const cachedSession = await this.redisService.get(redisKey);
      let session: UserSession | null = null;

      if (cachedSession) {
        session = JSON.parse(cachedSession) as UserSession;
      } else {
        // Caso não esteja no Redis, verifica no banco de dados
        session = await this.prisma.userSession.findUnique({
          where: { token },
        });

        if (session) {
          // Se encontrada no banco, armazena no Redis
          const expiresInSeconds = Math.ceil(
            (session.expiresAt.getTime() - Date.now()) / 1000,
          );
          if (expiresInSeconds > 0) {
            await this.redisService.set(
              redisKey,
              JSON.stringify(session),
              'EX',
              expiresInSeconds,
            );
          }
        }
      }

      if (!session) {
        throw new UnauthorizedException('Sessão inválida.');
      }

      // 2. Verifica a validade do token JWT (ainda importante para garantir integridade)
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Garante que o userId do payload corresponde ao da sessão
      if (payload.sub !== session.userId) {
        throw new UnauthorizedException('Token inválido ou expirado.');
      }

      // 3. Busca o usuário e anexa à requisição
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, avatar: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado.');
      }

      request['user'] = user;
    } catch {
      // Remove o cache do Redis em caso de falha na validação do token/sessão
      const redisKey = `${this.REDIS_SESSION_PREFIX}${token}`;
      await this.redisService.del(redisKey);
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const cookieName =
      this.configService.get<string>('JWT_COOKIE_NAME') || 'session_token';
    const token = request.cookies?.[cookieName];
    return token;
  }
}
