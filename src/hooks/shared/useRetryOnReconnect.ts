import { useEffect, useRef } from "react";
import { reaction } from "mobx";
import { useStore } from "stores/StoreContext";

/**
 * Re-runs a load that failed for lack of a connection as soon as the connection
 * returns (`ConnectivityStore.reconnects`) — the «Повторить» the user would press
 * anyway. `retry` may change every render; the latest one runs.
 */
export function useRetryOnReconnect(retry: (() => void) | undefined, enabled: boolean): void {
	const { connectivityStore } = useStore();
	const retryRef = useRef(retry);

	useEffect(() => {
		retryRef.current = retry;
	});

	useEffect(() => {
		if (!enabled) {
			return undefined;
		}
		return reaction(
			() => connectivityStore.reconnects,
			() => retryRef.current?.(),
		);
	}, [connectivityStore, enabled]);
}

export default useRetryOnReconnect;
