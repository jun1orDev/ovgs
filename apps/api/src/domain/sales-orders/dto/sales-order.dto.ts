import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateSalesOrderItemDto {
	@ApiPropertyOptional({ example: 'item-uuid' })
	@IsUUID()
	itemId: string;

	@ApiPropertyOptional({ example: 1, default: 1 })
	@IsOptional()
	@IsInt()
	@Min(1)
	quantity?: number;
}

export class CreateSalesOrderDto {
	@ApiPropertyOptional({ example: 'client-uuid' })
	@IsUUID()
	clientId: string;

	@ApiPropertyOptional({ example: 'transport-type-uuid' })
	@IsUUID()
	transportTypeId: string;

	@ApiPropertyOptional({ type: [CreateSalesOrderItemDto] })
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateSalesOrderItemDto)
	items: CreateSalesOrderItemDto[];
}

export class UpdateSalesOrderStatusDto {
	@ApiPropertyOptional({ enum: OrderStatus })
	@IsEnum(OrderStatus)
	status: OrderStatus;
}

export class UpdateSalesOrderTransportDto {
	@ApiPropertyOptional({ example: 'transport-type-uuid' })
	@IsUUID()
	transportTypeId: string;
}

export class ListSalesOrdersQueryDto {
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

	@ApiPropertyOptional({ example: '2026-06-01', description: 'Data inicial do período' })
	@IsOptional()
	@IsDateString()
	dateFrom?: string;

	@ApiPropertyOptional({ example: '2026-06-30', description: 'Data final do período' })
	@IsOptional()
	@IsDateString()
	dateTo?: string;

	@ApiPropertyOptional({ enum: ['createdAt', 'deliveryDate'], description: 'Campo de data para filtrar' })
	@IsOptional()
	@IsEnum(['createdAt', 'deliveryDate'])
	dateField?: 'createdAt' | 'deliveryDate';

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
