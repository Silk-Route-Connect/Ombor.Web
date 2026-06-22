import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Wallet } from "models/wallet";
import { PayrollFormInputs } from "schemas/PayrollSchema";

import { Grid, MenuItem, TextField } from "@mui/material";

interface PayrollFormFieldsProps {
	form: UseFormReturn<PayrollFormInputs>;
	wallets: Wallet[];
	disabled: boolean;
}

const PayrollFormFields: React.FC<PayrollFormFieldsProps> = ({ form, wallets, disabled }) => {
	const { t } = useTranslation();
	const {
		register,
		control,
		formState: { errors },
	} = form;

	return (
		<Grid container spacing={2}>
			<Grid size={{ xs: 12, sm: 6 }}>
				<Controller
					name="walletId"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							value={field.value ?? 0}
							onChange={(e) => field.onChange(Number(e.target.value))}
							label={`${t("payroll.wallet")}*`}
							error={!!errors.walletId}
							helperText={errors.walletId?.message}
							fullWidth
							disabled={disabled || wallets.length === 0}
						>
							{wallets.map((wallet) => (
								<MenuItem key={wallet.id} value={wallet.id}>
									{wallet.name}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					{...register("period")}
					label={`${t("payroll.period")}*`}
					type="month"
					error={!!errors.period}
					helperText={errors.period?.message}
					fullWidth
					disabled={disabled}
					slotProps={{ inputLabel: { shrink: true } }}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					{...register("amount", { valueAsNumber: true })}
					label={`${t("payment.amount")}*`}
					type="number"
					error={!!errors.amount}
					helperText={errors.amount?.message}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					{...register("notes")}
					label={t("payment.notes")}
					error={!!errors.notes}
					helperText={errors.notes?.message}
					fullWidth
					multiline
					rows={3}
					disabled={disabled}
				/>
			</Grid>
		</Grid>
	);
};

export default PayrollFormFields;
