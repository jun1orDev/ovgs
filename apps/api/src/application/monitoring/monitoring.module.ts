import { Module } from '@nestjs/common';
import { SalesOrdersModule } from '../sales-orders/sales-orders.module';
import { MonitoringController } from './monitoring.controller';

@Module({
	imports: [SalesOrdersModule],
	controllers: [MonitoringController],
})
export class MonitoringModule { }
