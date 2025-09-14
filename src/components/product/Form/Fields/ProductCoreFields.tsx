import React from "react";
import { Control, Controller, UseFormSetValue, useWatch } from "react-hook-form";
import CategoryAutocomplete from "components/category/Autocomplete/CategoryAutocomplete";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { ProductFormInputs } from "schemas/ProductSchema";

import AutorenewIcon from "@mui/icons-material/Autorenew";
import { IconButton, InputAdornment, MenuItem, Stack, TextField } from "@mui/material";

export interface ProductFormCoreFieldsProps {
	control: Control<ProductFormInputs>;
	setValue: UseFormSetValue<ProductFormInputs>;
	disabled: boolean;
	onGenerateSku?: () => void;
}

const toNumberOrZero = (raw: string): number => {
	const val = raw.trim();
	return val === "" ? 0 : Number(val);
};

const ProductFormCoreFields: React.FC<ProductFormCoreFieldsProps> = ({
	control,
	setValue,
	disabled,
	onGenerateSku,
}) => {
	const type = useWatch({ control, name: "type" as const });

	const supplyDisabled = type === "Sale" || disabled;
	const saleRetailDisabled = type === "Supply" || disabled;

	const supplyRequired = type !== "Sale";
	const saleRequired = type === "Sale" || type === "All";
	const retailRequired = type === "Sale" || type === "All";

	return (
		<Stack spacing={2.5}>
			<Controller
				name="name"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						{...field}
						label={translate("product.name")}
						required
						fullWidth
						disabled={disabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
					/>
				)}
			/>

			<Controller
				name="categoryId"
				control={control}
				render={({ field, fieldState }) => (
					<CategoryAutocomplete
						mode="id"
						value={field.value === 0 ? null : (field.value as number | null)}
						disabled={disabled}
						required
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
						onChange={(id) =>
							setValue("categoryId", id ?? 0, { shouldDirty: true, shouldValidate: true })
						}
					/>
				)}
			/>

			<Controller
				name="measurement"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						select
						fullWidth
						label={translate("product.measurement")}
						value={field.value}
						onChange={(e) => field.onChange(e.target.value)}
						disabled={disabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
					>
						{["Gram", "Kilogram", "Liter", "Unit", "None"].map((m) => (
							<MenuItem key={m} value={m}>
								{translate(`product.measurement.${m}`)}
							</MenuItem>
						))}
					</TextField>
				)}
			/>

			<Controller
				name="type"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						select
						fullWidth
						label={translate("product.type")}
						value={field.value}
						onChange={(e) => field.onChange(e.target.value)}
						disabled={disabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
					>
						{["Sale", "Supply", "All"].map((t) => (
							<MenuItem key={t} value={t}>
								{translate(`product.type.${t}`)}
							</MenuItem>
						))}
					</TextField>
				)}
			/>

			<Controller
				name="supplyPrice"
				control={control}
				render={({ field, fieldState }) => (
					<NumericField
						{...field}
						value={field.value}
						label={translate("product.supplyPrice")}
						required={supplyRequired}
						min={0}
						step={1}
						disabled={supplyDisabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
						onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
					/>
				)}
			/>

			<Controller
				name="salePrice"
				control={control}
				render={({ field, fieldState }) => (
					<NumericField
						{...field}
						value={field.value}
						label={translate("product.salePrice")}
						required={saleRequired}
						min={0}
						step={1}
						disabled={saleRetailDisabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
						onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
					/>
				)}
			/>

			<Controller
				name="retailPrice"
				control={control}
				render={({ field, fieldState }) => (
					<NumericField
						{...field}
						value={field.value}
						label={translate("product.retailPrice")}
						required={retailRequired}
						min={0}
						step={1}
						disabled={saleRetailDisabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
						onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
					/>
				)}
			/>

			<Controller
				name="sku"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						{...field}
						label={translate("product.sku")}
						fullWidth
						required
						disabled={disabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
						slotProps={{
							input: {
								endAdornment: onGenerateSku ? (
									<InputAdornment position="end">
										<IconButton
											onClick={onGenerateSku}
											size="small"
											aria-label={translate("action.generateSku")}
											disabled={disabled}
										>
											<AutorenewIcon fontSize="small" />
										</IconButton>
									</InputAdornment>
								) : undefined,
							},
						}}
					/>
				)}
			/>

			<Controller
				name="barcode"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						{...field}
						label={translate("product.barcode")}
						fullWidth
						disabled={disabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
					/>
				)}
			/>
		</Stack>
	);
};

export default ProductFormCoreFields;
