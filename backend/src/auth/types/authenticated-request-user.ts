import { UserRole } from '@prisma/client';

/** Shape of `request.user` after the JWT access-token strategy validates a token. */
export interface AuthenticatedRequestUser {
  userId: string;
  email: string;
  role: UserRole;
}
