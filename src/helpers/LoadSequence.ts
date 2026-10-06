/**
 * Latest-only guard for loads keyed by an id or a filter. A response from a
 * superseded load (the user moved from record A to record B) or one that lands
 * after the page left (`invalidate()` from the store's `clear()`) is dropped, so
 * it can never overwrite the state of the page now on screen.
 *
 * ```ts
 * const isCurrent = this.loads.begin();
 * const result = await tryRun(() => Api.getById(id));
 * if (!isCurrent()) return;
 * ```
 */
export class LoadSequence {
	private current = 0;

	/** Starts a load; the returned check is true only while it is still the latest one. */
	begin(): () => boolean {
		const token = ++this.current;
		return () => token === this.current;
	}

	/** Drops every in-flight load. */
	invalidate(): void {
		this.current++;
	}
}
