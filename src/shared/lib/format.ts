export function formatNumber(
	value: number,
	maximumFractionDigits = 0,
	minimumFractionDigits = 0,
) {
	return value.toLocaleString("pt-BR", {
		maximumFractionDigits,
		minimumFractionDigits,
	});
}

/** Sempre com `digits` casas: 1 → "1,0" (ex.: g/kg). */
export function formatFixed(value: number, digits = 1) {
	return formatNumber(value, digits, digits);
}

/** Como `formatNumber`, mas vazio quando arredonda pra zero (células de tabela). */
export function formatNonZero(value: number, maximumFractionDigits = 0) {
	const text = formatNumber(value, maximumFractionDigits);
	return /^-?0$/.test(text) ? "" : text;
}
