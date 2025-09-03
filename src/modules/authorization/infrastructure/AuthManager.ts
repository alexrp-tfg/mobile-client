export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isInitialized: boolean;
}

const AUTH_TOKEN_KEY = 'auth_token';

export class AuthManager {
  private static instance: AuthManager;
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    isAuthenticated: false,
    token: null,
    isInitialized: false,
  };

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private async initializeAuth(): Promise<void> {
    try {
      const storedToken =
        NativeModules.NativeLocalStorageModule.getStorageItem(AUTH_TOKEN_KEY);

      this.state = {
        isAuthenticated: !!storedToken,
        token: storedToken,
        isInitialized: true,
      };

      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
      this.state = {
        isAuthenticated: false,
        token: null,
        isInitialized: true,
      };
      this.notifyListeners();
    }
  }

  getState(): AuthState {
    return { ...this.state };
  }

  setAuthenticated(token: string): void {
    try {
      NativeModules.NativeLocalStorageModule.setStorageItem(
        AUTH_TOKEN_KEY,
        token,
      );

      this.state = {
        isAuthenticated: true,
        token,
        isInitialized: true,
      };
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  setUnauthenticated(): void {
    try {
      NativeModules.NativeLocalStorageModule.setStorageItem(AUTH_TOKEN_KEY, '');

      this.state = {
        isAuthenticated: false,
        token: null,
        isInitialized: true,
      };
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
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
