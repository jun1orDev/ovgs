import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '../audit/enums/audit-action.enum';
import { AuditService } from '../audit/audit.service';
import { BusinessRuleException } from '../common/exceptions/business-rule.exception';
import { ClientsService } from '../clients/clients.service';
import { ItemsService } from '../items/items.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransportTypesService } from '../transport-types/transport-types.service';
import { OrderStatus } from './enums/order-status.enum';
import {
	CreateSalesOrderDto,
	ListSalesOrdersQueryDto,
	UpdateSalesOrderStatusDto,
	UpdateSalesOrderTransportDto,
} from './dto/sales-order.dto';
import { OrderStatusTransitionService } from './order-status-transition.service';

@Injectable()
export class SalesOrdersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly clientsService: ClientsService,
		private readonly transportTypesService: TransportTypesService,
		private readonly itemsService: ItemsService,
		private readonly auditService: AuditService,
		private readonly transitionService: OrderStatusTransitionService,
	) { }

	async create(dto: CreateSalesOrderDto) {
		if (!dto.items?.length) {
			throw new BusinessRuleException('A ordem de venda deve conter ao menos um item');
		}

		await this.clientsService.findOne(dto.clientId);
		await this.transportTypesService.existsOrThrow(dto.transportTypeId);

		const isAuthorized = await this.clientsService.isTransportTypeAuthorized(dto.clientId, dto.transportTypeId);
		if (!isAuthorized) {
			throw new BusinessRuleException('Tipo de transporte não autorizado para o cliente selecionado');
		}

		await this.itemsService.findExistingItems(dto.items.map((item) => item.itemId));
		const number = await this.generateOrderNumber();

		const order = await this.prisma.salesOrder.create({
			data: {
				number,
				clientId: dto.clientId,
				transportTypeId: dto.transportTypeId,
				status: OrderStatus.CRIADA,
				items: {
					create: dto.items.map((item) => ({
						itemId: item.itemId,
						quantity: item.quantity ?? 1,
						unitPrice: item.unitPrice,
					})),
				},
			},
			include: this.orderInclude(),
		});

		await this.auditService.create({
			action: AuditAction.ORDER_CREATED,
			entityType: 'SalesOrder',
			entityId: order.id,
			nextState: this.toSnapshot(order),
		});

		return order;
	}

	async findAll(query: ListSalesOrdersQueryDto) {
		const page = query.page ?? 1;
		const pageSize = query.pageSize ?? 10;
		const skip = (page - 1) * pageSize;
		const where = this.buildWhere(query);

		const [data, total] = await this.prisma.$transaction([
			this.prisma.salesOrder.findMany({
				where,
				include: this.orderInclude(),
				skip,
				take: pageSize,
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.salesOrder.count({ where }),
		]);

		return {
			data,
			meta: {
				page,
				pageSize,
				total,
			},
		};
	}

	async findMonitoringSummary(query: ListSalesOrdersQueryDto) {
		const where = this.buildWhere(query);
		const [totalOrders, groups] = await Promise.all([
			this.prisma.salesOrder.count({ where }),
			this.prisma.salesOrder.groupBy({
				by: ['status'],
				where,
				_count: { id: true },
			}),
		]);

		const byStatus = groups.reduce<Partial<Record<OrderStatus, number>>>((summary, group) => {
			summary[group.status as OrderStatus] = group._count.id;
			return summary;
		}, {});

		return {
			totalOrders,
			byStatus,
		};
	}

	async findOne(id: string) {
		return this.findOrThrow(id);
	}

	async changeStatus(id: string, dto: UpdateSalesOrderStatusDto) {
		const order = await this.findOrThrow(id);

		this.transitionService.assertCanTransition(order.status as OrderStatus, dto.status);

		const updated = await this.prisma.salesOrder.update({
			where: { id },
			data: { status: dto.status },
			include: this.orderInclude(),
		});

		await this.auditService.create({
			action: AuditAction.ORDER_STATUS_CHANGED,
			entityType: 'SalesOrder',
			entityId: id,
			previousState: { status: order.status },
			nextState: { status: dto.status },
		});

		return updated;
	}

	async changeTransport(id: string, dto: UpdateSalesOrderTransportDto) {
		const order = await this.findOrThrow(id);

		if (![OrderStatus.CRIADA, OrderStatus.PLANEJADA].includes(order.status as OrderStatus)) {
			throw new BusinessRuleException('Alteração de transporte só é permitida enquanto a ordem estiver criada ou planejada');
		}

		await this.transportTypesService.existsOrThrow(dto.transportTypeId);

		const isAuthorized = await this.clientsService.isTransportTypeAuthorized(order.clientId, dto.transportTypeId);
		if (!isAuthorized) {
			throw new BusinessRuleException('Tipo de transporte não autorizado para o cliente selecionado');
		}

		const updated = await this.prisma.salesOrder.update({
			where: { id },
			data: { transportTypeId: dto.transportTypeId },
			include: this.orderInclude(),
		});

		await this.auditService.create({
			action: AuditAction.ORDER_TRANSPORT_CHANGED,
			entityType: 'SalesOrder',
			entityId: id,
			previousState: { transportTypeId: order.transportTypeId },
			nextState: { transportTypeId: dto.transportTypeId },
		});

		return updated;
	}

	async updateSchedule(id: string, dto: { deliveryDate: string; scheduleStart: string; scheduleEnd: string }) {
		const order = await this.findOrThrow(id);

		if (![OrderStatus.PLANEJADA, OrderStatus.AGENDADA, OrderStatus.EM_TRANSPORTE].includes(order.status as OrderStatus)) {
			throw new BusinessRuleException('Somente ordens planejadas, agendadas ou em transporte podem ter agendamento atualizado');
		}

		const deliveryDate = new Date(`${dto.deliveryDate}T12:00:00`);
		const updated = await this.prisma.salesOrder.update({
			where: { id },
			data: {
				deliveryDate,
				scheduleStart: this.combineDateTime(deliveryDate, dto.scheduleStart),
				scheduleEnd: this.combineDateTime(deliveryDate, dto.scheduleEnd),
				status: order.status === OrderStatus.PLANEJADA ? OrderStatus.AGENDADA : order.status,
			},
			include: this.orderInclude(),
		});

		return updated;
	}

	private buildWhere(query: ListSalesOrdersQueryDto): Record<string, unknown> {
		const where: Record<string, unknown> = {};

		if (query.status) {
			where.status = query.status;
		}

		if (query.clientId) {
			where.clientId = query.clientId;
		}

		if (query.transportTypeId) {
			where.transportTypeId = query.transportTypeId;
		}

		if (query.date) {
			const start = new Date(query.date);
			const end = new Date(start);
			end.setDate(end.getDate() + 1);

			where.OR = [
				{ deliveryDate: { gte: start, lt: end } },
				{ createdAt: { gte: start, lt: end } },
			];
		}

		return where;
	}

	private orderInclude() {
		return {
			client: true,
			transportType: true,
			items: {
				include: {
					item: true,
				},
			},
		};
	}

	private async findOrThrow(id: string) {
		const order = await this.prisma.salesOrder.findUnique({
			where: { id },
			include: this.orderInclude(),
		});

		if (!order) {
			throw new NotFoundException('Ordem de venda não encontrada');
		}

		return order;
	}

	private async generateOrderNumber(): Promise<string> {
		const latest = await this.prisma.salesOrder.findFirst({
			orderBy: { number: 'desc' },
			select: { number: true },
		});

		const match = latest?.number.match(/(\d+)$/);
		const next = match ? Number(match[1]) + 1 : 1;

		return `OV-${String(next).padStart(6, '0')}`;
	}

	private toSnapshot(order: Awaited<ReturnType<typeof this.findOrThrow>>) {
		return {
			id: order.id,
			number: order.number,
			status: order.status,
			clientId: order.clientId,
			transportTypeId: order.transportTypeId,
			deliveryDate: order.deliveryDate?.toISOString() ?? null,
			scheduleStart: order.scheduleStart?.toISOString() ?? null,
			scheduleEnd: order.scheduleEnd?.toISOString() ?? null,
		};
	}

	private combineDateTime(date: Date, time: string): Date {
		const [hour, minute] = time.split(':').map(Number);
		const combined = new Date(date);
		combined.setHours(hour, minute, 0, 0);
		return combined;
	}
}
