import React from "react";
import { Controller, UseFormReturn, useFormState, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import PeriodSelect from "components/shared/Inputs/PeriodSelect";
import { PaymentEmployeeRef } from "models/payment";
import { PaymentFormInputs } from "schemas/PaymentSchema";

import { Box } from "@mui/material";

import { twoColumnSx } from "./paymentFormLayout";
import PaymentRefSelect from "./PaymentRefSelect";

interface PaymentPayrollFieldsProps {
	form: UseFormReturn<PaymentFormInputs>;
	employees: PaymentEmployeeRef[];
}

/** A salary payout: the employee (prefilling the amount with the salary) and the month. */
const PaymentPayrollFields: React.FC<PaymentPayrollFieldsProps> = ({ form, employees }) => {
	const { t } = useTranslation();
	const { control, setValue } = form;
	const { errors, isSubmitted } = useFormState({ control, name: "employeeId" });
	const [month, year] = useWatch({ control, name: ["month", "year"] });
	const error = errors.employeeId?.message;

	return (
		<Box sx={twoColumnSx}>
			<FormField label={t("payment.form.employee")} required error={error}>
				<Controller
					name="employeeId"
					control={control}
					render={({ field }) => (
						<PaymentRefSelect
							value={field.value}
							options={employees.map((e) => ({ id: e.id, label: e.name, meta: e.position }))}
							placeholder={t("payment.form.employeePlaceholder")}
							error={!!error}
							onChange={(id) => {
								field.onChange(id);
								const employee = employees.find((e) => e.id === id);
								if (employee) {
									// After a failed submit, re-check the prefilled amount so its
									// «Введите сумму» error doesn't outlive the value that fixed it.
									setValue("amount", employee.salary, {
										shouldDirty: true,
										shouldValidate: isSubmitted,
									});
								}
							}}
						/>
					)}
				/>
			</FormField>
			<FormField label={t("payment.form.period")} required>
				<PeriodSelect
					size="small"
					month={Number(month)}
					year={Number(year)}
					onChange={(period) => {
						setValue("month", period.month, { shouldDirty: true });
						setValue("year", period.year, { shouldDirty: true });
					}}
				/>
			</FormField>
		</Box>
	);
};

export default PaymentPayrollFields;
