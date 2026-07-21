import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "models/wallet";
import { TransferFormInputs, TransferFormValues, TransferSchema } from "schemas/WalletSchema";

export interface UseWalletTransferFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	/** Active (non-archived) wallets, used to seed the default route. */
	wallets: Wallet[];
	/** Pre-selected source wallet (the detail page passes the open wallet). */
	fromWalletId?: number;
	onSave: (payload: TransferFormValues) => void;
}

export interface UseWalletTransferFormResult {
	form: UseFormReturn<TransferFormInputs>;
	canSave: boolean;
	submit: () => Promise<void>;
}

const DEFAULT_VALUES: TransferFormInputs = {
	fromWalletId: 0,
	toWalletId: 0,
	amount: 0,
	note: "",
};

export const useWalletTransferForm = ({
	isOpen,
	isSaving,
	wallets,
	fromWalletId,
	onSave,
}: UseWalletTransferFormOptions): UseWalletTransferFormResult => {
	const form = useForm<TransferFormInputs>({
		resolver: zodResolver(TransferSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { reset, handleSubmit } = form;

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const from = fromWalletId ?? wallets[0]?.id ?? 0;
		const to = wallets.find((w) => w.id !== from)?.id ?? 0;
		reset({ fromWalletId: from, toWalletId: to, amount: 0, note: "" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, fromWalletId]);

	return {
		form,
		canSave: !isSaving,
		submit: handleSubmit(onSave),
	};
};
