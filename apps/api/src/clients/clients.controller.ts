import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Controller('clients')
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) { }

	@Post()
	create(@Body() dto: CreateClientDto) {
		return this.clientsService.create(dto);
	}

	@Get()
	findAll(@Query('active') active?: string) {
		return this.clientsService.findAll(active === 'false' ? false : active === 'true' ? true : undefined);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.clientsService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
		return this.clientsService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.clientsService.remove(id);
	}
}
