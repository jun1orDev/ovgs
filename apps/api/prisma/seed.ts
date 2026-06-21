import { PrismaClient } from '@prisma/client';
import { OrderStatus } from '../src/domain/sales-orders/enums/order-status.enum';

const prisma = new PrismaClient();

async function main() {
	const truck = await prisma.transportType.upsert({
		where: { name: 'Caminhão' },
		update: {},
		create: {
			name: 'Caminhão',
			description: 'Transporte rodoviário de carga em veículo caminhão.',
		},
	});

	const carreta = await prisma.transportType.upsert({
		where: { name: 'Carreta' },
		update: {},
		create: {
			name: 'Carreta',
			description: 'Transporte rodoviário de carga em veículo carreta.',
		},
	});

	const bitruck = await prisma.transportType.upsert({
		where: { name: 'Bi-truck' },
		update: {},
		create: {
			name: 'Bi-truck',
			description: 'Transporte rodoviário de carga em veículo bi-truck.',
		},
	});

	const client = await prisma.client.upsert({
		where: { document: '12345678000190' },
		update: {},
		create: {
			name: 'Cliente Exemplo Ltda',
			document: '12345678000190',
			email: 'cliente@example.com',
			phone: '(11) 99999-9999',
		},
	});

	for (const transportType of [truck, carreta, bitruck]) {
		await prisma.clientTransportType.upsert({
			where: {
				clientId_transportTypeId: {
					clientId: client.id,
					transportTypeId: transportType.id,
				},
			},
			update: {},
			create: {
				clientId: client.id,
				transportTypeId: transportType.id,
			},
		});
	}

	const items = [
		{ sku: 'SKU-001', name: 'Produto Exemplo 01', description: 'Item de demonstração', unitPrice: 125.5 },
		{ sku: 'SKU-002', name: 'Produto Exemplo 02', description: 'Item de demonstração', unitPrice: 89.9 },
		{ sku: 'SKU-003', name: 'Produto Exemplo 03', description: 'Item de demonstração', unitPrice: 210 },
	];

	for (const item of items) {
		await prisma.item.upsert({
			where: { sku: item.sku },
			update: { unitPrice: item.unitPrice },
			create: item,
		});
	}

	const firstItem = await prisma.item.findUnique({ where: { sku: 'SKU-001' } });

	if (firstItem) {
		const seededOrder = await prisma.salesOrder.upsert({
			where: { number: 'OV-000001' },
			update: {
				clientId: client.id,
				transportTypeId: truck.id,
				status: OrderStatus.CRIADA,
			},
			create: {
				number: 'OV-000001',
				clientId: client.id,
				transportTypeId: truck.id,
				status: OrderStatus.CRIADA,
			},
			select: { id: true },
		});

		await prisma.salesOrderItem.upsert({
			where: {
				salesOrderId_itemId: {
					salesOrderId: seededOrder.id,
					itemId: firstItem.id,
				},
			},
			update: {
				quantity: 2,
				unitPrice: firstItem.unitPrice,
			},
			create: {
				salesOrderId: seededOrder.id,
				itemId: firstItem.id,
				quantity: 2,
				unitPrice: firstItem.unitPrice,
			},
		});
	}
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
