/**
 * Router state asking a list page to open its create modal on arrival — how the
 * topbar «Создать → Оплата» (`/payments/new`) reaches the real create modal on
 * /payments instead of a placeholder page.
 */
export const OPEN_CREATE_STATE = { openCreate: true } as const;

export const isOpenCreateState = (state: unknown): boolean =>
	typeof state === "object" &&
	state !== null &&
	(state as { openCreate?: unknown }).openCreate === true;
