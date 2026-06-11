import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ReviewsController } from './reviews.controller';
import { StockAlertsController } from './stock-alerts.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController, ReviewsController, StockAlertsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
