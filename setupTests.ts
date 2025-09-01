// jest-dom adds custom jest matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
	readonly root: Element | null = null;
	readonly rootMargin: string = "";
	readonly thresholds: ReadonlyArray<number> = [];

	disconnect(): void {
		return undefined;
	}

	observe(): void {
		return undefined;
	}

	unobserve(): void {
		return undefined;
	}

	takeRecords(): IntersectionObserverEntry[] {
		return [];
	}
}

// Type assertion to window.IntersectionObserver type
global.IntersectionObserver = IntersectionObserverMock as typeof IntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: jest.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
	writable: true,
	value: jest.fn(),
});

// Clean up after each test
afterEach(() => {
	jest.clearAllMocks();
});
