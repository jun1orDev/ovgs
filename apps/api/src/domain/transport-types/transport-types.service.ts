import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateTransportTypeDto, UpdateTransportTypeDto } from './dto/transport-type.dto';

@Injectable()
export class TransportTypesService {
	constructor(private readonly prisma: PrismaService) { }

	async create(dto: CreateTransportTypeDto) {
		return this.prisma.transportType.create({ data: dto });
	}

	async findAll(active?: boolean) {
		return this.prisma.transportType.findMany({
			where: active !== undefined ? { active } : undefined,
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		return this.findOrThrow(id);
	}

	async update(id: string, dto: UpdateTransportTypeDto) {
		await this.findOrThrow(id);
		return this.prisma.transportType.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOrThrow(id);
		return this.prisma.transportType.delete({ where: { id } });
	}

	async exists(id: string) {
		const transportType = await this.prisma.transportType.findUnique({ where: { id } });
		return Boolean(transportType);
	}

	async existsOrThrow(id: string) {
		return this.findOrThrow(id);
	}

	private async findOrThrow(id: string) {
		const transportType = await this.prisma.transportType.findUnique({ where: { id } });

		if (!transportType) {
			throw new NotFoundException('Tipo de transporte não encontrado');
		}

		return transportType;
	}
}
