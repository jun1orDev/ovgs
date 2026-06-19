import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { OrderStatus } from '../../sales-orders/enums/order-status.enum';

export class ListMonitoringQueryDto {
	@ApiPropertyOptional({ enum: OrderStatus })
	@IsOptional()
	@IsEnum(OrderStatus)
	status?: OrderStatus;

	@ApiPropertyOptional({ example: 'client-uuid' })
	@IsOptional()
	@IsUUID()
	clientId?: string;

	@ApiPropertyOptional({ example: 'transport-type-uuid' })
	@IsOptional()
	@IsUUID()
	transportTypeId?: string;

	@ApiPropertyOptional({ example: '2026-06-18' })
	@IsOptional()
	@IsDateString()
	date?: string;

	@ApiPropertyOptional({ example: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@ApiPropertyOptional({ example: 10, default: 10 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	pageSize?: number;
}
