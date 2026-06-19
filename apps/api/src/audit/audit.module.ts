import { Module } from '@nestjs/common';
import { AuditEventsController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
	controllers: [AuditEventsController],
	providers: [AuditService],
	exports: [AuditService],
})
export class AuditModule { }
