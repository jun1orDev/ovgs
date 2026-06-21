export type OrderStatus = 'CRIADA' | 'PLANEJADA' | 'AGENDADA' | 'EM_TRANSPORTE' | 'ENTREGUE';

export interface Client {
	id: string;
	name: string;
	document?: string | null;
	email?: string | null;
	phone?: string | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;
	authorizedTransport: Array<{
		id: string;
		transportTypeId: string;
		transportType: TransportType;
	}>;
}

export interface TransportType {
	id: string;
	name: string;
	description?: string | null;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Item {
	id: string;
	sku: string;
	name: string;
	description?: string | null;
	unitPrice: number | string;
	active: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface SalesOrderItem {
	id: string;
	salesOrderId: string;
	itemId: string;
	quantity: number;
	unitPrice: number | string | null;
	item: Item;
}

export interface SalesOrder {
	id: string;
	number: string;
	clientId: string;
	transportTypeId: string;
	status: OrderStatus;
	deliveryDate: string | null;
	scheduleStart: string | null;
	scheduleEnd: string | null;
	createdAt: string;
	updatedAt: string;
	client: Client;
	transportType: TransportType;
	items: SalesOrderItem[];
}

export interface CreateClientDto {
	name: string;
	document?: string;
	email?: string;
	phone?: string;
	active?: boolean;
	transportTypeIds?: string[];
}

export interface CreateTransportTypeDto {
	name: string;
	description?: string;
	active?: boolean;
}

export interface CreateItemDto {
	sku: string;
	name: string;
	description?: string;
	unitPrice?: number | string;
	active?: boolean;
}

export interface CreateSalesOrderDto {
	clientId: string;
	transportTypeId: string;
	items: Array<{
		itemId: string;
		quantity?: number;
	}>;
}

export interface UpdateSalesOrderStatusDto {
	status: OrderStatus;
}

export interface UpdateSalesOrderTransportDto {
	transportTypeId: string;
}

export interface ScheduleSalesOrderDto {
	deliveryDate: string;
	scheduleStart: string;
	scheduleEnd: string;
}

export interface RescheduleSalesOrderDto {
	deliveryDate?: string;
	scheduleStart?: string;
	scheduleEnd?: string;
}

export interface AuditEvent {
	id: string;
	action: string;
	entityType: string;
	entityId: string;
	previousState?: unknown;
	nextState?: unknown;
	userId?: string | null;
	createdAt: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		page: number;
		pageSize: number;
		total: number;
	};
}

export interface MonitoringSummary {
	totalOrders: number;
	byStatus: Partial<Record<OrderStatus, number>>;
}

export interface ApiErrorBody {
	statusCode: number;
	message: string | string[];
	error?: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	CRIADA: 'Criada',
	PLANEJADA: 'Planejada',
	AGENDADA: 'Agendada',
	EM_TRANSPORTE: 'Em transporte',
	ENTREGUE: 'Entregue',
};

export const ORDER_STATUS_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
	CRIADA: ['PLANEJADA'],
	PLANEJADA: ['AGENDADA'],
	AGENDADA: ['EM_TRANSPORTE'],
	EM_TRANSPORTE: ['ENTREGUE'],
	ENTREGUE: [],
};
