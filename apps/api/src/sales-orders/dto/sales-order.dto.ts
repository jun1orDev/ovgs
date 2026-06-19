import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsUUID, Max, Min, ValidateNested } from 'class-validator';
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

	@ApiPropertyOptional({ example: 12.5 })
	@IsOptional()
	@IsNumber()
	@Min(0)
	unitPrice?: number;
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
