import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { SalesOrdersModule } from '../sales-orders/sales-orders.module';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from '../../domain/scheduling/scheduling.service';

@Module({
	imports: [AuditModule, SalesOrdersModule],
	controllers: [SchedulingController],
	providers: [SchedulingService],
})
export class SchedulingModule { }
