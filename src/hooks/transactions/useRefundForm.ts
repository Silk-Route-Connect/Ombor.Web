import { useMemo, useState } from "react";
import { CreateRefundRequest, TransactionRecord } from "models/transaction";
import { parseWholeQuantity } from "utils/quantityInput";
import { RefundableLine, refundableLines } from "utils/refundUtils";
import { discountLabel, effectiveUnitPrice } from "utils/transactionUtils";

/** An original line as the refund modal shows it. */
export interface RefundLine extends RefundableLine {
	name: string;
	unit: string;
	/** Effective unit price after the line discount — what goes back per unit. */
	price: number;
	/** «−10%» / «−5 000» when the line was discounted. */
	disc: string | null;
}

export interface RefundRowDraft {
	checked: boolean;
	/** Typed quantity as text, so «1,5» stays visible and flagged (rule 21). */
	qty: string;
}

export interface RefundRowCheck {
	qty: number;
	over: boolean;
	notWhole: boolean;
	amount: number;
}

interface UseRefundFormArgs {
	transaction: TransactionRecord;
	priorRefunds: readonly TransactionRecord[];
	onSubmit: (payload: CreateRefundRequest) => void;
}

/**
 * Refund modal state: which lines go back and how many, the mandatory reason,
 * and the per-line checks (whole quantity, not above what is still refundable).
 */
export function useRefundForm({ transaction, priorRefunds, onSubmit }: UseRefundFormArgs) {
	const lines = useMemo<RefundLine[]>(
		() =>
			refundableLines(transaction, priorRefunds).map((line, i) => {
				const source = transaction.lines[i];
				return {
					...line,
					name: source.productName,
					unit: source.unit ?? "",
					price: effectiveUnitPrice(source),
					disc: discountLabel(source),
				};
			}),
		[transaction, priorRefunds],
	);

	const [rows, setRows] = useState<RefundRowDraft[]>(() =>
		lines.map(() => ({ checked: false, qty: "" })),
	);
	const [reason, setReasonValue] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [dirty, setDirty] = useState(false);

	const setRow = (i: number, patch: Partial<RefundRowDraft>) => {
		setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
		setDirty(true);
	};

	const toggle = (i: number) =>
		setRow(
			i,
			rows[i].checked
				? { checked: false, qty: "" }
				: { checked: true, qty: String(Math.max(lines[i].available, 0)) },
		);

	const setQty = (i: number, qty: string) => setRow(i, { qty });

	const setReason = (value: string) => {
		setReasonValue(value);
		setDirty(true);
	};

	const checks: RefundRowCheck[] = rows.map((r, i) => {
		const parsed = parseWholeQuantity(r.qty);
		// «1,5» stays visible and flagged instead of being read as 15 (ux-5, rule 21).
		const notWhole = r.checked && (parsed.kind === "fraction" || parsed.kind === "invalid");
		const qty = parsed.kind === "whole" ? parsed.value : 0;
		const over = r.checked && qty > lines[i].available;
		const amount = r.checked && !over && !notWhole ? qty * lines[i].price : 0;
		return { qty, over, notWhole, amount };
	});

	const selected = rows
		.map((r, i) => ({ r, line: lines[i], check: checks[i] }))
		.filter((x) => x.r.checked && x.check.qty > 0 && !x.check.notWhole);
	const anyOver = checks.some((c) => c.over);
	const anyNotWhole = checks.some((c) => c.notWhole);
	const totalAmount = selected.reduce((sum, x) => sum + x.check.amount, 0);
	const posCount = selected.length;

	const submit = () => {
		setSubmitted(true);
		if (posCount === 0 || anyOver || anyNotWhole || reason.trim() === "") {
			return;
		}
		onSubmit({
			reason: reason.trim(),
			lines: selected.map((x) => ({
				productId: x.line.productId,
				productName: x.line.name,
				quantity: x.check.qty,
				unitPrice: x.line.price,
			})),
		});
	};

	return {
		lines,
		rows,
		checks,
		toggle,
		setQty,
		reason,
		setReason,
		reasonError: submitted && reason.trim() === "",
		noLines: submitted && posCount === 0 && !anyNotWhole,
		anyOver,
		posCount,
		totalAmount,
		dirty,
		submit,
	};
}
