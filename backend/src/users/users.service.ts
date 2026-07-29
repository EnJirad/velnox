import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
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
