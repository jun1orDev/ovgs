/// <reference types="jest" />

declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

import { OrderStatus } from './enums/order-status.enum';
import { OrderStatusTransitionService } from './order-status-transition.service';

describe('OrderStatusTransitionService', () => {
	let service: OrderStatusTransitionService;

	beforeEach(() => {
		service = new OrderStatusTransitionService();
	});

	it('should allow the transition from CRIADA to PLANEJADA', () => {
		expect(service.canTransition(OrderStatus.CRIADA, OrderStatus.PLANEJADA)).toBe(true);
	});

	it('should reject the transition from CRIADA to AGENDADA', () => {
		expect(service.canTransition(OrderStatus.CRIADA, OrderStatus.AGENDADA)).toBe(false);
	});
});
