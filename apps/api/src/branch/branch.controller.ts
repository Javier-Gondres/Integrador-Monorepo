import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CompanyId, RequireCompany } from 'src/common/company';

import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @RequireCompany()
  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.branchService.findAllByCompany(companyId);
  }

  @RequireCompany()
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.findByIdInCompany(id, companyId);
  }

  @RequireCompany()
  @Post()
  create(@Body() dto: CreateBranchDto, @CompanyId() companyId: string) {
    return this.branchService.create(companyId, dto);
  }

  @RequireCompany()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
    @CompanyId() companyId: string,
  ) {
    return this.branchService.update(id, companyId, dto);
  }

  @RequireCompany()
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.activate(id, companyId);
  }

  @RequireCompany()
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.deactivate(id, companyId);
  }

  @RequireCompany()
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.remove(id, companyId);
  }
}
