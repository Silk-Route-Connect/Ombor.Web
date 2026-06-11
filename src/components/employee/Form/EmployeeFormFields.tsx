import React from "react";
import { Controller, FieldError, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import PhoneListField from "components/shared/Inputs/PhoneListField/PhoneListField";
import { EMPLOYEE_STATUSES } from "models/employee";
import { EmployeeFormInputs } from "schemas/EmployeeSchema";

import { Grid, MenuItem, TextField } from "@mui/material";

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

	return (
		<Grid container spacing={2}>
			{/* Full Name */}
			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					{...register("name")}
					label={`${t("employee.name")}*`}
					error={!!errors.name}
					helperText={errors.name?.message}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			{/* Position */}
			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					{...register("position")}
					label={`${t("employee.position")}*`}
					error={!!errors.position}
					helperText={errors.position?.message}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			{/* Salary */}
			<Grid size={{ xs: 12, sm: 4 }}>
				<TextField
					{...register("salary", { valueAsNumber: true })}
					label={`${t("employee.salary")}*`}
					type="number"
					error={!!errors.salary}
					helperText={errors.salary?.message}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			{/* Date of Employment */}
			<Grid size={{ xs: 12, sm: 4 }}>
				<TextField
					{...register("dateOfEmployment")}
					label={`${t("employee.dateOfEmployment")}*`}
					type="date"
					error={!!errors.dateOfEmployment}
					helperText={errors.dateOfEmployment?.message}
					slotProps={{ inputLabel: { shrink: true } }}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			{/* Status */}
			<Grid size={{ xs: 12, sm: 4 }}>
				<Controller
					name="status"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							select
							label={`${t("employee.status")}*`}
							error={!!errors.status}
							helperText={errors.status?.message}
							fullWidth
							disabled={disabled}
						>
							{EMPLOYEE_STATUSES.map((status) => (
								<MenuItem key={status} value={status}>
									{t(`employee.status.${status}`)}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>

			{/* Email */}
			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					{...register("contactInfo.email")}
					label={t("employee.email")}
					type="email"
					error={!!errors.contactInfo?.email}
					helperText={errors.contactInfo?.email?.message}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			{/* Telegram Account */}
			<Grid size={{ xs: 12, sm: 6 }}>
				<TextField
					{...register("contactInfo.telegramAccount")}
					label={t("employee.telegramAccount")}
					error={!!errors.contactInfo?.telegramAccount}
					helperText={errors.contactInfo?.telegramAccount?.message}
					fullWidth
					disabled={disabled}
				/>
			</Grid>

			{/* Address */}
			<Grid size={{ xs: 12 }}>
				<TextField
					{...register("contactInfo.address")}
					label={t("employee.address")}
					error={!!errors.contactInfo?.address}
					helperText={errors.contactInfo?.address?.message}
					fullWidth
					multiline
					rows={2}
					disabled={disabled}
				/>
			</Grid>

			{/* Phone Numbers */}
			<Grid size={{ xs: 12 }}>
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
			</Grid>
		</Grid>
	);
};

export default EmployeeFormFields;
