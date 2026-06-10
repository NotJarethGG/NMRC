import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { NewsletterController } from './newsletter.controller';

@Module({
  controllers: [SettingsController, NewsletterController],
})
export class SettingsModule {}
