import { BadRequestException } from '@nestjs/common';

export class BusinessRuleException extends BadRequestException {
	constructor(message: string) {
		super({
			statusCode: 400,
			message,
			error: 'Regra de negócio',
		});
	}
}
