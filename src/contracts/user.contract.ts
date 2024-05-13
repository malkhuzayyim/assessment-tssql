export type Role = "ADMIN" | "USER";
export type User = {
  email: string;
  password: string;
  name: string;
  timezone: string;
  locale: string;
  role: Role
};