import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TransportTypesService } from './transport-types.service';
import { CreateTransportTypeDto, UpdateTransportTypeDto } from './dto/transport-type.dto';

@Controller('transport-types')
export class TransportTypesController {
	constructor(private readonly transportTypesService: TransportTypesService) { }

	@Post()
	create(@Body() dto: CreateTransportTypeDto) {
		return this.transportTypesService.create(dto);
	}

	@Get()
	findAll(@Query('active') active?: string) {
		return this.transportTypesService.findAll(active === 'false' ? false : active === 'true' ? true : undefined);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.transportTypesService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateTransportTypeDto) {
		return this.transportTypesService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.transportTypesService.remove(id);
	}
}
