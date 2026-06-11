import { RequestHandler } from "msw";

/**
 * Aggregate of every module's mock handlers.
 *
 * Currently EMPTY: the backend covers every module the UI uses today, so the
 * mock layer is dormant (with VITE_ENABLE_MOCKS on, the worker starts but
 * intercepts nothing — all requests pass through). Add a module's handlers here
 * only when the backend cannot satisfy its target contract (see docs/mocking.md).
 */
export const handlers: RequestHandler[] = [];
