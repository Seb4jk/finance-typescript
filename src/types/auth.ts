export interface TokenPayload {
  id: string;
  email: string;
  role_id: number;
  exp?: number;
  iat?: number;
}
