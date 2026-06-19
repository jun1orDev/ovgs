import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ClientsModule } from '../clients/clients.module';
import { ItemsModule } from '../items/items.module';
import { TransportTypesModule } from '../transport-types/transport-types.module';
import { OrderStatusTransitionService } from './order-status-transition.service';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';

@Module({
	imports: [AuditModule, ClientsModule, ItemsModule, TransportTypesModule],
	controllers: [SalesOrdersController],
	providers: [SalesOrdersService, OrderStatusTransitionService],
	exports: [SalesOrdersService],
})
export class SalesOrdersModule { }
