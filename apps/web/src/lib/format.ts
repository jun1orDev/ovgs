import type { Client, Item, OrderStatus, TransportType } from '../types/ovgs';

export function formatCurrency(value: number | string | null | undefined): string {
	if (value === null || value === undefined || value === '') return '—';

	const numericValue = typeof value === 'number' ? value : Number(value);
	if (Number.isNaN(numericValue)) return '—';

	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(numericValue);
}

export function formatDateTime(value: string | null | undefined): string {
	if (!value) return '—';

	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short',
	}).format(new Date(value));
}

export function formatDate(value: string | null | undefined): string {
	if (!value) return '—';

	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
	}).format(new Date(value));
}

export function statusClass(status: OrderStatus): string {
	const map: Record<OrderStatus, string> = {
		CRIADA: 'status-created',
		PLANEJADA: 'status-planned',
		AGENDADA: 'status-scheduled',
		EM_TRANSPORTE: 'status-in-transit',
		ENTREGUE: 'status-delivered',
	};

	return map[status] ?? 'status-default';
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return 'Ocorreu um erro inesperado.';
}

export function canTransition(status: OrderStatus, nextStatus: OrderStatus): boolean {
	const transitions: Record<OrderStatus, OrderStatus[]> = {
		CRIADA: ['PLANEJADA'],
		PLANEJADA: ['AGENDADA'],
		AGENDADA: ['EM_TRANSPORTE'],
		EM_TRANSPORTE: ['ENTREGUE'],
		ENTREGUE: [],
	};

	return transitions[status].includes(nextStatus);
}

export function nextTransitions(status: OrderStatus): OrderStatus[] {
	const transitions: Record<OrderStatus, OrderStatus[]> = {
		CRIADA: ['PLANEJADA'],
		PLANEJADA: ['AGENDADA'],
		AGENDADA: ['EM_TRANSPORTE'],
		EM_TRANSPORTE: ['ENTREGUE'],
		ENTREGUE: [],
	};

	return transitions[status];
}

export function statusLabel(status: OrderStatus): string {
	const labels: Record<OrderStatus, string> = {
		CRIADA: 'Criada',
		PLANEJADA: 'Planejada',
		AGENDADA: 'Agendada',
		EM_TRANSPORTE: 'Em transporte',
		ENTREGUE: 'Entregue',
	};

	return labels[status] ?? status;
}

export function optionLabel(entity: Client | TransportType | Item): string {
	if ('sku' in entity) return `${entity.sku} - ${entity.name} (${formatCurrency(entity.unitPrice)})`;
	if ('name' in entity && 'document' in entity) return entity.document ? `${entity.name} (${entity.document})` : entity.name;
	return entity.name;
}
