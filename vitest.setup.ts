import "@testing-library/jest-dom/vitest";

// Base UI (AlertDialog/Select etc., usados pelos componentes de UI do app)
// depende de APIs de pointer capture e ResizeObserver que o jsdom não
// implementa — sem esses stubs, montar esses componentes em teste lança
// erros mesmo quando o comportamento sob teste não depende deles.
if (!Element.prototype.hasPointerCapture) {
	Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
	Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
	Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {};
}

class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
// biome-ignore lint/suspicious/noExplicitAny: stub global só existe em runtime de browser
(globalThis as any).ResizeObserver ??= ResizeObserverStub;

if (!window.matchMedia) {
	window.matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	});
}
