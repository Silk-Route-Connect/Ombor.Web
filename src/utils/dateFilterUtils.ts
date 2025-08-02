/* ============================================================================
   DATE-FILTER MODEL  (single source of truth for all date filtering)
   ========================================================================== */

export type PresetOption = "week" | "month" | "alltime";

/** Discriminated-union that makes “custom” mutually exclusive with “preset”. */
export type DateFilter =
	| { type: "preset"; preset: PresetOption }
	| { type: "custom"; from: Date; to: Date };

/** Concrete bounds used for filtering operations. */
export interface Bounds {
	from: Date | null; // null ⇒ no lower bound  ("all")
	to: Date | null; // null ⇒ no upper bound
}

/** Turns a filter into concrete bounds relative to “today”. */
export function materialise(filter: DateFilter, today = new Date()): Bounds {
	const d0 = startOfDay(today);

	if (filter.type === "custom") return { from: filter.from, to: filter.to };

	switch (filter.preset) {
		case "week":
			return { from: addDays(d0, -7), to: d0 };
		case "month":
			return { from: addMonths(d0, -1), to: d0 };
		case "alltime":
			return { from: null, to: null };
	}
}

/* ──────────────── tiny, dependency-free helpers ──────────────── */
const startOfDay = (d: Date) => {
	const c = new Date(d);
	c.setHours(0, 0, 0, 0);
	return c;
};
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const addMonths = (d: Date, n: number) => {
	const c = new Date(d);
	c.setMonth(c.getMonth() + n);
	return c;
};
