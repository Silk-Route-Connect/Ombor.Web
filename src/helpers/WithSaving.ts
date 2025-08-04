import { runInAction } from "mobx";

import { ActionResult, tryRun } from "./TryRun";

export async function withSaving<TStore extends { isSaving: boolean }, TResult>(
	store: TStore,
	action: () => Promise<TResult> | TResult,
): Promise<ActionResult<TResult>> {
	if (store.isSaving) {
		return { status: "fail", error: "busy" };
	}

	runInAction(() => (store.isSaving = true));
	const result = await tryRun(action);
	runInAction(() => (store.isSaving = false));

	return result;
}
