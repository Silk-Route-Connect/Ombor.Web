import React from "react";
import { Controller, FieldError, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import PhoneListField from "components/shared/Inputs/PhoneListField/PhoneListField";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { EMPLOYEE_STATUSES, EmployeeStatus } from "models/employee";
import { EmployeeFormInputs } from "schemas/EmployeeSchema";
import { designTokens } from "theme";

import { Box, InputAdornment, Stack, TextField, Typography } from "@mui/material";

interface EmployeeFormFieldsProps {
	form: UseFormReturn<EmployeeFormInputs>;
	disabled: boolean;
}

/** Label-above field wrapper matching the redesign form modals (Warehouse / Wallet). */
const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
	label,
	required,
	children,
}) => (
	<Stack sx={{ gap: "7px" }}>
		<FormFieldLabel label={label} required={required} />
		{children}
	</Stack>
);

const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({ form, disabled }) => {
	const { t } = useTranslation();
	const {
		register,
		control,
		formState: { errors },
	} = form;

	const twoCol = {
		display: "grid",
		gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
		gap: "16px",
	} as const;

	return (
		<Stack sx={{ gap: "16px" }}>
			<Field label={t("employee.name")} required>
				<TextField
					{...register("name")}
					size="small"
					fullWidth
					placeholder={t("employee.form.namePlaceholder")}
					error={!!errors.name}
					helperText={errors.name?.message}
					disabled={disabled}
				/>
			</Field>

			<Box sx={twoCol}>
				<Field label={t("employee.position")} required>
					<TextField
						{...register("position")}
						size="small"
						fullWidth
						placeholder={t("employee.form.positionPlaceholder")}
						error={!!errors.position}
						helperText={errors.position?.message}
						disabled={disabled}
					/>
				</Field>

				<Field label={t("employee.salary")} required>
					<Controller
						name="salary"
						control={control}
						render={({ field }) => (
							<NumericField
								{...field}
								value={field.value || ""}
								size="small"
								min={0}
								placeholder="0"
								disabled={disabled}
								error={!!errors.salary}
								helperText={errors.salary?.message}
								onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
								slotProps={{
									input: { endAdornment: <InputAdornment position="end">UZS</InputAdornment> },
								}}
							/>
						)}
					/>
				</Field>
			</Box>

			<Box sx={twoCol}>
				<Field label={t("employee.dateOfEmployment")} required>
					<TextField
						{...register("dateOfEmployment")}
						type="date"
						size="small"
						fullWidth
						error={!!errors.dateOfEmployment}
						helperText={errors.dateOfEmployment?.message}
						disabled={disabled}
					/>
				</Field>

				<Field label={t("employee.status")} required>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<SegmentedControl<EmployeeStatus>
								fullWidth
								value={field.value as EmployeeStatus}
								onChange={field.onChange}
								disabled={disabled}
								options={EMPLOYEE_STATUSES.map((status) => ({
									value: status,
									label: t(`employee.status.${status}`),
								}))}
							/>
						)}
					/>
				</Field>
			</Box>

			{/* Contact section */}
			<Box sx={{ pt: "6px", borderTop: "1px solid", borderColor: "divider" }}>
				<Typography
					sx={{
						fontSize: 13,
						fontWeight: 600,
						color: designTokens.gray700,
						mt: "12px",
						mb: "14px",
					}}
				>
					{t("employee.contactInfo")}
				</Typography>

				<Stack sx={{ gap: "16px" }}>
					<Box sx={twoCol}>
						<Field label={t("employee.email")}>
							<TextField
								{...register("contactInfo.email")}
								type="email"
								size="small"
								fullWidth
								placeholder={t("employee.form.emailPlaceholder")}
								error={!!errors.contactInfo?.email}
								helperText={errors.contactInfo?.email?.message}
								disabled={disabled}
							/>
						</Field>

						<Field label={t("employee.telegramAccount")}>
							<TextField
								{...register("contactInfo.telegramAccount")}
								size="small"
								fullWidth
								placeholder={t("employee.form.telegramPlaceholder")}
								error={!!errors.contactInfo?.telegramAccount}
								helperText={errors.contactInfo?.telegramAccount?.message}
								disabled={disabled}
							/>
						</Field>
					</Box>

					<Field label={t("employee.address")}>
						<TextField
							{...register("contactInfo.address")}
							size="small"
							fullWidth
							multiline
							rows={2}
							placeholder={t("employee.form.addressPlaceholder")}
							error={!!errors.contactInfo?.address}
							helperText={errors.contactInfo?.address?.message}
							disabled={disabled}
						/>
					</Field>

					<Field label={t("employee.phoneNumbers")}>
						<Controller
							name="contactInfo.phoneNumbers"
							control={control}
							render={({ field }) => {
								const phoneErrors = Array.isArray(errors.contactInfo?.phoneNumbers)
									? (errors.contactInfo.phoneNumbers as (FieldError | undefined)[])
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
					</Field>
				</Stack>
			</Box>
		</Stack>
	);
};

export default EmployeeFormFields;
