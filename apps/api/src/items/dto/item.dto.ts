import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateItemDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(50)
	sku: string;

	@IsNotEmpty()
	@IsString()
	@MaxLength(200)
	name: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@IsOptional()
	@IsBoolean()
	active?: boolean;
}

export class UpdateItemDto {
	@IsOptional()
	@IsString()
	@MaxLength(50)
	sku?: string;

	@IsOptional()
	@IsString()
	@MaxLength(200)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@IsOptional()
	@IsBoolean()
	active?: boolean;
}
