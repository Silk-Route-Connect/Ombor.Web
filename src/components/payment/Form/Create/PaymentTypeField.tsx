import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PAYMENT_TYPE_META } from "components/payment/PaymentPresentation";
import FormField from "components/shared/Forms/FormField";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { PAYMENT_TYPES, PaymentType } from "models/payment";
import { PaymentFormInputs } from "schemas/PaymentSchema";

import { Box } from "@mui/material";

interface PaymentTypeFieldProps {
	form: UseFormReturn<PaymentFormInputs>;
	type: PaymentType;
}

/**
 * The five payment types as one segmented choice, with the picked type's one-line
 * hint. Labels never wrap: on a narrow screen the control scrolls sideways
 * instead of breaking «Возврат аванса» over two lines.
 */
const PaymentTypeField: React.FC<PaymentTypeFieldProps> = ({ form, type }) => {
	const { t } = useTranslation();

	return (
		<FormField label={t("payment.form.typeLabel")} helperText={t(`payment.typeHint.${type}`)}>
			<Box sx={{ overflowX: "auto", "& > [role=group]": { minWidth: "max-content" } }}>
				<Controller
					name="type"
					control={form.control}
					render={({ field }) => (
						<SegmentedControl
							variant="form"
							fullWidth
							value={field.value}
							onChange={(v) => {
								field.onChange(v);
								// General defaults to an outflow, every other type to an inflow.
								form.setValue("direction", v === "General" ? "Expense" : "Income");
							}}
							options={PAYMENT_TYPES.map((pt) => ({
								value: pt,
								label: t(PAYMENT_TYPE_META[pt].labelKey),
							}))}
						/>
					)}
				/>
			</Box>
		</FormField>
	);
};

export default PaymentTypeField;
