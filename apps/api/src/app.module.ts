import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { CategoriesModule } from './categories/categories.module';
import { CompanyModule } from './company/company.module';
import { MeModule } from './me/me.module';
import { ProductsModule } from './products/products.module';
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
    CompanyModule,
    BranchModule,
    MeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
