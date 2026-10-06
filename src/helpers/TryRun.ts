/**
 * Outcome of an async call. A failure keeps the original thrown value in `cause`
 * (the axios error with the server's ProblemDetails), so callers can map its
 * error code to localized text (`utils/apiError`) instead of a fixed message.
 */
export type ActionResult<T> =
	| { status: "success"; data: T }
	| { status: "fail"; error: string; cause?: unknown };

export async function tryRun<T>(action: () => T | Promise<T>): Promise<ActionResult<T>> {
	try {
		const data = await action();

		return { status: "success", data };
	} catch (err) {
		let message: string;

		if (err instanceof Error) {
			message = err.message;
		} else if (typeof err === "string") {
			message = err;
		} else {
			message = JSON.stringify(err);
		}

		return { status: "fail", error: message, cause: err };
	}
}
