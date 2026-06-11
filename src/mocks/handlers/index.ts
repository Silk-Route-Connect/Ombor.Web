import { RequestHandler } from "msw";

import { categoryHandlers } from "./category";

/**
 * Aggregate of every module's mock handlers. The Categories resource is mocked
 * at the target v1 contract because the real endpoint is stale at the page level
 * (no productCount, no Default Category, no reference-checked delete) — see
 * docs/mocking.md. Add a module's handlers here when its backend can't satisfy
 * the designed page.
 */
export const handlers: RequestHandler[] = [...categoryHandlers];
