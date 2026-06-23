import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'fs/promises';

/**
 * Sube imágenes a Cloudinary cuando está configurado.
 * Si no hay credenciales, `ready` es false y el consumidor usa un fallback local.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  readonly ready: boolean;

  constructor(config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET');
    this.ready = Boolean(cloudName && apiKey && apiSecret);
    if (this.ready) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
  }

  /**
   * Sube el archivo del disco a Cloudinary y borra el temporal.
   * Devuelve null si Cloudinary no está listo o si la subida falla.
   */
  async uploadImage(
    filePath: string,
    folder = 'nmrc',
  ): Promise<{ url: string; publicId: string } | null> {
    if (!this.ready) return null;
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: 'image',
      });
      await unlink(filePath).catch(() => undefined);
      return { url: result.secure_url, publicId: result.public_id };
    } catch (err) {
      this.logger.warn(`Cloudinary upload falló: ${(err as Error).message}`);
      return null;
    }
  }
}
