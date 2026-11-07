import { IAuthRepository, SessionUser } from './IAuthRepository';

interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string; // Stored as plain text for mock purposes
}

export class MockAuthRepository implements IAuthRepository {
  private listeners: ((userId: string | null) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'mmo_auth_session') {
          const userId = e.newValue;
          this.notifyListeners(userId);
        }
      });

      // Seed default admin user if not present in mock database
      const users = this.getUsers();
      if (!users.some((u) => u.email.toLowerCase() === 'admin@test.persistentmmo.dev')) {
        users.push({
          id: 'admin',
          email: 'admin@test.persistentmmo.dev',
          username: 'TestAdmin',
          passwordHash: 'AdminTest123!',
        });
        this.saveUsers(users);
      }
    }
  }

  private notifyListeners(userId: string | null) {
    this.listeners.forEach((listener) => listener(userId));
  }

  private getUsers(): UserRecord[] {
    if (typeof window === 'undefined') return [];
    const usersStr = localStorage.getItem('mmo_auth_users');
    return usersStr ? JSON.parse(usersStr) : [];
  }

  private saveUsers(users: UserRecord[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('mmo_auth_users', JSON.stringify(users));
  }

  async signUp(username: string, email: string, password: string): Promise<{ user: SessionUser | null; error: Error | null }> {
    // Basic validations
    if (username.length < 3 || username.length > 30) {
      return { user: null, error: new Error('Username must be between 3 and 30 characters.') };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { user: null, error: new Error('Username can only contain letters, numbers, hyphens, and underscores.') };
    }
    if (!email.includes('@')) {
      return { user: null, error: new Error('Invalid email address.') };
    }
    if (password.length < 6) {
      return { user: null, error: new Error('Password must be at least 6 characters.') };
    }

    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: new Error('Email already exists.') };
    }
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { user: null, error: new Error('Username already exists.') };
    }

    const newUser: UserRecord = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      email,
      username,
      passwordHash: password, // Plain text for mock simplicity
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto sign in
    localStorage.setItem('mmo_auth_session', newUser.id);
    this.notifyListeners(newUser.id);

    return {
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
      error: null,
    };
  }

  async signIn(email: string, password: string): Promise<{ user: SessionUser | null; error: Error | null }> {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password);

    if (!user) {
      return { user: null, error: new Error('Invalid email or password.') };
    }

    localStorage.setItem('mmo_auth_session', user.id);
    this.notifyListeners(user.id);

    return {
      user: { id: user.id, email: user.email, username: user.username },
      error: null,
    };
  }

  async signOut(): Promise<{ error: Error | null }> {
    localStorage.removeItem('mmo_auth_session');
    this.notifyListeners(null);
    return { error: null };
  }

  async getSessionUser(): Promise<SessionUser | null> {
    if (typeof window === 'undefined') return null;
    const currentSessionId = localStorage.getItem('mmo_auth_session');
    if (!currentSessionId) return null;

    const users = this.getUsers();
    let user = users.find((u) => u.id === currentSessionId);
    if (!user && currentSessionId === 'local_player') {
      user = {
        id: 'local_player',
        email: 'wanderer@reignward.local',
        username: 'Kael the Bold',
        passwordHash: 'local',
      };
      users.push(user);
      this.saveUsers(users);
    }
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  startLocalSession(characterName: string = 'Kael the Bold'): SessionUser {
    if (typeof window === 'undefined') {
      return { id: 'local_player', email: 'wanderer@reignward.local', username: characterName };
    }
    const users = this.getUsers();
    let user = users.find((u) => u.id === 'local_player');
    if (!user) {
      user = {
        id: 'local_player',
        email: 'wanderer@reignward.local',
        username: characterName,
        passwordHash: 'local',
      };
      users.push(user);
    } else if (characterName && characterName !== 'local_player') {
      user.username = characterName;
    }
    this.saveUsers(users);
    localStorage.setItem('mmo_auth_session', 'local_player');
    this.notifyListeners('local_player');
    return { id: 'local_player', email: user.email, username: user.username };
  }

  onAuthStateChange(callback: (userId: string | null) => void): () => void {
    this.listeners.push(callback);
    // Initial call
    const currentSessionId = typeof window !== 'undefined' ? localStorage.getItem('mmo_auth_session') : null;
    callback(currentSessionId);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  async signInWithOAuth(provider: 'google' | 'discord'): Promise<{ error: Error | null }> {
    if (typeof window === 'undefined') return { error: null };
    
    // Simulate successful login with a mock third-party account
    const email = `${provider}-tester@aegismmo.dev`;
    const username = `${provider}_lord`;
    
    // Find or create user
    const users = this.getUsers();
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {
        id: `${provider}-mock-id-${Math.random().toString(36).substring(2, 9)}`,
        email,
        username,
        passwordHash: '',
      };
      users.push(user);
      this.saveUsers(users);
    }
    
    // Log user in
    localStorage.setItem('mmo_auth_session', user.id);
    this.notifyListeners(user.id);
    return { error: null };
  }
}
