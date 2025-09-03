import { AuthManager } from '../../infrastructure/AuthManager.js';

export class LogoutUserUseCase {
  constructor() {}

  execute(): void {
    const authManager = AuthManager.getInstance();
    authManager.setUnauthenticated();
  }
}
