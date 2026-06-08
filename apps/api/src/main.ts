import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

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
    // Permite: orígenes configurados, comodín "*", localhost (dev) y cualquier *.vercel.app
    origin: (origin, cb) => {
      const allowAll = origins.includes('*');
      const ok =
        !origin ||
        allowAll ||
        origins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /\.vercel\.app$/.test(origin);
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
