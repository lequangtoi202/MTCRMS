export interface AuthenticatedUser {
  sub: string;
  mssq: string;
  roleCode: string | null;
}
