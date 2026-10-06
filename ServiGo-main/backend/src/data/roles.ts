export const ROLES = {
  ADMIN: "ADMIN",
  PRO: "PRO",
  CLI: "CLI",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
