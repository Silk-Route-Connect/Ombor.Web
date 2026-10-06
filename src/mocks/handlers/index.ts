import { RequestHandler } from "msw";

/**
 * MSW handlers for endpoints the backend does not serve yet (docs/mocking.md).
 * Empty: every resource is real since the backend caught up, and the old
 * handlers shadowed real endpoints (a reset-password or invite mock "succeeded"
 * without doing anything). Add a module's handlers here only for a genuine new
 * gap, written to the target contract — never for an endpoint that exists.
 */
export const handlers: RequestHandler[] = [];
