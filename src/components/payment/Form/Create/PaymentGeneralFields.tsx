import React from "react";
import { Controller, UseFormReturn, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import { PaymentFormInputs } from "schemas/PaymentSchema";

import { TextField } from "@mui/material";

import PaymentDirectionField from "./PaymentDirectionField";

interface PaymentGeneralFieldsProps {
	form: UseFormReturn<PaymentFormInputs>;
}

/** Money with no partner (rent, utilities, delivery): its direction and what it was for. */
const PaymentGeneralFields: React.FC<PaymentGeneralFieldsProps> = ({ form }) => {
	const { t } = useTranslation();
	const { errors } = useFormState({ control: form.control, name: "description" });
	const error = errors.description?.message;

	return (
		<>
			<PaymentDirectionField form={form} label={t("payment.form.directionLabel")} />
			<FormField label={t("payment.form.description")} required>
				<Controller
					name="description"
					control={form.control}
					render={({ field }) => (
						<TextField
							{...field}
							size="small"
							fullWidth
							placeholder={t("payment.form.descriptionPlaceholder")}
							error={!!error}
							helperText={error}
						/>
					)}
				/>
			</FormField>
		</>
	);
};

export default PaymentGeneralFields;
