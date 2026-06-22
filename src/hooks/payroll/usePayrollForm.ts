import { useEffect, useMemo } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { Employee } from "models/employee";
import { Wallet } from "models/wallet";
import { PayrollFormInputs, PayrollFormValues, PayrollSchema } from "schemas/PayrollSchema";
import { useStore } from "stores/StoreContext";
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
	const { employeeStore, walletStore } = useStore();

	const form = useForm<PayrollFormInputs>({
		resolver: zodResolver(PayrollSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: payrollDefaultValues(),
	});

	const { control, setValue, reset } = form;
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

	// Load wallets for the source picker when the modal opens; reset the form.
	useEffect(() => {
		if (!isOpen) {
			return;
		}

		void walletStore.getAll();

		reset({
			...payrollDefaultValues(),
			employeeId: isEmployee(mode) ? mode.id : 0,
		});
	}, [isOpen, mode, reset, walletStore]);

	// Default the wallet to the first available once wallets have loaded.
	useEffect(() => {
		if (isOpen && !walletId && wallets.length > 0) {
			setValue("walletId", wallets[0].id, { shouldValidate: true });
		}
	}, [isOpen, walletId, wallets, setValue]);

	const selectedEmployee = useMemo(() => {
		if (employeeStore.allEmployees === "loading") {
			return null;
		}

		return employeeStore.allEmployees.find((e) => e.id === employeeId) ?? null;
	}, [employeeStore.allEmployees, employeeId]);

	const setEmployeeId = (id: number) => {
		setValue("employeeId", id, { shouldDirty: true, shouldValidate: true });
	};

	const {
		handleSubmit,
		formState: { isDirty, isValid },
	} = form;

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		isDirty,
		isSaving,
		onClose,
	);

	const submit = handleSubmit(onSave);

	const canSave = isValid && !isSaving;

	return {
		form,
		canSave,
		discardOpen,
		isEmployeeLocked,

		wallets,
		selectedEmployee,
		setEmployeeId,

		submit,
		requestClose,
		confirmDiscard,
		cancelDiscard,
	};
}
