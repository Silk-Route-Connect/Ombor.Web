import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { PaymentFormInputs } from "schemas/PaymentSchema";

interface PaymentDirectionFieldProps {
	form: UseFormReturn<PaymentFormInputs>;
	label: string;
}

/**
 * «Приход | Расход» — asked only where the direction cannot be derived
 * (business-rules rule 14): a General payment, or a «Клиент + Поставщик» partner.
 */
const PaymentDirectionField: React.FC<PaymentDirectionFieldProps> = ({ form, label }) => {
	const { t } = useTranslation();

	return (
		<FormField label={label} required>
			<Controller
				name="direction"
				control={form.control}
				render={({ field }) => (
					<SegmentedControl
						variant="form"
						fullWidth
						value={field.value}
						onChange={field.onChange}
						options={[
							{ value: "Income", label: t("payment.direction.income") },
							{ value: "Expense", label: t("payment.direction.expense") },
						]}
					/>
				)}
			/>
		</FormField>
	);
};

export default PaymentDirectionField;
