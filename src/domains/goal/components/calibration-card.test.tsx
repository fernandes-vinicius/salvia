import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { applyCalibrationAction } from "~/domains/goal/actions/calibration-actions";
import { CalibrationCard } from "~/domains/goal/components/calibration-card";

vi.mock("~/domains/goal/actions/calibration-actions", () => ({
	applyCalibrationAction: vi.fn(),
	resetCalibrationAction: vi.fn(),
}));
vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const apply = vi.mocked(applyCalibrationAction);
const noCalibration = { kcal: 0, since: null };

describe("CalibrationCard", () => {
	beforeEach(() => {
		apply.mockReset();
		localStorage.clear();
	});

	it("explica o que falta pra conferir a meta", () => {
		render(
			<CalibrationCard
				analysis={{ kind: "need-data", weighIns: 1, days: 0 }}
				calibration={noCalibration}
			/>,
		);
		expect(screen.getByText("Pesagens: 1 de 3")).toBeInTheDocument();
		expect(screen.getByText("Dias: 0 de 14")).toBeInTheDocument();
		expect(screen.getByText("Registrar peso").closest("a")).toHaveAttribute(
			"href",
			"/medidas",
		);
	});

	it("sugere o ajuste em linguagem simples e aplica", async () => {
		apply.mockResolvedValue({ ok: true, deltaKcal: -300 });
		render(
			<CalibrationCard
				analysis={{
					kind: "suggest",
					observedWeeklyKg: -0.1,
					expectedWeeklyKg: -0.45,
					days: 21,
					deltaKcal: -300,
					adherence: null,
				}}
				calibration={noCalibration}
			/>,
		);

		expect(
			screen.getByText("Sugestão: comer 300 kcal a menos por dia."),
		).toBeInTheDocument();
		expect(screen.queryByText(/déficit|cutting/i)).toBeNull();

		await userEvent.click(
			screen.getByRole("button", { name: "Aplicar ajuste" }),
		);
		expect(apply).toHaveBeenCalledOnce();
	});

	it("'Agora não' esconde a mesma sugestão", async () => {
		const analysis = {
			kind: "suggest" as const,
			observedWeeklyKg: -1.2,
			expectedWeeklyKg: -0.45,
			days: 21,
			deltaKcal: 300,
			adherence: null,
		};
		const { unmount } = render(
			<CalibrationCard analysis={analysis} calibration={noCalibration} />,
		);
		await userEvent.click(screen.getByRole("button", { name: "Agora não" }));
		expect(screen.queryByText(/Sugestão/)).toBeNull();
		unmount();

		render(<CalibrationCard analysis={analysis} calibration={noCalibration} />);
		expect(screen.queryByText(/Sugestão/)).toBeNull();
	});

	it("mostra o ajuste já aplicado com opção de desfazer", () => {
		render(
			<CalibrationCard
				analysis={{
					kind: "on-track",
					observedWeeklyKg: -0.4,
					expectedWeeklyKg: -0.45,
					days: 21,
					adherence: null,
				}}
				calibration={{ kcal: -250, since: "2026-10-01" }}
			/>,
		);
		expect(screen.getByText(/perdendo 0,4 kg/)).toBeInTheDocument();
		expect(screen.getByText(/−250 kcal por dia/)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Desfazer ajustes" }),
		).toBeInTheDocument();
	});

	it("com adesão baixa, pede pra seguir a dieta em vez de ajustar", () => {
		render(
			<CalibrationCard
				analysis={{
					kind: "low-adherence",
					observedWeeklyKg: -0.1,
					expectedWeeklyKg: -0.45,
					days: 21,
					adherence: 60,
				}}
				calibration={noCalibration}
			/>,
		);
		expect(screen.getByText("60%")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Aplicar ajuste" }),
		).not.toBeInTheDocument();
	});
});
