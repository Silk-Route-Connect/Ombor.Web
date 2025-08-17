import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { ProductFormInputs } from "schemas/ProductSchema";

export interface ProductPackagingFieldsProps {
	form: UseFormReturn<ProductFormInputs>;
	packPrice: number | null;
	disabled: boolean;
}

export const ProductPackagingFields: React.FC<ProductPackagingFieldsProps> = ({
	form,
	packPrice,
	disabled,
}) => {
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<>
			<Grid size={{ xs: 12, sm: 3 }}>
				<Controller
					name="packaging.packSize"
					control={control}
					render={({ field }) => (
						<NumericField
							{...field}
							value={field.value}
							label={translate("product.packaging.size")}
							min={2}
							step={1}
							selectOnFocus
							error={!!errors.packaging?.packSize}
							helperText={errors.packaging?.packSize?.message}
							disabled={disabled}
							onChange={(e) => {
								const value = e.target.value.trim();
								field.onChange(value === "" ? 0 : Number(value));
							}}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<Controller
					name="packaging.packLabel"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.packaging.label")}
							error={!!errors.packaging?.packLabel}
							helperText={errors.packaging?.packLabel?.message}
							disabled={disabled}
							fullWidth
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<Controller
					name="packaging.packBarcode"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.packaging.barcode")}
							error={!!errors.packaging?.packBarcode}
							helperText={errors.packaging?.packBarcode?.message}
							disabled={disabled}
							fullWidth
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<TextField
					label={translate("product.packaging.price")}
					value={packPrice ?? ""}
					aria-readonly
					disabled={disabled}
					fullWidth
					slotProps={{ input: { readOnly: true } }}
				/>
			</Grid>
		</>
	);
};
