/**
 * Máscaras para formatação de inputs
 */

export function formatCpfCnpj(value: string): string {
	const onlyDigits = value.replace(/\D/g, '');

	if (onlyDigits.length <= 11) {
		// CPF: 000.000.000-00
		return onlyDigits
			.replace(/(\d{3})(\d)/, '$1.$2')
			.replace(/(\d{3})(\d)/, '$1.$2')
			.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
	}

	// CNPJ: 00.000.000/0000-00
	return onlyDigits
		.replace(/(\d{2})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1/$2')
		.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(value: string): string {
	const onlyDigits = value.replace(/\D/g, '');

	if (onlyDigits.length <= 10) {
		// Fixo: (00) 0000-0000
		return onlyDigits
			.replace(/(\d{2})(\d)/, '($1) $2')
			.replace(/(\d{4})(\d)/, '$1-$2')
			.replace(/(\d{4})(\d)/, '$1$2');
	}

	// Celular: (00) 00000-0000
	return onlyDigits
		.replace(/(\d{2})(\d)/, '($1) $2')
		.replace(/(\d{5})(\d)/, '$1-$2')
		.replace(/(\d{4})(\d)/, '$1$2');
}

export function parseCpfCnpj(value: string): string {
	return value.replace(/\D/g, '');
}

export function parsePhone(value: string): string {
	return value.replace(/\D/g, '');
}

export function isValidCpf(cpf: string): boolean {
	const digits = cpf.replace(/\D/g, '');
	if (digits.length !== 11) return false;
	if (/^(\d)\1+$/.test(digits)) return false;

	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += Number(digits[i]) * (10 - i);
	}
	let remainder = (sum * 10) % 11;
	if (remainder === 10) remainder = 0;
	if (remainder !== Number(digits[9])) return false;

	sum = 0;
	for (let i = 0; i < 10; i++) {
		sum += Number(digits[i]) * (11 - i);
	}
	remainder = (sum * 10) % 11;
	if (remainder === 10) remainder = 0;
	if (remainder !== Number(digits[10])) return false;

	return true;
}

export function isValidCnpj(cnpj: string): boolean {
	const digits = cnpj.replace(/\D/g, '');
	if (digits.length !== 14) return false;
	if (/^(\d)\1+$/.test(digits)) return false;

	const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
	const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

	let sum = 0;
	for (let i = 0; i < 12; i++) {
		sum += Number(digits[i]) * weights1[i];
	}
	let remainder = sum % 11;
	const digit1 = remainder < 2 ? 0 : 11 - remainder;
	if (digit1 !== Number(digits[12])) return false;

	sum = 0;
	for (let i = 0; i < 13; i++) {
		sum += Number(digits[i]) * weights2[i];
	}
	remainder = sum % 11;
	const digit2 = remainder < 2 ? 0 : 11 - remainder;
	if (digit2 !== Number(digits[13])) return false;

	return true;
}

export function isValidCpfCnpj(value: string): boolean {
	const digits = value.replace(/\D/g, '');
	if (digits.length === 11) return isValidCpf(digits);
	if (digits.length === 14) return isValidCnpj(digits);
	return false;
}
