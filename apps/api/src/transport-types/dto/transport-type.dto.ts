import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTransportTypeDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(100)
	name: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@IsOptional()
	@IsBoolean()
	active?: boolean;
}

export class UpdateTransportTypeDto {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@IsOptional()
	@IsBoolean()
	active?: boolean;
}
