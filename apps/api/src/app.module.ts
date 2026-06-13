import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { BranchModule } from "./branch/branch.module";
import { CategoriesModule } from "./categories/categories.module";
import { CompanyModule } from "./company/company.module";
import { EmployeesModule } from "./employees/employees.module";
import { InventoryModule } from "./inventory/inventory.module";
import { InventoryMovementModule } from './inventory-movement/inventory-movement.module';
import { MeModule } from "./me/me.module";
import { ProductsModule } from "./products/products.module";
import { SuppliersModule } from "./suppliers/suppliers.module";
import { UsersModule } from "./users/users.module";

const envFilePath =
  process.env.APP_ENV === "staging" ? ".env.staging" : ".env.development";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CompanyModule,
    BranchModule,
    MeModule,
    EmployeesModule,
    SuppliersModule,
    InventoryModule,
    InventoryMovementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
