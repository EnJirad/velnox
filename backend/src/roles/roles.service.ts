import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Foundation role service: centralizes the role list and hierarchy so
 * guards, seed scripts, and admin tooling share a single source of truth.
 */
@Injectable()
export class RolesService {
  private readonly hierarchy: UserRole[] = ['CUSTOMER', 'MERCHANT', 'ADMIN', 'SUPER_ADMIN'];

  getAllRoles(): UserRole[] {
    return this.hierarchy;
  }

  isAtLeast(role: UserRole, minimumRole: UserRole): boolean {
    return this.hierarchy.indexOf(role) >= this.hierarchy.indexOf(minimumRole);
  }
}
