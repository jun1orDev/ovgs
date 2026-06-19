import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('audit-events')
export class AuditEventsController {
	constructor(private readonly auditService: AuditService) { }

	@Get()
	findAll(@Query('entityType') entityType?: string, @Query('entityId') entityId?: string) {
		return this.auditService.findAll(entityType, entityId);
	}
}
