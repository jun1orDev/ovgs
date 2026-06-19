import { Injectable } from '@nestjs/common';
import { AuditAction } from '../audit/enums/audit-action.enum';
import { AuditService } from '../audit/audit.service';
import { BusinessRuleException } from '../common/exceptions/business-rule.exception';
import { OrderStatus } from '../sales-orders/enums/order-status.enum';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { RescheduleSalesOrderDto, ScheduleSalesOrderDto } from './dto/scheduling.dto';
import { assertScheduleWindow } from './schedule-window';

@Injectable()
export class SchedulingService {
	constructor(
		private readonly salesOrdersService: SalesOrdersService,
		private readonly auditService: AuditService,
	) { }

	async schedule(orderId: string, dto: ScheduleSalesOrderDto) {
		const order = await this.salesOrdersService.findOne(orderId);

		if (![OrderStatus.PLANEJADA, OrderStatus.AGENDADA].includes(order.status as OrderStatus)) {
			throw new BusinessRuleException('Somente ordens planejadas ou agendadas podem ser agendadas');
		}

		assertScheduleWindow(dto.scheduleStart, dto.scheduleEnd);

		const updated = await this.salesOrdersService.updateSchedule(orderId, dto);

		await this.auditService.create({
			action: AuditAction.ORDER_SCHEDULE_CHANGED,
			entityType: 'SalesOrder',
			entityId: orderId,
			previousState: {
				deliveryDate: order.deliveryDate,
				scheduleStart: order.scheduleStart,
				scheduleEnd: order.scheduleEnd,
			},
			nextState: dto,
		});

		return updated;
	}

	async reschedule(orderId: string, dto: RescheduleSalesOrderDto) {
		const order = await this.salesOrdersService.findOne(orderId);

		if (![OrderStatus.AGENDADA, OrderStatus.EM_TRANSPORTE].includes(order.status as OrderStatus)) {
			throw new BusinessRuleException('Somente ordens agendadas ou em transporte podem ser reagendadas');
		}

		if (!order.deliveryDate || !order.scheduleStart || !order.scheduleEnd) {
			throw new BusinessRuleException('Ordem precisa estar agendada antes de ser reagendada');
		}

		const nextDto: ScheduleSalesOrderDto = {
			deliveryDate: dto.deliveryDate ?? order.deliveryDate.toISOString().slice(0, 10),
			scheduleStart: dto.scheduleStart ?? this.toTime(order.scheduleStart),
			scheduleEnd: dto.scheduleEnd ?? this.toTime(order.scheduleEnd),
		};

		assertScheduleWindow(nextDto.scheduleStart, nextDto.scheduleEnd);

		const updated = await this.salesOrdersService.updateSchedule(orderId, {
			deliveryDate: nextDto.deliveryDate,
			scheduleStart: nextDto.scheduleStart,
			scheduleEnd: nextDto.scheduleEnd,
		});

		await this.auditService.create({
			action: AuditAction.ORDER_SCHEDULE_CHANGED,
			entityType: 'SalesOrder',
			entityId: orderId,
			previousState: {
				deliveryDate: order.deliveryDate,
				scheduleStart: order.scheduleStart,
				scheduleEnd: order.scheduleEnd,
			},
			nextState: nextDto,
		});

		return updated;
	}

	private toTime(date: Date): string {
		return date.toISOString().slice(11, 16);
	}
}
