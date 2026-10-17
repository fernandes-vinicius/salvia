export type Sex = "male" | "female";

export interface BodyProfile {
	sex: Sex;
	ageYears: number;
	weightKg: number;
	heightCm: number;
	activityFactor: number;
}
