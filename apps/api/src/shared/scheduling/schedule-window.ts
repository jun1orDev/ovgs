import { BusinessRuleException } from '../exceptions/business-rule.exception';

const BUSINESS_START_MINUTES = 8 * 60;
const BUSINESS_END_MINUTES = 18 * 60;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function assertScheduleWindow(scheduleStart: string, scheduleEnd: string): void {
	if (!TIME_PATTERN.test(scheduleStart) || !TIME_PATTERN.test(scheduleEnd)) {
		throw new BusinessRuleException('Janela de atendimento inválida: informe horários no formato HH:mm');
	}

	const [startHour, startMinute] = scheduleStart.split(':').map(Number);
	const [endHour, endMinute] = scheduleEnd.split(':').map(Number);
	const start = startHour * 60 + startMinute;
	const end = endHour * 60 + endMinute;

	if (end <= start) {
		throw new BusinessRuleException('Janela de atendimento inválida: horário final deve ser posterior ao horário inicial');
	}

	if (start < BUSINESS_START_MINUTES || end > BUSINESS_END_MINUTES) {
		throw new BusinessRuleException('Janela de atendimento deve estar entre 08:00 e 18:00');
	}
}
