import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CompanyModule } from "./company/company.module";
import { UsersModule } from "./users/users.module";

const envFilePath =
  process.env.APP_ENV === "staging" ? ".env.staging" : ".env.development";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    UsersModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
