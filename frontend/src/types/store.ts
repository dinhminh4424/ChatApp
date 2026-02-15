import type { User } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean | null;

  clearState: () => void;

  setAccessToken: (newAccessToken: string) => void;

  // Định nghĩa SignUp
  signUp: (
    userName: string,
    email: string,
    password: string,
    lastName: string,
    firstName: string,
  ) => Promise<void>;

  // Định Nghĩa SignIn
  signIn: (userName: string, password: string) => Promise<void>;

  // Định Nghĩa LogOut
  signOut: () => Promise<void>;

  // Định Nghĩa fetchMe
  fetchMe: () => Promise<void>;

  // định nghĩa
  refreshToken: () => Promise<void>;
}
