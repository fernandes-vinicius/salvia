import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { resetMeasurementsAction } from "~/domains/measurements/actions/measurement-actions";
import { MeasurementsView } from "~/domains/measurements/components/measurements-view";
import type { Measurement } from "~/domains/measurements/types/measurement-types";

vi.mock("~/domains/measurements/actions/measurement-actions", () => ({
	deleteMeasurementAction: vi.fn(),
	saveMeasurementAction: vi.fn(),
	resetMeasurementsAction: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
// Gráfico (Recharts) não interessa aqui e não roda bem no jsdom.
vi.mock("~/domains/measurements/components/evolution-chart", () => ({
	EvolutionChart: () => null,
}));

const reset = vi.mocked(resetMeasurementsAction);

function measurement(measuredOn: string, weightKg: number): Measurement {
	return {
		id: measuredOn,
		measuredOn,
		weightKg,
		waistCm: null,
		neckCm: null,
		shoulderCm: null,
		chestCm: null,
		bicepsLeftCm: null,
		bicepsRightCm: null,
		forearmLeftCm: null,
		forearmRightCm: null,
		abdomenCm: null,
		hipsCm: null,
		thighLeftCm: null,
		thighRightCm: null,
		calfLeftCm: null,
		calfRightCm: null,
	};
}

describe("MeasurementsView — resetar medidas", () => {
	it("apaga o histórico depois de confirmar", async () => {
		reset.mockResolvedValue({ ok: true, data: null });
		render(
			<MeasurementsView
				initialMeasurements={[
					measurement("2026-09-01", 80),
					measurement("2026-10-01", 79),
				]}
			/>,
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Opções das medidas" }),
		);
		// O menu (Base UI) abre num portal, depois de um tick.
		await userEvent.click(
			await screen.findByRole("menuitem", { name: "Resetar medidas" }),
		);
		expect(
			await screen.findByText(/As 2 medições registradas serão apagadas/),
		).toBeInTheDocument();
		expect(reset).not.toHaveBeenCalled();

		await userEvent.click(
			screen.getByRole("button", { name: "Resetar medidas" }),
		);
		expect(reset).toHaveBeenCalledOnce();
		expect(
			await screen.findByText("Nenhuma medição ainda"),
		).toBeInTheDocument();
	});
});
