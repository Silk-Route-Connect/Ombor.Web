import React from "react";

export function useCountdown(initialSeconds: number) {
	const [seconds, setSeconds] = React.useState<number>(initialSeconds);
	const timerRef = React.useRef<number | null>(null);

	const start = React.useCallback(
		(resetTo?: number) => {
			const startFrom = typeof resetTo === "number" ? resetTo : initialSeconds;
			setSeconds(startFrom);
			if (timerRef.current !== null) window.clearInterval(timerRef.current);
			timerRef.current = window.setInterval(() => {
				setSeconds((s) => {
					if (s <= 1) {
						if (timerRef.current !== null) {
							window.clearInterval(timerRef.current);
							timerRef.current = null;
						}
						return 0;
					}
					return s - 1;
				});
			}, 1000);
		},
		[initialSeconds],
	);

	React.useEffect(() => {
		return () => {
			if (timerRef.current !== null) window.clearInterval(timerRef.current);
		};
	}, []);

	return { seconds, start };
}
