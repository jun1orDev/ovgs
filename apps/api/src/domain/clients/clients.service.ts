import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
	constructor(private readonly prisma: PrismaService) { }

	async create(dto: CreateClientDto) {
		const { transportTypeIds, ...clientData } = dto;

		return this.prisma.client.create({
			data: {
				...clientData,
				authorizedTransport: transportTypeIds?.length
					? {
						create: transportTypeIds.map((transportTypeId) => ({ transportTypeId })),
					}
					: undefined,
			},
			include: {
				authorizedTransport: {
					include: {
						transportType: true,
					},
				},
			},
		});
	}

	async findAll(active?: boolean) {
		return this.prisma.client.findMany({
			where: active !== undefined ? { active } : undefined,
			include: {
				authorizedTransport: {
					include: {
						transportType: true,
					},
				},
			},
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: string) {
		return this.findOrThrow(id);
	}

	async update(id: string, dto: UpdateClientDto) {
		await this.findOrThrow(id);

		const { transportTypeIds, ...clientData } = dto;

		return this.prisma.client.update({
			where: { id },
			data: {
				...clientData,
				authorizedTransport: transportTypeIds
					? {
						deleteMany: {},
						create: transportTypeIds.map((transportTypeId) => ({ transportTypeId })),
					}
					: undefined,
			},
			include: {
				authorizedTransport: {
					include: {
						transportType: true,
					},
				},
			},
		});
	}

	async remove(id: string) {
		await this.findOrThrow(id);

		return this.prisma.client.delete({ where: { id } });
	}

	async isTransportTypeAuthorized(clientId: string, transportTypeId: string) {
		const exists = await this.prisma.clientTransportType.findUnique({
			where: {
				clientId_transportTypeId: {
					clientId,
					transportTypeId,
				},
			},
		});

		return Boolean(exists);
	}

	private async findOrThrow(id: string) {
		const client = await this.prisma.client.findUnique({
			where: { id },
			include: {
				authorizedTransport: {
					include: {
						transportType: true,
					},
				},
			},
		});

		if (!client) {
			throw new NotFoundException('Cliente não encontrado');
		}

		return client;
	}
}
