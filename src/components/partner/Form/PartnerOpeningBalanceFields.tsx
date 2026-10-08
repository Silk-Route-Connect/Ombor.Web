import React from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import MoneyField from "components/shared/Inputs/MoneyField";
import UzsUnit from "components/shared/Money/UzsUnit";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { PartnerFormInputs } from "schemas/PartnerSchema";
import { numericSx } from "theme";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import { Box } from "@mui/material";

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
			<FormField label={t("partner.form.openingType")} sx={{ mb: "16px" }}>
				<Controller
					name="openingType"
					control={control}
					render={({ field }) => (
						<SegmentedControl<"receivable" | "payable">
							variant="form"
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
			</FormField>

			<FormField label={t("partner.form.openingAmount")}>
				<Controller
					name="openingAmount"
					control={control}
					render={({ field }) => (
						<MoneyField
							value={field.value ?? 0}
							onChange={field.onChange}
							onBlur={field.onBlur}
							name={field.name}
							inputRef={field.ref}
							placeholder="0"
							disabled={isSaving}
							error={!!amountError}
							helperText={amountError}
							sign={openingType === "receivable" ? "−" : "+"}
						/>
					)}
				/>
			</FormField>

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
