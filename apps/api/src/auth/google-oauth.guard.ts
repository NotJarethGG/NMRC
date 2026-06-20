import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

// Propaga el parámetro ?state= a Google y de vuelta, para saber el origen
// del login (storefront vs admin) y redirigir al lugar correcto.
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const state = typeof req.query?.state === 'string' ? req.query.state : undefined;
    return state ? { state } : {};
  }
}
