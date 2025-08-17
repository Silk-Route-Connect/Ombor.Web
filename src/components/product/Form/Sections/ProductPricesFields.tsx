import React from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { PRODUCT_TYPES } from "models/product";
import { ProductFormInputs } from "schemas/ProductSchema";

export interface ProductTypePricesFieldsProps {
	form: UseFormReturn<ProductFormInputs>;
	disabled: boolean;
}

export const ProductTypePricesFields: React.FC<ProductTypePricesFieldsProps> = ({
	form,
	disabled,
}) => {
	const {
		control,
		formState: { errors },
	} = form;

	const type = useWatch({ control, name: "type" });

	const supplyDisabled = type === "Sale" || disabled;
	const saleRetailDisabled = type === "Supply" || disabled;

	return (
		<>
			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="type"
					control={control}
					disabled={disabled}
					render={({ field }) => (
						<TextField
							value={field.value}
							select
							fullWidth
							required
							label={translate("product.type")}
							error={!!errors.type}
							helperText={errors.type?.message}
							onChange={(e) => field.onChange(e.target.value)}
						>
							{PRODUCT_TYPES.map((t) => (
								<MenuItem key={t} value={t}>
									{translate(`product.type.${t}`)}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="supplyPrice"
					control={control}
					render={({ field }) => (
						<NumericField
							{...field}
							value={field.value}
							label={translate("product.supplyPrice")}
							required
							min={0}
							step={1}
							disabled={supplyDisabled}
							error={!!errors.supplyPrice}
							helperText={errors.supplyPrice?.message}
							onChange={(e) => {
								const value = e.target.value.trim();
								field.onChange(value === "" ? 0 : Number(value));
							}}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="salePrice"
					control={control}
					render={({ field }) => (
						<NumericField
							{...field}
							value={field.value}
							label={translate("product.salePrice")}
							min={0}
							step={1}
							required
							disabled={saleRetailDisabled}
							error={!!errors.salePrice}
							helperText={errors.salePrice?.message}
							onChange={(e) => {
								const value = e.target.value.trim();
								field.onChange(value === "" ? 0 : Number(value));
							}}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 3 }}>
				<Controller
					name="retailPrice"
					control={control}
					render={({ field }) => (
						<NumericField
							{...field}
							value={field.value}
							label={translate("product.retailPrice")}
							required
							min={0}
							step={1}
							disabled={saleRetailDisabled}
							error={!!errors.retailPrice}
							helperText={errors.retailPrice?.message}
							onChange={(e) => {
								const value = e.target.value.trim();
								field.onChange(value === "" ? 0 : Number(value));
							}}
						/>
					)}
				/>
			</Grid>
		</>
	);
};
