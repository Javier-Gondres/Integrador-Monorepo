import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthContext } from 'src/auth/auth.types';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { JwtAuth } from 'src/auth/decorators/jwt-auth.decorator';
import { RequireCompanyOwnerOrPlatformAdmin } from 'src/common/company';

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @JwtAuth()
  @Post()
  create(@Auth() auth: AuthContext, @Body() dto: CreateCompanyDto) {
    return this.companyService.createOnboarding(auth, dto);
  }

  @JwtAuth()
  @Get('my')
  findMy(@Auth() auth: AuthContext) {
    return this.companyService.findMyCompanies(auth.userId);
  }

  @RequireCompanyOwnerOrPlatformAdmin()
  @Get(':id')
  findById(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.companyService.findByIdForUser(id, auth);
  }

  @RequireCompanyOwnerOrPlatformAdmin()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Auth() auth: AuthContext,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, auth, dto);
  }

  @RequireCompanyOwnerOrPlatformAdmin()
  @Patch(':id/activate')
  activate(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.companyService.activate(id, auth);
  }

  @RequireCompanyOwnerOrPlatformAdmin()
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.companyService.deactivate(id, auth);
  }

  @RequireCompanyOwnerOrPlatformAdmin()
  @Delete(':id')
  remove(@Param('id') id: string, @Auth() auth: AuthContext) {
    return this.companyService.remove(id, auth);
  }
}
