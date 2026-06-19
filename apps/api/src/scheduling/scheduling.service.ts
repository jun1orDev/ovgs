import { Injectable } from '@nestjs/common';
import { AuditAction } from '../audit/enums/audit-action.enum';
import { AuditService } from '../audit/audit.service';
import { BusinessRuleException } from '../common/exceptions/business-rule.exception';
import { OrderStatus } from '../sales-orders/enums/order-status.enum';
import { SalesOrdersService } from '../sales-orders/sales-orders.service';
import { RescheduleSalesOrderDto, ScheduleSalesOrderDto } from './dto/scheduling.dto';

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

		this.assertScheduleWindow(dto.deliveryDate, dto.scheduleStart, dto.scheduleEnd);

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

		const nextDto: ScheduleSalesOrderDto = {
			deliveryDate: dto.deliveryDate ?? order.deliveryDate!.toISOString().slice(0, 10),
			scheduleStart: dto.scheduleStart ?? this.toTime(order.scheduleStart!),
			scheduleEnd: dto.scheduleEnd ?? this.toTime(order.scheduleEnd!),
		};

		this.assertScheduleWindow(nextDto.deliveryDate, nextDto.scheduleStart, nextDto.scheduleEnd);

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

	private assertScheduleWindow(deliveryDate: string, scheduleStart: string, scheduleEnd: string): void {
		const [startHour, startMinute] = scheduleStart.split(':').map(Number);
		const [endHour, endMinute] = scheduleEnd.split(':').map(Number);
		const start = startHour * 60 + startMinute;
		const end = endHour * 60 + endMinute;

		if (end <= start) {
			throw new BusinessRuleException('Janela de atendimento inválida: horário final deve ser posterior ao horário inicial');
		}

		if (start < 8 * 60 || end > 18 * 60) {
			throw new BusinessRuleException('Janela de atendimento deve estar entre 08:00 e 18:00');
		}
	}

	private toTime(date: Date): string {
		return date.toISOString().slice(11, 16);
	}
}
