import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { translate } from "i18n/i18n";
import { ALL_PAYMENT_CURRENCIES, ALL_PAYMENT_METHODS } from "models/payment";
import { PayrollFormInputs } from "schemas/PayrollSchema";
import { getCurrencyLabel } from "utils/payrollUtils";

import { Grid, MenuItem, TextField } from "@mui/material";

interface PayrollFormFieldsProps {
	form: UseFormReturn<PayrollFormInputs>;
	disabled: boolean;
}

const METHODS = ALL_PAYMENT_METHODS.filter((method) => method !== "AccountBalance");

const PayrollFormFields: React.FC<PayrollFormFieldsProps> = ({ form, disabled }) => {
	const {
		register,
		control,
		watch,
		formState: { errors },
	} = form;

	const selectedCurrency = watch("currency");
	const showExchangeRate = selectedCurrency !== "UZS";

	return (
		<Grid container spacing={2}>
			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					{...register("amount", { valueAsNumber: true })}
					label={`${translate("payment.amount")}*`}
					type="number"
					error={!!errors.amount}
					helperText={errors.amount?.message}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					{...register("date")}
					label={`${translate("payment.date")}*`}
					type="date"
					error={!!errors.date}
					helperText={errors.date?.message}
					slotProps={{ inputLabel: { shrink: true } }}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<Controller
					name="currency"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label={`${translate("payment.currency")}*`}
							error={!!errors.currency}
							helperText={errors.currency?.message}
							fullWidth
							disabled={disabled}
						>
							{ALL_PAYMENT_CURRENCIES.map((currency) => (
								<MenuItem key={currency} value={currency}>
									{getCurrencyLabel(currency)}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<Controller
					name="method"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label={`${translate("payment.method")}*`}
							error={!!errors.method}
							helperText={errors.method?.message}
							fullWidth
							disabled={disabled}
						>
							{METHODS.map((method) => (
								<MenuItem key={method} value={method}>
									{translate(`payment.method.${method}`)}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>

			{showExchangeRate && (
				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField
						{...register("exchangeRate", { valueAsNumber: true })}
						label={translate("payment.exchangeRate")}
						type="number"
						error={!!errors.exchangeRate}
						helperText={errors.exchangeRate?.message}
						fullWidth
						disabled={disabled}
					/>
				</Grid>
			)}

			<Grid size={{ xs: 12 }}>
				<TextField
					{...register("notes")}
					label={translate("payment.notes")}
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
