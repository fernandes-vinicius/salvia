import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "~/shared/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("retorna o valor inicial imediatamente", () => {
		const { result } = renderHook(() => useDebouncedValue("arroz", 300));
		expect(result.current).toBe("arroz");
	});

	it("não atualiza antes do delay passar", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebouncedValue(value, 300),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "ar" });
		act(() => {
			vi.advanceTimersByTime(299);
		});

		expect(result.current).toBe("a");
	});

	it("atualiza pro último valor depois do delay", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebouncedValue(value, 300),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "ar" });
		act(() => {
			vi.advanceTimersByTime(300);
		});

		expect(result.current).toBe("ar");
	});

	it("reinicia o timer a cada mudança rápida — só o último valor sobrevive", () => {
		const { result, rerender } = renderHook(
			({ value }) => useDebouncedValue(value, 300),
			{ initialProps: { value: "a" } },
		);

		rerender({ value: "ar" });
		act(() => {
			vi.advanceTimersByTime(200);
		});
		rerender({ value: "arr" });
		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current).toBe("a");

		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(result.current).toBe("arr");
	});
});
