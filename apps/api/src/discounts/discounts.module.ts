import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { DiscountsController } from './discounts.controller';
import { DiscountsRepository } from './discounts.repository';
import { DiscountsService } from './discounts.service';

@Module({
  imports: [AuthModule, ProductsModule, CategoriesModule],
  controllers: [DiscountsController],
  providers: [DiscountsRepository, DiscountsService],
})
export class DiscountsModule {}