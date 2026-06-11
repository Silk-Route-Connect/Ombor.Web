import React from "react";
import { Controller, FieldError, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import PhoneListField from "components/shared/Inputs/PhoneListField/PhoneListField";
import { PartnerFormInputs } from "schemas/PartnerSchema";
import { PARTNER_TYPES } from "utils/partnerUtils";

import {
	FormControl,
	FormControlLabel,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
} from "@mui/material";

interface PartnerFormFieldsProps {
	form: UseFormReturn<PartnerFormInputs>;
	disabled: boolean;
}

const PartnerFormFields: React.FC<PartnerFormFieldsProps> = ({ form, disabled }) => {
	const { t } = useTranslation();
	const {
		register,
		control,
		formState: { errors },
	} = form;

	return (
		<Grid container spacing={2}>
			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					id="partner-name"
					label={`${t("partner.name")}*`}
					fullWidth
					margin="dense"
					disabled={disabled}
					error={!!errors.name}
					helperText={errors.name?.message}
					{...register("name")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<FormControl fullWidth margin="dense" error={!!errors.type}>
					<InputLabel id="partner-type-label">{t("partner.type")}</InputLabel>
					<Controller
						name="type"
						control={control}
						render={({ field }) => (
							<Select
								{...field}
								labelId="partner-type-label"
								label={t("partner.type")}
								disabled={disabled}
							>
								{PARTNER_TYPES.map((tpe) => (
									<MenuItem key={tpe} value={tpe}>
										{t(`partner.type.${tpe}`)}
									</MenuItem>
								))}
							</Select>
						)}
					/>
					{errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
				</FormControl>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					id="partner-company"
					label={t("partner.company")}
					fullWidth
					disabled={disabled}
					error={!!errors.companyName}
					helperText={errors.companyName?.message}
					{...register("companyName")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					id="partner-address"
					label={t("partner.address")}
					fullWidth
					disabled={disabled}
					error={!!errors.address}
					helperText={errors.address?.message}
					{...register("address")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					id="partner-email"
					label={t("partner.email")}
					type="email"
					fullWidth
					disabled={disabled}
					error={!!errors.email}
					helperText={errors.email?.message}
					{...register("email")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					id="partner-telegram"
					label={t("partner.telegram")}
					fullWidth
					disabled={disabled}
					error={!!errors.telegram}
					helperText={errors.telegram?.message}
					{...register("telegram")}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<Controller
					name="phoneNumbers"
					control={control}
					render={({ field }) => {
						const phoneErrors = Array.isArray(errors.phoneNumbers)
							? (errors.phoneNumbers as (FieldError | undefined)[])
							: [];
						return (
							<PhoneListField
								disabled={disabled}
								values={field.value ?? []}
								onChange={field.onChange}
								errors={phoneErrors}
								onBlur={field.onBlur}
							/>
						);
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<FormControlLabel
					control={
						<Controller
							name="isActive"
							control={control}
							render={({ field }) => (
								<Switch {...field} checked={field.value} color="primary" disabled={disabled} />
							)}
						/>
					}
					label={t("partner.isActive")}
				/>
			</Grid>
		</Grid>
	);
};

export default PartnerFormFields;
