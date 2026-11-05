import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { importMeasurementsAction } from "~/domains/measurements/actions/measurement-actions";
import { MeasurementImport } from "~/domains/measurements/components/measurement-import";
import { analytics } from "~/shared/lib/analytics/analytics";

const push = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push, refresh: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("~/domains/measurements/actions/measurement-actions", () => ({
	importMeasurementsAction: vi.fn(),
}));
vi.mock("~/shared/lib/analytics/analytics", () => ({
	analytics: { track: vi.fn() },
}));

const action = vi.mocked(importMeasurementsAction);

const csv = [
	"Data;Peso (kg);Cintura;Obs",
	"01/10/2026;78,5;90;começo",
	"08/10/2026;78;;",
	"15/10/2026;77,6;89;",
].join("\n");

async function upload(content = csv, name = "medidas.csv") {
	const file = new File([content], name, { type: "text/csv" });
	await userEvent.upload(screen.getByLabelText("Escolher planilha"), file);
}

describe("MeasurementImport", () => {
	beforeEach(() => {
		action.mockReset();
		push.mockReset();
		vi.mocked(analytics.track).mockReset();
	});

	it("reads the CSV and shows what will be imported", async () => {
		render(
			<MeasurementImport existingDays={["2026-10-15"]} today="2026-11-04" />,
		);
		await upload();

		expect(
			await screen.findByText(/2 medições de 01\/10\/2026 a 08\/10\/2026/),
		).toBeVisible();
		expect(screen.getByText(/1 dia já está no app/)).toBeVisible();
		expect(screen.getByLabelText("Coluna “Peso (kg)”")).toHaveValue("weightKg");
		expect(screen.getByLabelText("Coluna “Obs”")).toHaveValue("");
	});

	it("saves and goes back to the measurements", async () => {
		action.mockResolvedValue({ ok: true, data: { imported: 3 } });
		render(<MeasurementImport existingDays={[]} today="2026-11-04" />);
		await upload();

		await userEvent.click(
			await screen.findByRole("button", { name: "Importar 3 medições" }),
		);

		expect(action).toHaveBeenCalledWith([
			expect.objectContaining({
				measuredOn: "2026-10-01",
				weightKg: 78.5,
				waistCm: 90,
			}),
			expect.objectContaining({ measuredOn: "2026-10-08", weightKg: 78 }),
			expect.objectContaining({ measuredOn: "2026-10-15", waistCm: 89 }),
		]);
		expect(analytics.track).toHaveBeenCalledWith("medidas_importadas", {
			quantidade: 3,
		});
		expect(push).toHaveBeenCalledWith("/medidas");
	});

	it("lets the person fix a column", async () => {
		render(<MeasurementImport existingDays={[]} today="2026-11-04" />);
		await upload();

		await userEvent.selectOptions(
			await screen.findByLabelText("Coluna “Cintura”"),
			"abdomenCm",
		);
		action.mockResolvedValue({ ok: true, data: { imported: 3 } });
		await userEvent.click(
			screen.getByRole("button", { name: "Importar 3 medições" }),
		);

		expect(action.mock.calls[0][0]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					measuredOn: "2026-10-01",
					abdomenCm: 90,
					waistCm: null,
				}),
			]),
		);
	});

	it("explains a file without a date column", async () => {
		render(<MeasurementImport existingDays={[]} today="2026-11-04" />);
		await upload("Peso;Cintura\n78;90");

		expect(await screen.findByText(/coluna com a data/)).toBeVisible();
		expect(screen.queryByRole("button", { name: /Importar/ })).toBeNull();
	});

	it("refuses old Excel files", async () => {
		render(<MeasurementImport existingDays={[]} today="2026-11-04" />);
		await upload("x", "medidas.xls");

		expect(await screen.findByText(/\.xlsx ou \.csv/)).toBeVisible();
	});
});
