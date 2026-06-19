import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClientDto {
	@IsNotEmpty()
	@IsString()
	@MaxLength(200)
	name: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	document?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	phone?: string;

	@IsOptional()
	@IsBoolean()
	active?: boolean;

	@IsOptional()
	transportTypeIds?: string[];
}

export class UpdateClientDto {
	@IsOptional()
	@IsString()
	@MaxLength(200)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	document?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	@MaxLength(30)
	phone?: string;

	@IsOptional()
	@IsBoolean()
	active?: boolean;

	@IsOptional()
	transportTypeIds?: string[];
}
