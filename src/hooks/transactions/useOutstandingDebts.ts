import { useCallback, useEffect, useState } from "react";
import { OutstandingTransaction } from "models/payment";
import PaymentApi from "services/api/PaymentApi";

export interface OutstandingDebts {
	rows: OutstandingTransaction[];
	/**
	 * The last fetch failed. The POS must say so: treating a failure as «no open
	 * debts» let a cashier book real debt settlement as change or an advance.
	 */
	failed: boolean;
	retry(): void;
}

/** The partner's open transactions for the POS settlement step (rule 40). */
export function useOutstandingDebts(partnerId: number | null): OutstandingDebts {
	const [rows, setRows] = useState<OutstandingTransaction[]>([]);
	const [failed, setFailed] = useState(false);
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		setRows([]);
		setFailed(false);
		if (partnerId == null) {
			return;
		}
		let cancelled = false;
		PaymentApi.getOutstanding(partnerId)
			.then((data) => {
				if (!cancelled) {
					setRows(data);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setFailed(true);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [partnerId, attempt]);

	const retry = useCallback(() => setAttempt((n) => n + 1), []);

	return { rows, failed, retry };
}

export default useOutstandingDebts;
