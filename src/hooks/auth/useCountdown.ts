import React from "react";

const TICK_MS = 500;

/**
 * Whole seconds left until a deadline. Counts against the clock, not by
 * decrementing per tick: a backgrounded tab (the user switched to the SMS app)
 * throttles timers, and a per-tick counter would then run slow and show a code
 * as still valid after the server expired it.
 */
export function useCountdown(initialSeconds: number) {
	const [seconds, setSeconds] = React.useState<number>(initialSeconds);
	const timerRef = React.useRef<number | null>(null);

	const stop = React.useCallback(() => {
		if (timerRef.current !== null) {
			window.clearInterval(timerRef.current);
			timerRef.current = null;
		}
	}, []);

	const start = React.useCallback(
		(resetTo?: number) => {
			const startFrom = Math.max(0, typeof resetTo === "number" ? resetTo : initialSeconds);
			stop();
			setSeconds(startFrom);
			if (startFrom === 0) {
				return;
			}
			const deadline = Date.now() + startFrom * 1000;
			timerRef.current = window.setInterval(() => {
				const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
				setSeconds(left);
				if (left === 0) {
					stop();
				}
			}, TICK_MS);
		},
		[initialSeconds, stop],
	);

	React.useEffect(() => stop, [stop]);

	return { seconds, start };
}
