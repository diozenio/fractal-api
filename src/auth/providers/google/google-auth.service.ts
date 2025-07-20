/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  GOOGLE_OAUTH_TOKEN_URL,
  GOOGLE_OAUTH_USERINFO_URL,
} from 'src/constants/auth';

@Injectable()
export class GoogleAuthService {
  private readonly clientId = process.env.GOOGLE_CLIENT_ID!;
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI!;

  async getGoogleAccessToken(code: string) {
    const params = new URLSearchParams({
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new InternalServerErrorException('Falha ao obter token do Google');
    }

    const data = await response.json();
    return data;
  }

  async getGoogleUserInfo(accessToken: string) {
    const response = await fetch(GOOGLE_OAUTH_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        'Falha ao buscar perfil do usuário Google',
      );
    }

    const data = await response.json();
    return data;
  }
}
