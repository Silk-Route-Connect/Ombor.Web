import { isReady, Loadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { SearchResults } from "models/search";
import SearchApi from "services/api/SearchApi";
import { SearchOption, searchOptions } from "utils/globalSearch";

/** Long enough to skip the keystrokes in between, short enough to feel live. */
const DEBOUNCE_MS = 250;
/** The server's `q` limit — the field stops there instead of sending a 400. */
export const SEARCH_MAX_LENGTH = 100;

export interface ISearchStore {
	isOpen: boolean;
	query: string;
	/** `null` until something is typed; otherwise the latest answer (or its load state). */
	results: Loadable<SearchResults> | null;
	/** A newer query is in flight while the previous results stay on screen. */
	isRefreshing: boolean;
	activeIndex: number;
	readonly options: SearchOption[];
	readonly activeOption: SearchOption | null;
	/** The rows on screen answer an older query (typing ahead of the debounce or the server). */
	readonly isStale: boolean;

	open(): void;
	close(): void;
	setQuery(query: string): void;
	/** Searches the current query right away: «Повторить», or Enter typed ahead of the debounce. */
	searchNow(): void;
	/**
	 * Enter: closes the palette and returns the highlighted record's path. Typed
	 * ahead of the answer, it searches now instead and returns null — never a row
	 * of the older query.
	 */
	pickActive(): string | null;
	/** ↑ / ↓ — wraps around the ends. */
	moveActive(step: 1 | -1): void;
	setActive(index: number): void;
}

/**
 * The topbar's global search palette (Ctrl+K): the typed query, the debounced
 * `GET /api/search` answer and the keyboard-highlighted row. Latest-only — a
 * slow answer to an older query never replaces a newer one, and the superseded
 * request is cancelled. The last query stays when the palette closes, so
 * reopening it shows the same results.
 */
export class SearchStore implements ISearchStore {
	private readonly loads = new LoadSequence();
	private timer: ReturnType<typeof setTimeout> | undefined;
	private inFlight: AbortController | undefined;
	/** The query behind the request in flight, and the one `results` answers. */
	private pendingQuery: string | null = null;
	private answeredQuery: string | null = null;

	isOpen = false;
	query = "";
	results: Loadable<SearchResults> | null = null;
	isRefreshing = false;
	activeIndex = 0;

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get options(): SearchOption[] {
		return this.results !== null && isReady(this.results) ? searchOptions(this.results) : [];
	}

	get activeOption(): SearchOption | null {
		return this.options[this.activeIndex] ?? null;
	}

	get isStale(): boolean {
		if (this.results === null) {
			return false;
		}
		return !isReady(this.results) || this.answeredQuery !== this.query.trim();
	}

	open(): void {
		this.isOpen = true;
	}

	close(): void {
		this.isOpen = false;
	}

	setQuery(query: string): void {
		this.query = query.slice(0, SEARCH_MAX_LENGTH);
		this.activeIndex = 0;
		clearTimeout(this.timer);
		if (this.query.trim() === "") {
			this.cancel();
			this.results = null;
			this.isRefreshing = false;
			return;
		}
		this.timer = setTimeout(() => void this.run(), DEBOUNCE_MS);
	}

	searchNow(): void {
		clearTimeout(this.timer);
		void this.run();
	}

	pickActive(): string | null {
		if (this.isStale) {
			if (this.pendingQuery !== this.query.trim()) {
				this.searchNow();
			}
			return null;
		}
		const option = this.activeOption;
		if (option) {
			this.close();
		}
		return option?.path ?? null;
	}

	moveActive(step: 1 | -1): void {
		const count = this.options.length;
		if (count > 0) {
			this.activeIndex = (this.activeIndex + step + count) % count;
		}
	}

	setActive(index: number): void {
		this.activeIndex = index;
	}

	private cancel(): void {
		this.loads.invalidate();
		this.inFlight?.abort();
		this.inFlight = undefined;
		this.pendingQuery = null;
	}

	private async run(): Promise<void> {
		const q = this.query.trim();
		if (q === "") {
			return;
		}
		this.cancel();
		const isCurrent = this.loads.begin();
		const controller = new AbortController();
		this.inFlight = controller;
		this.pendingQuery = q;

		const keepShown = this.results !== null && isReady(this.results);
		runInAction(() => {
			if (keepShown) {
				this.isRefreshing = true;
			} else {
				this.results = "loading";
			}
		});

		const result = await tryRun(() => SearchApi.search({ q }, controller.signal));
		if (!isCurrent()) {
			return;
		}
		// A failure shows in the palette with «Повторить»; a toast on top would only repeat it.
		runInAction(() => {
			this.results = toLoadable(result);
			this.answeredQuery = q;
			this.isRefreshing = false;
			this.activeIndex = 0;
			this.inFlight = undefined;
			this.pendingQuery = null;
		});
	}
}

export default SearchStore;
