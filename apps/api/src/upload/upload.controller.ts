import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CloudinaryService } from './cloudinary.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@Controller('upload')
export class UploadController {
  constructor(
    private config: ConfigService,
    private cloudinary: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
      fileFilter: (_req, file, cb) => {
        const ok = /image\/(jpe?g|png|webp|avif|gif)/.test(file.mimetype);
        cb(ok ? null : new BadRequestException('Solo se permiten imágenes'), ok);
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');

    // Con Cloudinary configurado: sube a la nube (persistente) y limpia el disco
    const uploaded = await this.cloudinary.uploadImage(file.path);
    if (uploaded) {
      return { url: uploaded.url, filename: uploaded.publicId };
    }

    // Fallback: filesystem local (efímero en Render)
    const base = this.config.get<string>('PUBLIC_URL') ?? 'http://localhost:3000';
    return { url: `${base}/uploads/${file.filename}`, filename: file.filename };
  }
}
