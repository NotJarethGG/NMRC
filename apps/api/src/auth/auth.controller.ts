import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';
import { GoogleProfile } from './google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  // Anti fuerza bruta: 10 intentos/min por IP
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.id, dto);
  }

  // Recuperar contraseña (anti-abuso: 5/min por IP)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  // --- OAuth Google ---
  // ?state=admin para iniciar desde el panel; cualquier otro valor = storefront
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  google() {
    /* passport redirige a Google */
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleCallback(
    @Req() req: { user: GoogleProfile },
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    const base =
      state === 'admin'
        ? this.config.get<string>('ADMIN_URL') ?? 'http://localhost:5174'
        : this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    try {
      const { token } = await this.auth.loginWithGoogle(req.user);
      // Token por fragmento (#): no llega al servidor del frontend ni a logs
      res.redirect(`${base}/auth/callback#token=${token}`);
    } catch {
      res.redirect(`${base}/auth/callback#error=oauth`);
    }
  }
}
