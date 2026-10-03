import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import MoneyField from "components/shared/Inputs/MoneyField";
import { Wallet } from "models/wallet";
import { PATHS } from "routing/paths";
import { PayrollFormInputs } from "schemas/PayrollSchema";
import { designTokens } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Grid, Link, MenuItem, TextField } from "@mui/material";

interface PayrollFormFieldsProps {
	form: UseFormReturn<PayrollFormInputs>;
	wallets: Wallet[];
	walletAvailable: number | null;
	disabled: boolean;
}

const PayrollFormFields: React.FC<PayrollFormFieldsProps> = ({
	form,
	wallets,
	walletAvailable,
	disabled,
}) => {
	const { t } = useTranslation();
	const {
		register,
		control,
		formState: { errors },
	} = form;

	return (
		<Grid container spacing={2}>
			<Grid size={{ xs: 12, sm: 6 }}>
				{wallets.length === 0 ? (
					<Box
						sx={{
							p: "10px 12px",
							borderRadius: "8px",
							border: "1px solid",
							borderColor: designTokens.warningBorder,
							bgcolor: designTokens.warningBg,
							fontSize: 13,
							lineHeight: 1.5,
						}}
					>
						{t("payroll.form.noWallets")}{" "}
						<Link component={RouterLink} to={PATHS.wallets} sx={{ fontWeight: 600 }}>
							{t("payroll.form.createWallet")}
						</Link>
						{errors.walletId && (
							<Box sx={{ color: "error.main", fontSize: 12, mt: "4px" }}>
								{errors.walletId.message}
							</Box>
						)}
					</Box>
				) : (
					<Controller
						name="walletId"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								select
								value={field.value || ""}
								onChange={(e) => field.onChange(Number(e.target.value))}
								label={`${t("payroll.wallet")}*`}
								error={!!errors.walletId}
								helperText={
									errors.walletId?.message ??
									(walletAvailable != null
										? t("payroll.form.walletBalance", {
												amount: formatCurrency(walletAvailable),
											})
										: undefined)
								}
								fullWidth
								disabled={disabled}
							>
								{wallets.map((wallet) => (
									<MenuItem key={wallet.id} value={wallet.id}>
										{wallet.name}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
				)}
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
				<Controller
					name="amount"
					control={control}
					render={({ field }) => (
						<MoneyField
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							name={field.name}
							inputRef={field.ref}
							label={`${t("payroll.amount")}*`}
							error={!!errors.amount}
							helperText={errors.amount?.message ?? t("payroll.form.amountHint")}
							disabled={disabled}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					{...register("notes")}
					label={t("payroll.notes")}
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
