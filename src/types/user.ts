export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  defaultModel: 'flash' | 'pro';
  theme: 'light' | 'dark';
  language: string;
}
