import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
