import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";

import { CategoriesModule } from "../categories/categories.module";
import { ProductsController } from "./products.controller";
import { ProductsRepository } from "./products.repository";
import { ProductsService } from "./products.service";

@Module({
  imports: [AuthModule, CategoriesModule],
  controllers: [ProductsController],
  providers: [ProductsRepository, ProductsService],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
