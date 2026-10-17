// Só exports seguros pro client. Server-only (measurement-service) é
// importado pelo caminho direto.
export { MeasurementsView } from "~/domains/measurements/components/measurements-view";
export type {
	Measurement,
	MeasurementKey,
} from "~/domains/measurements/types/measurement-types";
