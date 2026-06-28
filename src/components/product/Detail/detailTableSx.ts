import { numericSx } from "theme";

/**
 * The embedded detail-table chrome now lives in one shared place; this re-export
 * keeps the Product / Warehouse / Transfer call sites pointing at `detailTableSx`
 * unchanged. See {@link file://../../shared/Detail/detailTableChrome.ts}.
 */
export { detailTableSx } from "components/shared/Detail/detailTableChrome";

/** Leading icon for a detail card title (`.sd-card-title` icon). */
export const cardIconSx = { fontSize: 17, color: "text.secondary" } as const;

/** Stock-in / stock-out emphasis (`.qin` / `.qout`). */
export const quantityInSx = { ...numericSx, color: "success.main", fontWeight: 700 } as const;
export const quantityOutSx = { ...numericSx, color: "error.main", fontWeight: 700 } as const;
