import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ClientsModule } from '../clients/clients.module';
import { ItemsModule } from '../items/items.module';
import { TransportTypesModule } from '../transport-types/transport-types.module';
import { OrderStatusTransitionService } from '../../domain/sales-orders/order-status-transition.service';
import { SalesOrdersService } from '../../domain/sales-orders/sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';

@Module({
	imports: [AuditModule, ClientsModule, ItemsModule, TransportTypesModule],
	controllers: [SalesOrdersController],
	providers: [SalesOrdersService, OrderStatusTransitionService],
	exports: [SalesOrdersService],
})
export class SalesOrdersModule { }
