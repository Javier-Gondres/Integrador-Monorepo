import { Module } from '@nestjs/common';
import { InventoryMovementService } from './inventory-movement.service';
import { InventoryMovementController } from './inventory-movement.controller';

@Module({
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService],
})
export class InventoryMovementModule {}
