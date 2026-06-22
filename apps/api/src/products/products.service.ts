import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateProductDto, UpdateProductDto } from './dto';

const productInclude = {
  category: true,
  collection: true,
  images: { orderBy: { position: 'asc' } },
  variants: { orderBy: { size: 'asc' } },
} satisfies Prisma.ProductInclude;

export interface ProductQuery {
  category?: string;
  collection?: string;
  search?: string;
  featured?: string;
  includeAll?: string; // admin: incluir DRAFT/ARCHIVED
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductQuery) {
    const where: Prisma.ProductWhereInput = {};

    if (query.includeAll !== 'true') where.status = ProductStatus.ACTIVE;
    if (query.featured === 'true') where.featured = true;
    if (query.category) where.category = { slug: query.category };
    if (query.collection) where.collection = { slug: query.collection };
    if (query.search) {
      where.name = { contains: query.search };
    }

    return this.prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        ...productInclude,
        // El detalle incluye valoraciones (con nombre del autor)
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  // Crea o actualiza la valoración del usuario para un producto (1 por usuario)
  async upsertReview(productId: string, userId: string, rating: number, comment?: string) {
    await this.findById(productId);
    return this.prisma.review.upsert({
      where: { productId_userId: { productId, userId } },
      create: { productId, userId, rating, comment },
      update: { rating, comment },
      include: { user: { select: { name: true } } },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  private async uniqueSlug(name: string, ignoreId?: string) {
    const base = slugify(name);
    let slug = base;
    let n = 1;
    // garantizar unicidad
    while (true) {
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (!existing || existing.id === ignoreId) break;
      slug = `${base}-${n++}`;
    }
    return slug;
  }

  async create(dto: CreateProductDto) {
    const slug = await this.uniqueSlug(dto.name);
    return this.prisma.product.create({
      data: {
        name: dto.name,
        nameEn: dto.nameEn || null,
        slug,
        description: dto.description,
        descriptionEn: dto.descriptionEn || null,
        priceCents: dto.priceCents,
        compareAtPriceCents: dto.compareAtPriceCents || null,
        categoryId: dto.categoryId,
        collectionId: dto.collectionId || null,
        status: dto.status ?? ProductStatus.DRAFT,
        featured: dto.featured ?? false,
        variants: { create: dto.variants.map((v) => ({ size: v.size, stock: v.stock })) },
        images: {
          create: (dto.images ?? []).map((img, i) => ({
            url: img.url,
            position: img.position ?? i,
          })),
        },
      },
      include: productInclude,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);

    const data: Prisma.ProductUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = dto.name;
      data.slug = await this.uniqueSlug(dto.name, id);
    }
    if (dto.nameEn !== undefined) data.nameEn = dto.nameEn || null;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.descriptionEn !== undefined) data.descriptionEn = dto.descriptionEn || null;
    if (dto.priceCents !== undefined) data.priceCents = dto.priceCents;
    if (dto.compareAtPriceCents !== undefined) data.compareAtPriceCents = dto.compareAtPriceCents || null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.categoryId !== undefined) data.category = { connect: { id: dto.categoryId } };
    if (dto.collectionId !== undefined) {
      data.collection = dto.collectionId
        ? { connect: { id: dto.collectionId } }
        : { disconnect: true };
    }

    // Reemplazo total de variants/imágenes cuando se envían
    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });

      if (dto.variants) {
        const incoming = new Set(dto.variants.map((v) => v.size));
        // borrar variants que ya no están y sin pedidos asociados se intenta; si falla por FK, se ignora
        const current = await tx.productVariant.findMany({ where: { productId: id } });
        for (const v of current) {
          if (!incoming.has(v.size)) {
            await tx.productVariant
              .delete({ where: { id: v.id } })
              .catch(() => undefined);
          }
        }
        for (const v of dto.variants) {
          await tx.productVariant.upsert({
            where: { productId_size: { productId: id, size: v.size } },
            create: { productId: id, size: v.size, stock: v.stock },
            update: { stock: v.stock },
          });
        }
      }

      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: dto.images.map((img, i) => ({
            productId: id,
            url: img.url,
            position: img.position ?? i,
          })),
        });
      }

      return tx.product.findUnique({ where: { id }, include: productInclude });
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.product.delete({ where: { id } });
    return { ok: true };
  }

  // Productos con bajo stock (para el dashboard)
  async lowStock(threshold = 5) {
    const variants = await this.prisma.productVariant.findMany({
      where: { stock: { lte: threshold } },
      include: { product: { select: { id: true, name: true, slug: true } } },
      orderBy: { stock: 'asc' },
    });
    return variants;
  }
}
