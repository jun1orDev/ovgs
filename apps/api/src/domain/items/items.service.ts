import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';

function normalizeSku(sku: string): string {
	const trimmed = sku.trim().toUpperCase();
	return trimmed.startsWith('SKU-') ? trimmed : `SKU-${trimmed}`;
}

@Injectable()
export class ItemsService {
	constructor(private readonly prisma: PrismaService) { }

	async create(dto: CreateItemDto) {
		const normalizedDto = {
			...dto,
			sku: normalizeSku(dto.sku),
		};
		return this.prisma.item.create({ data: normalizedDto });
	}

	async findAll(active?: boolean) {
		return this.prisma.item.findMany({
			where: active !== undefined ? { active } : undefined,
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		return this.findOrThrow(id);
	}

	async update(id: string, dto: UpdateItemDto) {
		await this.findOrThrow(id);

		const normalizedDto = dto.sku
			? { ...dto, sku: normalizeSku(dto.sku) }
			: dto;

		return this.prisma.item.update({ where: { id }, data: normalizedDto });
	}

	async remove(id: string) {
		await this.findOrThrow(id);
		return this.prisma.item.delete({ where: { id } });
	}

	async findExistingItems(itemIds: string[]) {
		const items = await this.prisma.item.findMany({
			where: {
				id: { in: itemIds },
				active: true,
			},
			select: {
				id: true,
				sku: true,
				name: true,
				unitPrice: true,
			},
		});

		const foundIds = new Set(
			items.map((item: { id: string }) => item.id),
		);
		const missingIds = itemIds.filter((itemId) => !foundIds.has(itemId));

		if (missingIds.length > 0) {
			throw new NotFoundException(`Itens não encontrados: ${missingIds.join(', ')}`);
		}

		return items;
	}

	private async findOrThrow(id: string) {
		const item = await this.prisma.item.findUnique({ where: { id } });

		if (!item) {
			throw new NotFoundException('Item não encontrado');
		}

		return item;
	}
}
