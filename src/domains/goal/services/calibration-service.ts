import "server-only";

import {
	findGoalByUserId,
	findGoalCalibration,
} from "~/domains/goal/services/goal-service";
import {
	analyzeCalibration,
	toWeighIns,
} from "~/domains/goal/utils/calibration";
import { listMeasurements } from "~/domains/measurements/services/measurement-service";
import { localDateString } from "~/shared/lib/dates";

/** Estado atual do ajuste pelo peso, lido do banco (fonte da verdade das ações). */
export async function getCalibrationState(userId: string) {
	const [goal, calibration, measurements] = await Promise.all([
		findGoalByUserId(userId),
		findGoalCalibration(userId),
		listMeasurements(userId),
	]);
	if (!goal) return null;

	const analysis = analyzeCalibration({
		weighIns: toWeighIns(measurements),
		today: localDateString(),
		since: calibration.since,
		calorieAdjustment: goal.calorieAdjustment,
	});
	return { goal, calibration, analysis };
}
