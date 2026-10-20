import "server-only";

import { listCheckins } from "~/domains/checkin/services/checkin-service";
import { periodAdherence } from "~/domains/checkin/utils/checkin";
import { getDiet } from "~/domains/diet/services/diet-service";
import {
	findGoalByUserId,
	findGoalCalibration,
} from "~/domains/goal/services/goal-service";
import {
	analyzeCalibration,
	calibrationWindowStart,
	toWeighIns,
} from "~/domains/goal/utils/calibration";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import { localDateString } from "~/shared/lib/dates";

/** Estado atual do ajuste pelo peso, lido do banco (fonte da verdade das ações). */
export async function getCalibrationState(userId: string) {
	const today = localDateString();
	const [goal, calibration, measurements, meals] = await Promise.all([
		findGoalByUserId(userId),
		findGoalCalibration(userId),
		listMeasurements(userId),
		getDiet(userId, { createIfEmpty: false }),
	]);
	if (!goal) return null;

	const from = calibrationWindowStart(today, calibration.since);
	const checkins = await listCheckins(userId, from);
	const mealCount = meals.filter((meal) => meal.items.length > 0).length;

	const analysis = analyzeCalibration({
		weighIns: toWeighIns(measurements),
		today,
		since: calibration.since,
		calorieAdjustment: goal.calorieAdjustment,
		adherence: periodAdherence(checkins, mealCount, from, today),
	});
	return { goal, calibration, analysis };
}
