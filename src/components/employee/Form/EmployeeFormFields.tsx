import React from "react";
import { Controller, FieldError, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import FormSection from "components/shared/Forms/FormSection";
import MoneyField from "components/shared/Inputs/MoneyField";
import PhoneListField from "components/shared/Inputs/PhoneListField/PhoneListField";
import UzsAdornment from "components/shared/Money/UzsAdornment";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { EMPLOYEE_STATUSES, EmployeeStatus } from "models/employee";
import { EmployeeFormInputs } from "schemas/EmployeeSchema";

import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { Box, Stack, TextField } from "@mui/material";

interface EmployeeFormFieldsProps {
	form: UseFormReturn<EmployeeFormInputs>;
	disabled: boolean;
}

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
			<FormField label={t("employee.name")} required>
				<TextField
					{...register("name")}
					size="small"
					fullWidth
					placeholder={t("employee.form.namePlaceholder")}
					error={!!errors.name}
					helperText={errors.name?.message}
					disabled={disabled}
				/>
			</FormField>

			<Box sx={twoCol}>
				<FormField label={t("employee.position")} required>
					<TextField
						{...register("position")}
						size="small"
						fullWidth
						placeholder={t("employee.form.positionPlaceholder")}
						error={!!errors.position}
						helperText={errors.position?.message}
						disabled={disabled}
					/>
				</FormField>

				<FormField label={t("employee.salary")} required>
					<Controller
						name="salary"
						control={control}
						render={({ field }) => (
							<MoneyField
								value={field.value ?? 0}
								onChange={field.onChange}
								onBlur={field.onBlur}
								name={field.name}
								inputRef={field.ref}
								size="small"
								placeholder="0"
								disabled={disabled}
								error={!!errors.salary}
								helperText={errors.salary?.message}
								slotProps={{
									input: { endAdornment: <UzsAdornment /> },
								}}
							/>
						)}
					/>
				</FormField>
			</Box>

			<Box sx={twoCol}>
				<FormField label={t("employee.dateOfEmployment")} required>
					<TextField
						{...register("dateOfEmployment")}
						type="date"
						size="small"
						fullWidth
						error={!!errors.dateOfEmployment}
						helperText={errors.dateOfEmployment?.message}
						disabled={disabled}
					/>
				</FormField>

				<FormField label={t("employee.status")} required>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<SegmentedControl<EmployeeStatus>
								variant="form"
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
				</FormField>
			</Box>

			<FormSection title={t("employee.contactInfo")} icon={<PhoneOutlinedIcon />}>
				<Box sx={twoCol}>
					<FormField label={t("employee.email")}>
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
					</FormField>

					<FormField label={t("employee.telegramAccount")}>
						<TextField
							{...register("contactInfo.telegramAccount")}
							size="small"
							fullWidth
							placeholder={t("employee.form.telegramPlaceholder")}
							error={!!errors.contactInfo?.telegramAccount}
							helperText={errors.contactInfo?.telegramAccount?.message}
							disabled={disabled}
						/>
					</FormField>
				</Box>

				<FormField label={t("employee.address")}>
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
				</FormField>

				<FormField label={t("employee.phoneNumbers")}>
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
				</FormField>
			</FormSection>
		</Stack>
	);
};

export default EmployeeFormFields;
