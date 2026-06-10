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
import { unlink } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'STAFF')
@Controller('upload')
export class UploadController {
  private readonly cloudinaryReady: boolean;

  constructor(private config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
    this.cloudinaryReady = Boolean(cloudName && apiKey && apiSecret);
    if (this.cloudinaryReady) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
  }

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
    if (this.cloudinaryReady) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'nmrc',
          resource_type: 'image',
        });
        await unlink(file.path).catch(() => undefined);
        return { url: result.secure_url, filename: result.public_id };
      } catch {
        // Si Cloudinary falla, conservamos el archivo local como respaldo
      }
    }

    // Fallback: filesystem local (efímero en Render)
    const base = this.config.get<string>('PUBLIC_URL') ?? 'http://localhost:3000';
    return { url: `${base}/uploads/${file.filename}`, filename: file.filename };
  }
}
