import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, AuthUser } from './current-user.decorator';
import { GoogleProfile } from './google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }

  // --- OAuth Google ---
  @Get('google')
  @UseGuards(AuthGuard('google'))
  google() {
    /* passport redirige a Google */
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: { user: GoogleProfile }, @Res() res: Response) {
    const front = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    try {
      const { token } = await this.auth.loginWithGoogle(req.user);
      // Token por fragmento (#): no llega al servidor del frontend ni a logs
      res.redirect(`${front}/auth/callback#token=${token}`);
    } catch {
      res.redirect(`${front}/auth/callback#error=oauth`);
    }
  }
}
