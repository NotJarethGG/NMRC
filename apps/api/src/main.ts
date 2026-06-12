import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Fail-fast: en producción el JWT_SECRET es obligatorio (sin fallback inseguro)
  if (process.env.NODE_ENV === 'production' && !config.get<string>('JWT_SECRET')) {
    throw new Error('JWT_SECRET es obligatorio en producción');
  }

  // Headers de seguridad. CORP cross-origin para que /uploads se vea desde Vercel.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // API JSON; CSP aplica en los frontends
    }),
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const origins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    // Permite: orígenes configurados, localhost (dev) y solo despliegues nmrc-*.vercel.app
    origin: (origin, cb) => {
      const allowAll = origins.includes('*');
      const ok =
        !origin ||
        allowAll ||
        origins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^https:\/\/nmrc-[a-z0-9-]+\.vercel\.app$/.test(origin);
      cb(null, ok);
    },
    credentials: true,
  });

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`NMRC API escuchando en http://localhost:${port}/api`);
}
bootstrap();
