export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isInitialized: boolean;
}

export class AuthManager {
  private static instance: AuthManager;
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    isAuthenticated: false,
    token: null,
    isInitialized: true,
  };

  private constructor() {}

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  getState(): AuthState {
    return { ...this.state };
  }

  setAuthenticated(token: string): void {
    this.state = {
      isAuthenticated: true,
      token,
      isInitialized: true,
    };
    this.notifyListeners();
  }

  setUnauthenticated(): void {
    this.state = {
      isAuthenticated: false,
      token: null,
      isInitialized: true,
    };
    this.notifyListeners();
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }
}
