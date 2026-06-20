import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto';
import { GoogleProfile } from './google.strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Correos que deben tener rol ADMIN al entrar con Google (env ADMIN_EMAILS)
  private isAdminEmail(email: string) {
    return (this.config.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .includes(email.toLowerCase());
  }

  private async sign(user: { id: string; email: string; role: string; name: string }) {
    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Ese correo ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
        address: dto.address,
        role: 'CUSTOMER',
      },
    });
    return this.sign(user);
  }

  // OAuth: busca por googleId o email; crea la cuenta si no existe
  async loginWithGoogle(profile: GoogleProfile) {
    if (!profile.email) throw new UnauthorizedException('Google no devolvió un correo');

    const shouldBeAdmin = this.isAdminEmail(profile.email);

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.googleId }, { email: profile.email }] },
    });

    if (user) {
      // Vincular googleId y/o promover a ADMIN si el correo está autorizado
      const data: Prisma.UserUpdateInput = {};
      if (!user.googleId) data.googleId = profile.googleId;
      if (shouldBeAdmin && user.role === 'CUSTOMER') data.role = 'ADMIN';
      if (Object.keys(data).length) {
        user = await this.prisma.user.update({ where: { id: user.id }, data });
      }
    } else {
      // Cuenta nueva vía Google: password aleatorio (solo entra por OAuth)
      const passwordHash = await bcrypt.hash(randomUUID(), 10);
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          passwordHash,
          googleId: profile.googleId,
          role: shouldBeAdmin ? 'ADMIN' : 'CUSTOMER',
        },
      });
    }

    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return this.sign(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no válido');

    const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('La contraseña actual no es correcta');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });
    return user;
  }
}
