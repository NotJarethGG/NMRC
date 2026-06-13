import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

// Global: cualquier servicio puede inyectar MailService sin reimportar el módulo
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
