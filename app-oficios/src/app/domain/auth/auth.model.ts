export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  nombre: string;
  apellido: string;
  email: string;
  idUsuario: number | null;
  documento: string | null;
  telefono: string | null;
  nacimiento: string | null;
  idDireccion: number | null;
}

export interface User {
  id: number | null;
  name: string;
  lastName: string;
  email: string;
  documento: string | null;
  telefono: string | null;
  nacimiento: string | null;
  idDireccion: number | null;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
}
