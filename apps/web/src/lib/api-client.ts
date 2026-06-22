import type {
	ApiErrorBody,
	AuditEvent,
	Client,
	CreateClientDto,
	CreateItemDto,
	CreateSalesOrderDto,
	CreateTransportTypeDto,
	Item,
	MonitoringSummary,
	PaginatedResponse,
	RescheduleSalesOrderDto,
	SalesOrder,
	ScheduleSalesOrderDto,
	TransportType,
	UpdateSalesOrderStatusDto,
	UpdateSalesOrderTransportDto,
} from '../types/ovgs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3101/api';

type RequestOptions = RequestInit & {
	errorMessage?: string;
};

class ApiClientError extends Error {
	status: number;
	body: ApiErrorBody;

	constructor(status: number, body: ApiErrorBody) {
		super(Array.isArray(body.message) ? body.message.join('; ') : body.message);
		this.status = status;
		this.body = body;
	}
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const { errorMessage, headers, ...init } = options;
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
	});

	const data = (await response.json().catch(() => null)) as ApiErrorBody | T | null;

	if (!response.ok) {
		const message = data && typeof data === 'object' && 'message' in data
			? (data as ApiErrorBody).message
			: errorMessage ?? 'Erro ao comunicar com a API';

		throw new ApiClientError(response.status, {
			statusCode: response.status,
			message,
			error: data && typeof data === 'object' && 'error' in data
				? (data as ApiErrorBody).error
				: 'Erro na API',
		});
	}

	return data as T;
}

export const apiClient = {
	clients: {
		list: () => request<Client[]>('/clients'),
		create: (dto: CreateClientDto) => request<Client>('/clients', { method: 'POST', body: JSON.stringify(dto) }),
		update: (id: string, dto: Partial<CreateClientDto>) => request<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
		remove: (id: string) => request<Client>(`/clients/${id}`, { method: 'DELETE' }),
	},

	transportTypes: {
		list: () => request<TransportType[]>('/transport-types'),
		create: (dto: CreateTransportTypeDto) => request<TransportType>('/transport-types', { method: 'POST', body: JSON.stringify(dto) }),
		update: (id: string, dto: Partial<CreateTransportTypeDto>) => request<TransportType>(`/transport-types/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
		remove: (id: string) => request<TransportType>(`/transport-types/${id}`, { method: 'DELETE' }),
	},

	items: {
		list: () => request<Item[]>('/items'),
		create: (dto: CreateItemDto) => request<Item>('/items', { method: 'POST', body: JSON.stringify(dto) }),
		update: (id: string, dto: Partial<CreateItemDto>) => request<Item>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),
		remove: (id: string) => request<Item>(`/items/${id}`, { method: 'DELETE' }),
	},

	salesOrders: {
		list: (query?: Record<string, string | number | undefined>) => request<PaginatedResponse<SalesOrder>>(
			`/sales-orders${toQueryString(query)}`,
		),
		get: (id: string) => request<SalesOrder>(`/sales-orders/${id}`),
		create: (dto: CreateSalesOrderDto) => request<SalesOrder>('/sales-orders', { method: 'POST', body: JSON.stringify(dto) }),
		updateStatus: (id: string, dto: UpdateSalesOrderStatusDto) => request<SalesOrder>(`/sales-orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(dto) }),
		updateTransport: (id: string, dto: UpdateSalesOrderTransportDto) => request<SalesOrder>(`/sales-orders/${id}/transport`, { method: 'PATCH', body: JSON.stringify(dto) }),
	},

	scheduling: {
		schedule: (orderId: string, dto: ScheduleSalesOrderDto) => request<SalesOrder>(`/sales-orders/${orderId}/scheduling`, { method: 'POST', body: JSON.stringify(dto) }),
		reschedule: (orderId: string, dto: RescheduleSalesOrderDto) => request<SalesOrder>(`/sales-orders/${orderId}/scheduling`, { method: 'PATCH', body: JSON.stringify(dto) }),
	},

	monitoring: {
		summary: (query?: Record<string, string | number | undefined>) => request<MonitoringSummary>(`/monitoring/sales-orders/summary${toQueryString(query)}`),
		list: (query?: Record<string, string | number | undefined>) => request<PaginatedResponse<SalesOrder>>(`/monitoring/sales-orders${toQueryString(query)}`),
	},

	audit: {
		list: (entityType?: string, entityId?: string) => request<AuditEvent[]>(
			`/audit-events${toQueryString({ entityType, entityId })}`,
		),
	},
};

function toQueryString(query?: Record<string, string | number | undefined | null>) {
	if (!query) return '';

	const params = new URLSearchParams();
	Object.entries(query).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			params.set(key, String(value));
		}
	});

	const queryString = params.toString();
	return queryString ? `?${queryString}` : '';
}

export type { ApiClientError };
