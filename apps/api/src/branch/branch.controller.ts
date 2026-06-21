import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Permission } from '@repo/shared';
import { CompanyId } from 'src/common/company';
import { RequirePermissions } from 'src/common/permissions';

import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @RequirePermissions(Permission.BRANCHES_READ)
  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.branchService.findAllByCompany(companyId);
  }

  @RequirePermissions(Permission.BRANCHES_READ)
  @Get(':id')
  findById(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.findByIdInCompany(id, companyId);
  }

  @RequirePermissions(Permission.BRANCHES_CREATE)
  @Post()
  create(@Body() dto: CreateBranchDto, @CompanyId() companyId: string) {
    return this.branchService.create(companyId, dto);
  }

  @RequirePermissions(Permission.BRANCHES_UPDATE)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
    @CompanyId() companyId: string,
  ) {
    return this.branchService.update(id, companyId, dto);
  }

  @RequirePermissions(Permission.BRANCHES_UPDATE)
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.activate(id, companyId);
  }

  @RequirePermissions(Permission.BRANCHES_UPDATE)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.deactivate(id, companyId);
  }

  @RequirePermissions(Permission.BRANCHES_DELETE)
  @Delete(':id')
  remove(@Param('id') id: string, @CompanyId() companyId: string) {
    return this.branchService.remove(id, companyId);
  }
}
