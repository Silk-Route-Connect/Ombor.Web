import { useEffect, useMemo } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { Employee } from "models/employee";
import { Wallet } from "models/wallet";
import { PayrollFormInputs, PayrollFormValues, PayrollSchema } from "schemas/PayrollSchema";
import { useStore } from "stores/StoreContext";
import { formatCurrency } from "utils/formatCurrency";
import { payrollDefaultValues } from "utils/payrollUtils";

export type PayrollFormPayload = PayrollFormValues;

/** The modal is always opened to create a payroll for a specific employee. */
export type PayrollFormMode = Employee | null;

interface UsePayrollFormParams {
	isOpen: boolean;
	isSaving: boolean;
	mode: PayrollFormMode;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
	onClose: () => void;
}

interface UsePayrollFormResult {
	form: UseFormReturn<PayrollFormInputs>;
	canSave: boolean;
	discardOpen: boolean;
	isEmployeeLocked: boolean;

	wallets: Wallet[];
	/** Served balance of the picked wallet, clamped at zero (an overdrawn wallet has 0 to pay out). */
	walletAvailable: number | null;
	selectedEmployee: Employee | null;
	setEmployeeId: (employeeId: number) => void;

	submit: () => Promise<void>;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

const isEmployee = (mode: PayrollFormMode): mode is Employee => {
	return mode !== null && "status" in mode && "salary" in mode;
};

export function usePayrollForm({
	isOpen,
	isSaving,
	mode,
	onSave,
	onClose,
}: UsePayrollFormParams): UsePayrollFormResult {
	const { t } = useTranslation();
	const { employeeStore, walletStore } = useStore();

	const form = useForm<PayrollFormInputs>({
		resolver: zodResolver(PayrollSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: payrollDefaultValues(),
	});

	const { control, setValue, reset, setError, getFieldState } = form;
	const employeeId = useWatch({ control, name: "employeeId" });
	const walletId = useWatch({ control, name: "walletId" });

	const isEmployeeLocked = isEmployee(mode);

	const wallets = useMemo(
		() =>
			walletStore.allWallets === "loading"
				? []
				: walletStore.allWallets.filter((w) => !w.isArchived),
		[walletStore.allWallets],
	);

	// Load wallets for the source picker when the modal opens; reset the form with
	// the employee's monthly salary as the amount — the usual payout, still editable.
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		void walletStore.getAll();

		reset({
			...payrollDefaultValues(),
			employeeId: isEmployee(mode) ? mode.id : 0,
			amount: isEmployee(mode) ? mode.salary : 0,
		});
	}, [isOpen, mode, reset, walletStore]);

	// Default the wallet to the first available once wallets have loaded.
	useEffect(() => {
		if (isOpen && !walletId && wallets.length > 0) {
			setValue("walletId", wallets[0].id, { shouldValidate: true });
		}
	}, [isOpen, walletId, wallets, setValue]);

	const selectedEmployee = useMemo(() => {
		if (isEmployee(mode) && mode.id === employeeId) {
			return mode;
		}
		if (employeeStore.allEmployees === "loading") {
			return null;
		}

		return employeeStore.allEmployees.find((e) => e.id === employeeId) ?? null;
	}, [employeeStore.allEmployees, employeeId, mode]);

	const selectedWallet = wallets.find((w) => w.id === walletId) ?? null;
	const walletAvailable = selectedWallet ? Math.max(0, selectedWallet.balance) : null;

	const setEmployeeId = (id: number) => {
		setValue("employeeId", id, { shouldDirty: true, shouldValidate: true });
		const picked =
			employeeStore.allEmployees === "loading"
				? undefined
				: employeeStore.allEmployees.find((e) => e.id === id);
		// Prefill the salary only while the user hasn't typed an amount themselves.
		if (picked && !getFieldState("amount").isDirty) {
			setValue("amount", picked.salary, { shouldValidate: true });
		}
	};

	const {
		handleSubmit,
		formState: { isDirty },
	} = form;

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		isDirty,
		isSaving,
		onClose,
	);

	// Same guard as the payment modal and POS (DR-25): a payout may not exceed what
	// the wallet holds. Contextual, so it lives here rather than in the schema.
	const submit = handleSubmit(async (values) => {
		if (walletAvailable != null && values.amount > walletAvailable) {
			setError("amount", {
				type: "walletBalance",
				message: t("payroll.form.overWallet", { available: formatCurrency(walletAvailable) }),
			});
			return;
		}
		await onSave(values);
	});

	// Save stays enabled (hard rule 5): handleSubmit blocks an invalid form and
	// surfaces inline errors; the button is only inert while a save is in flight.
	const canSave = !isSaving;

	return {
		form,
		canSave,
		discardOpen,
		isEmployeeLocked,

		wallets,
		walletAvailable,
		selectedEmployee,
		setEmployeeId,

		submit,
		requestClose,
		confirmDiscard,
		cancelDiscard,
	};
}
