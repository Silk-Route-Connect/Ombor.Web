import { RequestHandler } from "msw";

import { categoryHandlers } from "./category";
import { productHandlers } from "./product";
import { stockAdjustmentHandlers } from "./stockAdjustment";
import { warehouseHandlers } from "./warehouse";

/**
 * Aggregate of every module's mock handlers. Categories and Products are mocked
 * at the target v1 contract because their real endpoints are stale at the page
 * level (Categories: no productCount, no reference-checked delete; Products:
 * writable QuantityInStock, no served stock/WAC aggregates, hard delete) — see
 * docs/mocking.md. The two share state: product writes keep category
 * productCount consistent. Add a module's handlers here when its backend can't
 * satisfy the designed page. Warehouses are mocked at `/api/warehouses` (the
 * stale backend resource is `/api/inventories`); their stock/movements are
 * derived from the Products mock so the two reconcile.
 */
export const handlers: RequestHandler[] = [
	...categoryHandlers,
	...productHandlers,
	...warehouseHandlers,
	...stockAdjustmentHandlers,
];
