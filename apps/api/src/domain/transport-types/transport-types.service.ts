import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

		const [salesOrdersCount, clientTransportCount] = await Promise.all([
			this.prisma.salesOrder.count({ where: { transportTypeId: id } }),
			this.prisma.clientTransportType.count({ where: { transportTypeId: id } }),
		]);

		if (salesOrdersCount > 0) {
			throw new BadRequestException(
				'Não é possível excluir o tipo de transporte pois existem ordens de venda associadas a ele.',
			);
		}

		if (clientTransportCount > 0) {
			throw new BadRequestException(
				'Não é possível excluir o tipo de transporte pois existem clientes autorizados a usá-lo.',
			);
		}

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
