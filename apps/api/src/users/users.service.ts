import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: publicSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: { name: string; email: string; password: string; role: Role }) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, role: dto.role },
      select: publicSelect,
    });
  }

  async update(id: string, dto: { name?: string; role?: Role }) {
    await this.ensure(id);
    return this.prisma.user.update({ where: { id }, data: dto, select: publicSelect });
  }

  async remove(id: string) {
    await this.ensure(id);
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }

  private async ensure(id: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
  }
}
