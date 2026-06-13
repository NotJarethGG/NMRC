import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IsEmail } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class SubscribeDto {
  @IsEmail()
  email: string;
}

@Controller('newsletter')
export class NewsletterController {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  // Público: suscripción a la lista (idempotente)
  @Post()
  async subscribe(@Body() dto: SubscribeDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.subscriber.findUnique({ where: { email } });
    await this.prisma.subscriber.upsert({ where: { email }, create: { email }, update: {} });
    // Bienvenida solo en alta nueva (no en re-suscripción)
    if (!existing) void this.mail.sendWaitlistWelcome(email);
    return { ok: true };
  }

  // Staff: lista de suscriptores
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  list() {
    return this.prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
