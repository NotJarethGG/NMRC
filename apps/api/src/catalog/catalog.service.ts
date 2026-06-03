import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  // --- Categorías ---
  listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  createCategory(name: string) {
    return this.prisma.category.create({ data: { name, slug: slugify(name) } });
  }

  async updateCategory(id: string, name: string) {
    await this.ensureCategory(id);
    return this.prisma.category.update({ where: { id }, data: { name, slug: slugify(name) } });
  }

  async removeCategory(id: string) {
    await this.ensureCategory(id);
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureCategory(id: string) {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Categoría no encontrada');
  }

  // --- Colecciones ---
  listCollections() {
    return this.prisma.collection.findMany({ orderBy: { name: 'asc' } });
  }

  createCollection(data: { name: string; description?: string; heroImage?: string }) {
    return this.prisma.collection.create({
      data: { ...data, slug: slugify(data.name) },
    });
  }

  async updateCollection(id: string, data: { name?: string; description?: string; heroImage?: string }) {
    await this.ensureCollection(id);
    const patch: any = { ...data };
    if (data.name) patch.slug = slugify(data.name);
    return this.prisma.collection.update({ where: { id }, data: patch });
  }

  async removeCollection(id: string) {
    await this.ensureCollection(id);
    await this.prisma.collection.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureCollection(id: string) {
    const c = await this.prisma.collection.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Colección no encontrada');
  }
}
