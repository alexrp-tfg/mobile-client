import type { IHttpService } from '../../../shared/domain/interfaces.js';

export class LoginUserUseCase {
  constructor(private readonly httpService: IHttpService) {}

  async execute(username: string, password: string): Promise<boolean> {
    try {
      return await this.httpService.login(username, password);
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }
}
