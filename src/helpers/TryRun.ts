export type ActionResult<T> = { status: "success"; data: T } | { status: "fail"; error: string };

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

		return { status: "fail", error: message };
	}
}
