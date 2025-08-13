export type User = {
  id: string;
  email: string;
  name?: string;
  password?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthGoogleAccessToken = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
};

export type AuthGoogleUserInfo = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
};
