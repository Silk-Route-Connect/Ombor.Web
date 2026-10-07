import { useTranslation } from "react-i18next";
import { SaveBlockCause } from "stores/connectivityTypes";
import { useStore } from "stores/StoreContext";

const REASON_KEY: Record<SaveBlockCause, string> = {
	backendDown: "common.saveBlocked.backendDown",
	offline: "common.saveBlocked.offline",
};

/**
 * The save gate's reason for a submit that needs the server (F-028): the
 * cause-specific text while the device is offline or the backend unreachable
 * (`ConnectivityStore.saveBlockedBy`), undefined while connected or when
 * `enabled` is false — a submit that needs no server (the debt reminder). Read
 * it inside an `observer` so the gate follows the connection.
 */
export function useSaveBlockedReason(enabled = true): string | undefined {
	const { t } = useTranslation();
	const { connectivityStore } = useStore();
	const cause = enabled ? connectivityStore.saveBlockedBy : null;
	return cause ? t(REASON_KEY[cause]) : undefined;
}

export default useSaveBlockedReason;
