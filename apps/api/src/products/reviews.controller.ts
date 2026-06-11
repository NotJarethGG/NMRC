import { Controller, Delete, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Moderación de valoraciones (staff)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@Controller('reviews')
export class ReviewsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.prisma.review.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Valoración no encontrada');
    });
    return { ok: true };
  }
}
