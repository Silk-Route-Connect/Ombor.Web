import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { isPresent } from "helpers/Loading";
import { isOpenRefundState } from "routing/navigationState";
import { useStore } from "stores/StoreContext";
import { formatOptionalNumber } from "utils/formatEntityId";
import { directionOf } from "utils/transactionUtils";

/**
 * A list row's ⋮ «Оформить возврат» lands on the detail with router state: once
 * the document and its earlier refunds are loaded, open the refund modal — or,
 * when everything already went back, say so instead. The state is dropped first
 * so a reload or Back never reopens it.
 */
export function useOpenRefundOnArrival(): void {
	const { t } = useTranslation();
	const location = useLocation();
	const navigate = useNavigate();
	const { selectedTransactionStore, transactionStore, notificationStore } = useStore();
	const tx = selectedTransactionStore.transaction;
	const fullyRefunded = selectedTransactionStore.isFullyRefunded;

	useEffect(() => {
		if (!isOpenRefundState(location.state) || !isPresent(tx)) {
			return;
		}
		navigate(location.pathname, { replace: true, state: null });
		if (fullyRefunded) {
			notificationStore.info(
				t(`transaction.refund.nothingLeft.${directionOf(tx.type)}`, {
					number: formatOptionalNumber(tx.transactionNumber, t("common.noNumber")),
				}),
			);
			return;
		}
		transactionStore.openRefund(tx);
	}, [
		location.state,
		location.pathname,
		tx,
		fullyRefunded,
		navigate,
		notificationStore,
		transactionStore,
		t,
	]);
}
