import type { AxiosInstance } from 'axios';

export interface LoginParams {
  email: string;
  password: string;
}

export interface Session {
  token: string;
  email: string;
}

export interface IAuthService {
  login(params: LoginParams): Promise<Session>;
}

export class AuthService implements IAuthService {
  constructor(private readonly api: AxiosInstance) {}

  async login(params: LoginParams): Promise<Session> {
    const { data } = await this.api.post('/auth/login', params);
    return data.data;
  }
}
