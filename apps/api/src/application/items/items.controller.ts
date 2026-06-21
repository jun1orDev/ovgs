import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ItemsService } from '../../domain/items/items.service';
import { CreateItemDto, UpdateItemDto } from '../../domain/items/dto/item.dto';

@Controller('items')
export class ItemsController {
	constructor(private readonly itemsService: ItemsService) { }

	@Post()
	create(@Body() dto: CreateItemDto) {
		return this.itemsService.create(dto);
	}

	@Get()
	findAll(@Query('active') active?: string) {
		return this.itemsService.findAll(active === 'false' ? false : active === 'true' ? true : undefined);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.itemsService.findOne(id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
		return this.itemsService.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.itemsService.remove(id);
	}
}
