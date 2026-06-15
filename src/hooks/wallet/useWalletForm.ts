import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet } from "models/wallet";
import { WalletFormInputs, WalletFormValues, WalletSchema } from "schemas/WalletSchema";

export interface UseWalletFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	wallet?: Wallet | null;
	onSave: (payload: WalletFormValues) => void;
}

export interface UseWalletFormResult {
	form: UseFormReturn<WalletFormInputs>;
	canSave: boolean;
	submit: () => Promise<void>;
}

const DEFAULT_VALUES: WalletFormInputs = {
	name: "",
	type: "Cash",
	openingBalance: 0,
};

export const useWalletForm = ({
	isOpen,
	isSaving,
	wallet,
	onSave,
}: UseWalletFormOptions): UseWalletFormResult => {
	const form = useForm<WalletFormInputs>({
		resolver: zodResolver(WalletSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { reset, handleSubmit } = form;

	useEffect(() => {
		reset(
			wallet
				? { name: wallet.name, type: wallet.type, openingBalance: wallet.openingBalance }
				: { ...DEFAULT_VALUES },
		);
	}, [isOpen, wallet, reset]);

	// Save stays enabled (hard rule 5): validation runs on submit and reports
	// inline; the button is only inert while a save is in flight.
	return {
		form,
		canSave: !isSaving,
		submit: handleSubmit(onSave),
	};
};
