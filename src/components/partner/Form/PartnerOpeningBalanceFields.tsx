import React from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import MoneyInputBase from "components/shared/Inputs/MoneyInputBase";
import UzsUnit from "components/shared/Money/UzsUnit";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { PartnerFormInputs } from "schemas/PartnerSchema";
import { designTokens, numericSx } from "theme";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import { Box, Typography } from "@mui/material";

interface PartnerOpeningBalanceFieldsProps {
	form: UseFormReturn<PartnerFormInputs>;
	isSaving: boolean;
}

/**
 * New partner only: who owes whom at the start and how much. The figure is signed
 * from the partner's side (DR-27) — «−» while they owe us — and the resulting
 * balance is previewed under it.
 */
const PartnerOpeningBalanceFields: React.FC<PartnerOpeningBalanceFieldsProps> = ({
	form,
	isSaving,
}) => {
	const { t } = useTranslation();
	const { control, formState } = form;
	const openingType = useWatch({ control, name: "openingType" });
	const openingAmount = useWatch({ control, name: "openingAmount" }) ?? 0;
	const signedOpening = openingType === "payable" ? -openingAmount : openingAmount;
	const amountError = formState.isSubmitted ? formState.errors.openingAmount?.message : undefined;

	return (
		<Box>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "7px", mb: "14px" }}>
				<FormFieldLabel label={t("partner.form.openingType")} />
				<Controller
					name="openingType"
					control={control}
					render={({ field }) => (
						<SegmentedControl<"receivable" | "payable">
							fullWidth
							value={field.value}
							onChange={field.onChange}
							disabled={isSaving}
							options={[
								{ value: "receivable", label: t("partner.form.openingReceivable") },
								{ value: "payable", label: t("partner.form.openingPayable") },
							]}
						/>
					)}
				/>
			</Box>

			<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
				<FormFieldLabel label={t("partner.form.openingAmount")} />
				<Controller
					name="openingAmount"
					control={control}
					render={({ field }) => (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
								px: "14px",
								py: "9px",
								minHeight: 44,
								border: "1px solid",
								borderColor: designTokens.borderControl,
								borderRadius: "8px",
								bgcolor: "background.paper",
								"&:focus-within": { borderColor: "primary.main" },
							}}
						>
							<Box
								component="span"
								sx={{
									...numericSx,
									fontWeight: 700,
									fontSize: 20,
									color: partnerBalanceColor(signedOpening),
								}}
							>
								{openingType === "receivable" ? "−" : "+"}
							</Box>
							<MoneyInputBase
								value={field.value ?? 0}
								onChange={field.onChange}
								onBlur={field.onBlur}
								placeholder="0"
								disabled={isSaving}
								sx={{
									...numericSx,
									flex: 1,
									minWidth: 0,
									fontWeight: 700,
									fontSize: 20,
									letterSpacing: "-0.01em",
								}}
							/>
							<UzsUnit />
						</Box>
					)}
				/>
				{amountError && (
					<Typography sx={{ fontSize: 12, color: "error.main" }}>{amountError}</Typography>
				)}
			</Box>

			{openingAmount > 0 && (
				<Box
					sx={{
						mt: "12px",
						fontSize: 13,
						color: "text.secondary",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					{t("partner.form.openingPreview")}{" "}
					<Box
						component="b"
						sx={{ ...numericSx, fontWeight: 700, color: partnerBalanceColor(signedOpening) }}
					>
						{formatPartnerBalance(signedOpening)}
						<UzsUnit />
					</Box>
				</Box>
			)}
		</Box>
	);
};

export default PartnerOpeningBalanceFields;
