import React from "react";
import { Controller, UseFormReturn, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import { PaymentPartnerRef, PaymentType } from "models/payment";
import { PaymentFormInputs } from "schemas/PaymentSchema";

import PaymentPartnerSummary from "./PaymentPartnerSummary";
import PaymentRefSelect from "./PaymentRefSelect";

interface PaymentPartnerFieldProps {
	form: UseFormReturn<PaymentFormInputs>;
	partners: PaymentPartnerRef[];
	partner: PaymentPartnerRef | null;
	type: PaymentType;
}

/** The partner picker of a settlement / advance / advance-return payment, with its balance line. */
const PaymentPartnerField: React.FC<PaymentPartnerFieldProps> = ({
	form,
	partners,
	partner,
	type,
}) => {
	const { t } = useTranslation();
	const { errors } = useFormState({ control: form.control, name: "partnerId" });
	const error = errors.partnerId?.message;

	return (
		<FormField label={t("payment.form.partner")} required error={error}>
			<Controller
				name="partnerId"
				control={form.control}
				render={({ field }) => (
					<PaymentRefSelect
						value={field.value}
						options={partners.map((p) => ({
							id: p.id,
							label: p.name,
							meta: t(`payment.partnerType.${p.type}`),
						}))}
						placeholder={t("payment.form.partnerPlaceholder")}
						error={!!error}
						onChange={field.onChange}
					/>
				)}
			/>
			{partner && (
				<PaymentPartnerSummary
					partner={partner}
					showAdvance={type === "Withdrawal" || partner.advance > 0}
				/>
			)}
		</FormField>
	);
};

export default PaymentPartnerField;
