export interface JwtPayload {
  sub: number;
  email: string;
  rol: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
}