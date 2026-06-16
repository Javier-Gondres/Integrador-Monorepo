import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';

import { InventoryMovementController } from './inventory-movement.controller';
import { InventoryMovementRepository } from './inventory-movement.repository';
import { InventoryMovementService } from './inventory-movement.service';

@Module({
  imports: [AuthModule],
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService, InventoryMovementRepository],
})
export class InventoryMovementModule {}
