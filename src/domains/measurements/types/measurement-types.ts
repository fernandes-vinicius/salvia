export type MeasurementKey =
	| "weightKg"
	| "waistCm"
	| "neckCm"
	| "shoulderCm"
	| "chestCm"
	| "bicepsLeftCm"
	| "bicepsRightCm"
	| "forearmLeftCm"
	| "forearmRightCm"
	| "abdomenCm"
	| "hipsCm"
	| "thighLeftCm"
	| "thighRightCm"
	| "calfLeftCm"
	| "calfRightCm";

export type MeasurementValues = Record<MeasurementKey, number | null>;

export interface Measurement extends MeasurementValues {
	id: string;
	/** "YYYY-MM-DD" (data local, sem fuso). */
	measuredOn: string;
}
