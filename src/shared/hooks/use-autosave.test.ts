import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAutosave } from "~/shared/hooks/use-autosave";

describe("useAutosave", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("salva só o último valor depois do debounce", async () => {
		const save = vi.fn().mockResolvedValue(true);
		const { result } = renderHook(() => useAutosave({ save, delay: 500 }));

		act(() => {
			result.current.schedule(1);
			result.current.schedule(2);
			result.current.schedule(3);
		});
		expect(result.current.status).toBe("pending");
		expect(save).not.toHaveBeenCalled();

		await act(async () => {
			await vi.advanceTimersByTimeAsync(500);
		});

		expect(save).toHaveBeenCalledTimes(1);
		expect(save).toHaveBeenCalledWith(3);
		expect(result.current.status).toBe("saved");
	});

	it("marca erro quando o save falha", async () => {
		const save = vi.fn().mockRejectedValue(new Error("rede"));
		const { result } = renderHook(() => useAutosave({ save, delay: 100 }));

		act(() => {
			result.current.schedule("x");
		});
		await act(async () => {
			await vi.advanceTimersByTimeAsync(100);
		});

		expect(result.current.status).toBe("error");
	});

	it("salva o pendente ao desmontar", async () => {
		const save = vi.fn().mockResolvedValue(true);
		const { result, unmount } = renderHook(() =>
			useAutosave({ save, delay: 1000 }),
		);

		act(() => {
			result.current.schedule("rascunho");
		});
		unmount();
		await vi.runAllTimersAsync();

		expect(save).toHaveBeenCalledWith("rascunho");
	});
});
