import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class ScheduleSalesOrderDto {
	@ApiPropertyOptional({ example: '2026-06-20' })
	@IsDateString()
	deliveryDate: string;

	@ApiPropertyOptional({ example: '09:00' })
	@IsString()
	@MinLength(5)
	@MaxLength(5)
	scheduleStart: string;

	@ApiPropertyOptional({ example: '12:00' })
	@IsString()
	@MinLength(5)
	@MaxLength(5)
	scheduleEnd: string;
}

export class RescheduleSalesOrderDto {
	@ApiPropertyOptional({ example: '2026-06-21' })
	@IsOptional()
	@IsDateString()
	deliveryDate?: string;

	@ApiPropertyOptional({ example: '10:00' })
	@IsOptional()
	@IsString()
	@MinLength(5)
	@MaxLength(5)
	scheduleStart?: string;

	@ApiPropertyOptional({ example: '14:00' })
	@IsOptional()
	@IsString()
	@MinLength(5)
	@MaxLength(5)
	scheduleEnd?: string;
}

export class ListMonitoringQueryDto {
	@ApiPropertyOptional({ example: 'CRIADA' })
	@IsOptional()
	@IsString()
	status?: string;

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
	page?: number;

	@ApiPropertyOptional({ example: 10, default: 10 })
	@IsOptional()
	@Type(() => Number)
	pageSize?: number;
}
