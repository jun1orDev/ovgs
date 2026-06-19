import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RescheduleSalesOrderDto, ScheduleSalesOrderDto } from './dto/scheduling.dto';
import { SchedulingService } from './scheduling.service';

@ApiTags('scheduling')
@Controller('sales-orders/:id/scheduling')
export class SchedulingController {
	constructor(private readonly schedulingService: SchedulingService) { }

	@Post()
	schedule(@Param('id') id: string, @Body() dto: ScheduleSalesOrderDto) {
		return this.schedulingService.schedule(id, dto);
	}

	@Patch()
	reschedule(@Param('id') id: string, @Body() dto: RescheduleSalesOrderDto) {
		return this.schedulingService.reschedule(id, dto);
	}
}
