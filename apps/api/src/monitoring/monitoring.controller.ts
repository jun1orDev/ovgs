import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListSalesOrdersQueryDto } from '../sales-orders/dto/sales-order.dto';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';

@ApiTags('monitoring')
@Controller('monitoring/sales-orders')
export class MonitoringController {
	constructor(private readonly salesOrdersService: SalesOrdersService) { }

	@Get()
	findAll(@Query() query: ListSalesOrdersQueryDto) {
		return this.salesOrdersService.findMonitoringSummary(query);
	}
}
