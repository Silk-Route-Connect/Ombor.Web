import { useEffect, useState } from "react";

/** The current time (ms epoch), re-read every `intervalMs` while the component is mounted — a live countdown. */
export function useNow(intervalMs = 1_000): number {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
		return () => window.clearInterval(timer);
	}, [intervalMs]);

	return now;
}

export default useNow;
