import { useEffect, useRef, useState } from "react";
import { keyframes } from "@emotion/react";

import { useMediaQuery } from "@mui/material";

/**
 * Dashboard motion helpers — a restrained set used across the «Главное» screen
 * (staggered entrance reveals, hero-number count-up). Every effect is gated on
 * `prefers-reduced-motion` so the page degrades to a static render for users who
 * opt out. Easing matches the design system's standard `cubic-bezier(.4,0,.2,1)`.
 */

/** Fade + rise entrance for cards and panels. */
export const fadeUp = keyframes({
	from: { opacity: 0, transform: "translateY(10px)" },
	to: { opacity: 1, transform: "translateY(0)" },
});

export const EASE = "cubic-bezier(.4,0,.2,1)";

export function usePrefersReducedMotion(): boolean {
	return useMediaQuery("(prefers-reduced-motion: reduce)", { noSsr: true });
}

/**
 * sx that reveals each direct child with a staggered fade-up. No-op when the
 * user prefers reduced motion (pass `enabled = false`).
 */
export function staggerChildrenSx(
	count: number,
	enabled: boolean,
	{
		step = 70,
		base = 40,
		duration = 460,
	}: { step?: number; base?: number; duration?: number } = {},
): Record<string, unknown> {
	if (!enabled) {
		return {};
	}
	const sx: Record<string, unknown> = {
		"& > *": { animation: `${fadeUp} ${duration}ms ${EASE} both` },
	};
	for (let i = 0; i < count; i++) {
		sx[`& > *:nth-of-type(${i + 1})`] = { animationDelay: `${base + i * step}ms` };
	}
	return sx;
}

/**
 * Counts a numeric value up from 0 → `target` with an ease-out curve, restarting
 * whenever `target` changes (e.g. on a period switch). Returns `target` verbatim
 * when reduced motion is preferred.
 */
export function useCountUp(target: number, duration = 850): number {
	const reduced = usePrefersReducedMotion();
	const [value, setValue] = useState(reduced ? target : 0);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		if (reduced) {
			setValue(target);
			return;
		}
		const start = performance.now();
		const tick = (now: number): void => {
			const t = Math.min(1, (now - start) / duration);
			const eased = 1 - Math.pow(1 - t, 3);
			setValue(target * eased);
			if (t < 1) {
				rafRef.current = requestAnimationFrame(tick);
			}
		};
		rafRef.current = requestAnimationFrame(tick);
		// Guarantee the final value lands even if rAF is paused (hidden/background
		// tab) and never resumes — timers still fire there, rAF does not.
		const settle = setTimeout(() => setValue(target), duration + 120);
		return () => {
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
			clearTimeout(settle);
		};
	}, [target, duration, reduced]);

	return value;
}
