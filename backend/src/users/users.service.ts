import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private strip(user: { passwordHash?: string; [k: string]: unknown }) {
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.strip(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  /** Admin: โปรไฟล์ + ที่อยู่ + ออเดอร์ล่าสุด */
  async findAdminDetail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            items: { include: { product: { select: { id: true, name: true } } } },
          },
        },
        merchant: { include: { shops: true } },
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _p, ...safe } = user;
    const orderStats = {
      totalOrders: user.orders.length,
      totalSpent: user.orders.reduce((s, o) => s + Number(o.total), 0),
    };
    return { ...safe, orderStats };
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot change status of SUPER_ADMIN');
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
    });
    return this.strip(updated);
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto, actorRole: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can edit SUPER_ADMIN');
    }
    if (dto.role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only SUPER_ADMIN can assign SUPER_ADMIN');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });
    return this.strip(updated);
  }

  /** ลบผู้ใช้ (ห้ามลบ SUPER_ADMIN) — cascade ตาม schema */
  async adminDelete(id: string, actorRole: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot delete SUPER_ADMIN');
    }
    if (actorRole !== 'SUPER_ADMIN' && actorRole !== 'ADMIN') {
      throw new ForbiddenException('Insufficient permissions');
    }
    await this.prisma.user.delete({ where: { id } });
    return { success: true, id };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.name || dto.phone) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.phone ? { phone: dto.phone } : {}),
        },
      });
    }

    if (dto.avatarUrl) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        update: { avatarUrl: dto.avatarUrl },
        create: { userId, avatarUrl: dto.avatarUrl },
      });
    }

    return this.findById(userId);
  }
}
