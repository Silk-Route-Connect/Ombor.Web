import React from "react";
import { Controller, UseFormReturn, useFormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import MoneyField from "components/shared/Inputs/MoneyField";
import { PaymentAmountLimit } from "hooks/payment/usePaymentCreate";
import { PaymentWalletRef } from "models/payment";
import { PaymentFormInputs } from "schemas/PaymentSchema";
import { formatCurrency } from "utils/formatCurrency";

import { Box } from "@mui/material";

import { twoColumnSx } from "./paymentFormLayout";
import PaymentRefSelect from "./PaymentRefSelect";

interface PaymentWalletAmountFieldsProps {
	form: UseFormReturn<PaymentFormInputs>;
	wallets: PaymentWalletRef[];
	/** The advance / wallet ceiling the amount breaks — its message replaces the schema's. */
	amountLimit: PaymentAmountLimit | null;
}

/** Which wallet the money moves through, and how much. */
const PaymentWalletAmountFields: React.FC<PaymentWalletAmountFieldsProps> = ({
	form,
	wallets,
	amountLimit,
}) => {
	const { t } = useTranslation();
	const { errors } = useFormState({ control: form.control, name: ["walletId", "amount"] });
	const walletError = errors.walletId?.message;

	let amountError = errors.amount?.message;
	if (amountLimit?.kind === "advance") {
		amountError = t("payment.form.overWithdraw", { advance: formatCurrency(amountLimit.limit) });
	} else if (amountLimit?.kind === "wallet") {
		// Clamped like the guard — an overdrawn wallet has 0 available, never a negative.
		amountError = t("payment.form.overWallet", { available: formatCurrency(amountLimit.limit) });
	}

	return (
		<Box sx={twoColumnSx}>
			<FormField label={t("payment.form.wallet")} required error={walletError}>
				<Controller
					name="walletId"
					control={form.control}
					render={({ field }) => (
						<PaymentRefSelect
							value={field.value}
							options={wallets.map((w) => ({
								id: w.id,
								label: w.name,
								meta: t(`wallet.type.${w.type.toLowerCase()}`),
							}))}
							placeholder={t("payment.form.walletPlaceholder")}
							error={!!walletError}
							onChange={field.onChange}
						/>
					)}
				/>
			</FormField>
			<FormField label={t("payment.form.amount")} required>
				<Controller
					name="amount"
					control={form.control}
					render={({ field }) => (
						<MoneyField
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							name={field.name}
							inputRef={field.ref}
							size="small"
							placeholder="0"
							error={!!amountError}
							helperText={amountError}
						/>
					)}
				/>
			</FormField>
		</Box>
	);
};

export default PaymentWalletAmountFields;
