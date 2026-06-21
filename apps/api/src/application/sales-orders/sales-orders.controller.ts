import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalesOrdersService } from '../../domain/sales-orders/sales-orders.service';
import {
	CreateSalesOrderDto,
	ListSalesOrdersQueryDto,
	UpdateSalesOrderStatusDto,
	UpdateSalesOrderTransportDto,
} from '../../domain/sales-orders/dto/sales-order.dto';

@ApiTags('sales-orders')
@Controller('sales-orders')
export class SalesOrdersController {
	constructor(private readonly salesOrdersService: SalesOrdersService) { }

	@Post()
	create(@Body() dto: CreateSalesOrderDto) {
		return this.salesOrdersService.create(dto);
	}

	@Get()
	findAll(@Query() query: ListSalesOrdersQueryDto) {
		return this.salesOrdersService.findAll(query);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.salesOrdersService.findOne(id);
	}

	@Patch(':id/status')
	changeStatus(@Param('id') id: string, @Body() dto: UpdateSalesOrderStatusDto) {
		return this.salesOrdersService.changeStatus(id, dto);
	}

	@Patch(':id/transport')
	changeTransport(@Param('id') id: string, @Body() dto: UpdateSalesOrderTransportDto) {
		return this.salesOrdersService.changeTransport(id, dto);
	}
}
