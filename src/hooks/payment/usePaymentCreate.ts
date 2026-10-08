import { useEffect, useState } from "react";
import { isReady, Loadable, readyOr } from "helpers/Loading";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import {
	CreatePaymentRecordRequest,
	OutstandingTransaction,
	PaymentDirection,
	PaymentFormData,
	PaymentType,
	SettlementInput,
} from "models/payment";
import { analytics } from "services/telemetry";
import { toPeriod } from "utils/payrollUtils";

import { autoDirection, usePaymentForm } from "./usePaymentForm";

const EMPTY_FORM_DATA: PaymentFormData = { partners: [], employees: [], wallets: [] };

/**
 * A contextual ceiling the amount breaks: a withdrawal above the partner's
 * advance, or an outflow above what the wallet holds. Enforced here, not in the
 * schema — both depend on live served figures.
 */
export type PaymentAmountLimit = { kind: "advance" | "wallet"; limit: number };

export interface UsePaymentCreateOptions {
	isOpen: boolean;
	isSaving: boolean;
	formData: Loadable<PaymentFormData>;
	outstanding: Loadable<OutstandingTransaction[]>;
	onLoadOutstanding: (partnerId: number) => void;
	onSave: (request: CreatePaymentRecordRequest) => void;
	onClose: () => void;
}

/**
 * The standalone payment's logic (business-rules §B): the form, the type-driven
 * requirements and direction (rules 13–14), the contextual amount guards, the
 * attachments, the «Погашение долга» settlement step and the request it books.
 * `PaymentCreateModal` only lays it out.
 */
export const usePaymentCreate = ({
	isOpen,
	isSaving,
	formData,
	outstanding,
	onLoadOutstanding,
	onSave,
	onClose,
}: UsePaymentCreateOptions) => {
	const { form } = usePaymentForm({
		isOpen,
		wallets: isReady(formData) ? formData.wallets : [],
	});
	const { watch, handleSubmit, formState } = form;
	const [settleOpen, setSettleOpen] = useState(false);
	const [files, setFiles] = useState<File[]>([]);

	// Attachments live outside the RHF form (File objects aren't form values); cleared
	// when the modal closes so the next open starts fresh (F18).
	useEffect(() => {
		if (!isOpen) {
			setFiles([]);
		}
	}, [isOpen]);

	const addFiles = (list: FileList) => setFiles((cur) => [...cur, ...Array.from(list)]);
	const removeFile = (index: number) => setFiles((cur) => cur.filter((_, j) => j !== index));

	const data = readyOr(formData, EMPTY_FORM_DATA);

	const type = watch("type") as PaymentType;
	const partnerId = watch("partnerId");
	const walletId = watch("walletId");
	const amount = watch("amount");
	const userDir = watch("direction");

	const partner = data.partners.find((p) => p.id === partnerId) ?? null;
	const selectedWallet = data.wallets.find((w) => w.id === walletId) ?? null;

	const needsPartner = type === "Transaction" || type === "Deposit" || type === "Withdrawal";
	const autoDir = autoDirection(type, partner?.type ?? null);
	const needsDirChoice = autoDir === null;
	const effectiveDir: PaymentDirection = autoDir ?? userDir;

	const overWithdraw = type === "Withdrawal" && partner != null && amount > partner.advance;

	// Block a wallet outflow (Expense direction) that exceeds the source wallet's
	// balance — mirrors the transfer over-balance guard. Enforced here, not in the
	// schema (the balance is contextual). Server-side enforcement is a backend item.
	// Available clamps at zero (an overdrawn wallet has 0 to spend); Income is never
	// balance-gated — money coming in must be recordable on any wallet (DR-25).
	const walletAvailable = Math.max(0, selectedWallet?.balance ?? 0);
	const overWallet =
		effectiveDir === "Expense" && selectedWallet != null && amount > walletAvailable;

	let amountLimit: PaymentAmountLimit | null = null;
	if (overWithdraw) {
		amountLimit = { kind: "advance", limit: partner?.advance ?? 0 };
	} else if (overWallet) {
		amountLimit = { kind: "wallet", limit: walletAvailable };
	}

	// Load the partner's outstanding when settling, so the debts banner + the
	// settlement modal have data ready.
	useEffect(() => {
		if (type === "Transaction" && partnerId) {
			onLoadOutstanding(partnerId);
		}
	}, [type, partnerId, onLoadOutstanding]);

	const hasOpenDebts =
		type === "Transaction" && partner != null && isReady(outstanding) && outstanding.length > 0;

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		formState.isDirty || files.length > 0,
		isSaving,
		onClose,
	);

	const buildRequest = (settlements: SettlementInput[]): CreatePaymentRecordRequest => ({
		type,
		direction: effectiveDir,
		partnerId: needsPartner ? partnerId : null,
		employeeId: type === "Payroll" ? watch("employeeId") : null,
		walletId: walletId as number,
		amount,
		description: type === "General" ? watch("description") : null,
		period: type === "Payroll" ? toPeriod(Number(watch("year")), Number(watch("month"))) : null,
		settlements,
		attachments: files,
	});

	const onValid = (): void => {
		if (amountLimit) {
			// The amount field shows the reason; nothing is submitted.
			analytics.capture("form_validation_failed", {
				form: "payment_create",
				field_count: 1,
				first_field: "amount",
			});
			return;
		}
		if (type === "Transaction") {
			setSettleOpen(true); // distribute, then create on confirm
			return;
		}
		onSave(buildRequest([]));
	};

	const submit = handleSubmit(onValid, (errors) => {
		const fields = Object.keys(errors);
		analytics.capture("form_validation_failed", {
			form: "payment_create",
			field_count: fields.length,
			first_field: fields[0],
		});
	});

	const onKeyDown = useFormKeyboardSubmit(submit, isSaving, { requireModifier: true });

	const confirmSettlement = (settlements: SettlementInput[]): void => {
		setSettleOpen(false);
		onSave(buildRequest(settlements));
	};

	return {
		form,
		data,
		type,
		partner,
		selectedWallet,
		amount,
		needsPartner,
		needsDirChoice,
		effectiveDir,
		amountLimit,
		hasOpenDebts,
		files,
		addFiles,
		removeFile,
		settleOpen,
		closeSettlement: () => setSettleOpen(false),
		confirmSettlement,
		submit,
		onKeyDown,
		requestClose,
		discard: { open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard },
	};
};
