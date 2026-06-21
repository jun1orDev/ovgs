import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditAction } from './enums/audit-action.enum';

@Injectable()
export class AuditService {
	constructor(private readonly prisma: PrismaService) { }

	async create(params: {
		action: AuditAction;
		entityType: string;
		entityId: string;
		previousState?: unknown;
		nextState?: unknown;
		userId?: string;
	}) {
		const data: Prisma.AuditEventCreateInput = {
			action: params.action,
			entityType: params.entityType,
			entityId: params.entityId,
			userId: params.userId ?? undefined,
		};

		if (params.previousState !== undefined) {
			data.previousState = params.previousState as Prisma.InputJsonValue;
		}

		if (params.nextState !== undefined) {
			data.nextState = params.nextState as Prisma.InputJsonValue;
		}

		return this.prisma.auditEvent.create({ data });
	}

	async findAll(entityType?: string, entityId?: string) {
		return this.prisma.auditEvent.findMany({
			where: {
				entityType: entityType || undefined,
				entityId: entityId || undefined,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});
	}

	async findByEntity(entityType: string, entityId: string) {
		return this.findAll(entityType, entityId);
	}
}
