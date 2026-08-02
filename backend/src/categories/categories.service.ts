import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0E00-\u0E7F\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.category.findMany({
      where: {
        status: 'ACTIVE',
        ...(search?.trim()
          ? { name: { contains: search.trim(), mode: 'insensitive' } }
          : {}),
      },
      orderBy: { name: 'asc' },
      take: 30,
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  /** Find existing category by name (case-insensitive) or create a shared one. */
  async findOrCreateByName(name: string) {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      throw new NotFoundException('Category name is too short');
    }

    const existing = await this.prisma.category.findFirst({
      where: {
        status: 'ACTIVE',
        name: { equals: trimmed, mode: 'insensitive' },
      },
    });
    if (existing) return existing;

    const base = slugify(trimmed) || `cat-${Date.now().toString(36)}`;
    let slug = base;
    let i = 0;
    while (await this.prisma.category.findUnique({ where: { slug } })) {
      i += 1;
      slug = `\( {base}- \){i}`;
    }

    return this.prisma.category.create({
      data: { name: trimmed, slug, status: 'ACTIVE' },
    });
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.category.update({ where: { id }, data: { status: 'ARCHIVED' } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
}