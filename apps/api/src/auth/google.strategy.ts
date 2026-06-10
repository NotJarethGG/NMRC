import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  googleId: string;
  email?: string;
  name: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      // Si aún no hay credenciales (vacías o ausentes), la estrategia arranca igual
      // con placeholders y Google rechazará el flujo hasta configurarlas.
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'unset',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'unset',
      callbackURL: `${config.get<string>('PUBLIC_URL') || 'http://localhost:3000'}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleProfile {
    return {
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'Cliente NMRC',
    };
  }
}
