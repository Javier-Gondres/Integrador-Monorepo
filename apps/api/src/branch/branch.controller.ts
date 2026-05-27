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

import { BranchService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@Controller("companies/:companySlug/branch")
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  create(
    @Body() createBranchDto: CreateBranchDto,
    @Param("companySlug", ValidationPipe) slug: string,
  ) {
    return this.branchService.create(createBranchDto, slug);
  }

  @Get()
  findAll(@Param("companySlug", ValidationPipe) slug: string) {
    return this.branchService.findAll(slug);
  }

  @Get(":id")
  findOne(@Param("id", ValidationPipe) id: string) {
    return this.branchService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ValidationPipe) id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(":id")
  remove(@Param("id", ValidationPipe) id: string) {
    return this.branchService.remove(id);
  }
}
