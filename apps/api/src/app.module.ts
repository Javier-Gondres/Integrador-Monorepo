import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { CashRegistersModule } from './cash-registers/cash-registers.module';
import { CategoriesModule } from './categories/categories.module';
import { CompanyModule } from './company/company.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DiscountsModule } from './discounts/discounts.module';
import { EmployeesModule } from './employees/employees.module';
import { InventoryModule } from './inventory/inventory.module';
import { InventoryMovementModule } from './inventory-movement/inventory-movement.module';
import { InvitationsModule } from './invitations/invitations.module';
import { MeModule } from './me/me.module';
import { PayablesModule } from './payables/payables.module';
import { PlatformModule } from './platform/platform.module';
import { ProductSupplierModule } from './product-supplier/product-supplier.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ReturnsModule } from './returns/returns.module';
import { SalesModule } from './sales/sales.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { TransfersModule } from './transfers/transfers.module';
import { UsersModule } from './users/users.module';

const envFilePath =
  process.env.APP_ENV === 'staging' ? '.env.staging' : '.env.development';

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
    CustomersModule,
    CompanyModule,
    BranchModule,
    MeModule,
    PlatformModule,
    EmployeesModule,
    DiscountsModule,
    SuppliersModule,
    CashRegistersModule,
    InventoryModule,
    InventoryMovementModule,
    InvitationsModule,
    TransfersModule,
    ProductSupplierModule,
    PurchasesModule,
    ReturnsModule,
    SalesModule,
    ReservationsModule,
    DashboardModule,
    ReceivablesModule,
    PayablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
