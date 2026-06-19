import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from './clients/clients.module';
import { TransportTypesModule } from './transport-types/transport-types.module';
import { ItemsModule } from './items/items.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AuditModule } from './audit/audit.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		PrismaModule,
		ClientsModule,
		TransportTypesModule,
		ItemsModule,
		SalesOrdersModule,
		SchedulingModule,
		MonitoringModule,
		AuditModule,
	],
})
export class AppModule { }
