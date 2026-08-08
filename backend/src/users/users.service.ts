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

  // ---------- Addresses (customer) ----------

  listAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    });
  }

  async createAddress(
    userId: string,
    data: {
      name: string;
      phone: string;
      addressLine: string;
      city: string;
      province: string;
      postalCode: string;
      country?: string;
      isDefault?: boolean;
    },
  ) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: {
        userId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        addressLine: data.addressLine.trim(),
        city: data.city.trim(),
        province: data.province.trim(),
        postalCode: data.postalCode.trim(),
        country: (data.country ?? 'TH').trim() || 'TH',
        isDefault: !!data.isDefault,
      },
    });
  }


  async updateAddress(
    userId: string,
    addressId: string,
    data: {
      name?: string;
      phone?: string;
      addressLine?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      country?: string;
      isDefault?: boolean;
    },
  ) {
    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Address not found');
    }
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.addressLine !== undefined
          ? { addressLine: data.addressLine.trim() }
          : {}),
        ...(data.city !== undefined ? { city: data.city.trim() } : {}),
        ...(data.province !== undefined ? { province: data.province.trim() } : {}),
        ...(data.postalCode !== undefined
          ? { postalCode: data.postalCode.trim() }
          : {}),
        ...(data.country !== undefined
          ? { country: data.country.trim() || 'TH' }
          : {}),
        ...(data.isDefault !== undefined ? { isDefault: !!data.isDefault } : {}),
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Address not found');
    }
    await this.prisma.address.delete({ where: { id: addressId } });
    return { success: true };
  }
}