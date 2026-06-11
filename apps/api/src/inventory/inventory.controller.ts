import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  Company,
  type CompanyContext,
  CompanyId,
  RequireCompany,
} from "src/common/company";

import { CreateInventoryDto } from "./dto/create-inventory.dto";
import { QueryInventoryDto } from "./dto/query-inventory.dto";
import { UpdateInventoryDto } from "./dto/update-inventory.dto";
import { InventoryService } from "./inventory.service";

@Controller("inventories")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequireCompany()
  @Post()
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CompanyId() companyId: string,
  ) {
    return this.inventoryService.create(createInventoryDto, companyId);
  }

  @RequireCompany()
  @Get()
  findAll(@Company() company: CompanyContext, @Query() query: QueryInventoryDto) {
    return this.inventoryService.findAllByBranch(company, query);
  }

  @RequireCompany()
  @Get(":id")
  findById(@Param("id") id: string, @CompanyId() companyId: string) {
    return this.inventoryService.findById(id, companyId);
  }

  @RequireCompany()
  @Patch(":id")
  update(
    @Param("id") id: string,
    @CompanyId() companyId: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, companyId, updateInventoryDto);
  }
}
