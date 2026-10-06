import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export interface SidewaysScroll<T extends HTMLElement> {
	ref: RefObject<T | null>;
	/** Items hide past the left edge. */
	moreBefore: boolean;
	/** Items hide past the right edge. */
	moreAfter: boolean;
	/** Scrolls most of a strip's width towards the hidden items (an edge arrow). */
	step: (direction: -1 | 1) => void;
}

/**
 * A strip that scrolls sideways with its scrollbar hidden — a classic Windows
 * scrollbar would eat half of a 38px control. A mouse wheel scrolls it sideways
 * (a trackpad's own sideways swipe passes through), and `moreBefore` /
 * `moreAfter` say which edge hides items, for an edge fade and arrow.
 */
export function useSidewaysScroll<T extends HTMLElement>(): SidewaysScroll<T> {
	const ref = useRef<T>(null);
	const [edges, setEdges] = useState({ before: false, after: false });

	useEffect(() => {
		const el = ref.current;
		if (!el) {
			return;
		}
		const update = () => {
			const max = el.scrollWidth - el.clientWidth;
			const before = el.scrollLeft > 1;
			const after = el.scrollLeft < max - 1;
			setEdges((prev) =>
				prev.before === before && prev.after === after ? prev : { before, after },
			);
		};
		const onWheel = (event: WheelEvent) => {
			if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
				return;
			}
			const max = el.scrollWidth - el.clientWidth;
			const next = Math.min(max, Math.max(0, el.scrollLeft + event.deltaY));
			// At either end the wheel goes back to scrolling the page.
			if (next === el.scrollLeft) {
				return;
			}
			event.preventDefault();
			el.scrollLeft = next;
		};

		update();
		el.addEventListener("scroll", update, { passive: true });
		el.addEventListener("wheel", onWheel, { passive: false });
		const resize = new ResizeObserver(update);
		resize.observe(el);
		Array.from(el.children).forEach((child) => resize.observe(child));
		return () => {
			el.removeEventListener("scroll", update);
			el.removeEventListener("wheel", onWheel);
			resize.disconnect();
		};
	}, []);

	const step = useCallback((direction: -1 | 1) => {
		const el = ref.current;
		el?.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: "smooth" });
	}, []);

	return { ref, moreBefore: edges.before, moreAfter: edges.after, step };
}

const FADE_PX = 24;

/** CSS mask that fades the strip's content out at an edge that hides items. */
export function sidewaysFadeMask(moreBefore: boolean, moreAfter: boolean): string | undefined {
	if (!moreBefore && !moreAfter) {
		return undefined;
	}
	const start = moreBefore ? `transparent 0, black ${FADE_PX}px` : "black 0";
	const end = moreAfter ? `black calc(100% - ${FADE_PX}px), transparent 100%` : "black 100%";
	return `linear-gradient(to right, ${start}, ${end})`;
}
