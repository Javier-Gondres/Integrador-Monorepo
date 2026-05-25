import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from "@nestjs/common";

import { CompanyService } from "./company.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Controller("company")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get(":slug")
  findOne(@Param("slug", ValidationPipe) slug: string) {
    return this.companyService.findOne(slug);
  }

  @Patch(":slug")
  update(
    @Param("slug", ValidationPipe) slug: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(slug, updateCompanyDto);
  }

  @Delete(":slug")
  remove(@Param("slug", ValidationPipe) slug: string) {
    return this.companyService.remove(slug);
  }
}
