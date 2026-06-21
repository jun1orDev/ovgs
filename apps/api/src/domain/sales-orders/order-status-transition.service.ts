import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '../../shared/exceptions/business-rule.exception';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderStatusTransitionService {
	private readonly allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
		[OrderStatus.CRIADA]: [OrderStatus.PLANEJADA],
		[OrderStatus.PLANEJADA]: [OrderStatus.AGENDADA],
		[OrderStatus.AGENDADA]: [OrderStatus.EM_TRANSPORTE],
		[OrderStatus.EM_TRANSPORTE]: [OrderStatus.ENTREGUE],
		[OrderStatus.ENTREGUE]: [],
	};

	canTransition(from: OrderStatus, to: OrderStatus): boolean {
		return this.allowedTransitions[from]?.includes(to) ?? false;
	}

	assertCanTransition(from: OrderStatus, to: OrderStatus): void {
		if (!this.canTransition(from, to)) {
			throw new BusinessRuleException(`Transição de status inválida: ${from} → ${to}`);
		}
	}

	getNextStatus(from: OrderStatus): OrderStatus | null {
		return this.allowedTransitions[from]?.[0] ?? null;
	}
}
