import React from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { MenuItem, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CategoryAutocomplete from "components/shared/Autocomplete/CategoryAutocomplete";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { PRODUCT_MEASUREMENTS } from "models/product";
import { ProductFormInputs } from "schemas/ProductSchema";

interface ProductIdentityFieldsProps {
	form: UseFormReturn<ProductFormInputs>;
	disabled: boolean;
}

const ProductIdentityFields: React.FC<ProductIdentityFieldsProps> = ({ form, disabled }) => {
	const {
		control,
		setValue,
		formState: { errors },
	} = form;

	const categoryId = useWatch({ control, name: "categoryId" });

	console.log(categoryId);

	return (
		<>
			<Grid size={{ xs: 12, md: 4 }}>
				<Controller
					name="name"
					control={control}
					disabled={disabled}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.name")}
							required
							fullWidth
							error={!!errors.name}
							helperText={errors.name?.message}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 4 }}>
				<Controller
					name="categoryId"
					control={control}
					render={({ field, fieldState }) => (
						<>
							<CategoryAutocomplete
								mode="id"
								value={field.value === 0 ? null : field.value}
								disabled={disabled}
								required
								error={!!fieldState.error}
								onChange={(id) =>
									setValue("categoryId", id ?? 0, { shouldDirty: true, shouldValidate: true })
								}
							/>
							{fieldState.error && (
								<Typography variant="caption" color="error">
									{fieldState.error.message}
								</Typography>
							)}
						</>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 4 }}>
				<Controller
					name="measurement"
					control={control}
					disabled={disabled}
					render={({ field }) => (
						<TextField
							select
							label={translate("product.measurement")}
							fullWidth
							value={field.value}
							onChange={(e) => field.onChange(e.target.value)}
							error={!!errors.measurement}
							helperText={errors.measurement?.message}
						>
							{PRODUCT_MEASUREMENTS.map((m) => (
								<MenuItem key={m} value={m}>
									{translate(`product.measurement.${m}`)}
								</MenuItem>
							))}
						</TextField>
					)}
				/>
			</Grid>
		</>
	);
};

export default observer(ProductIdentityFields);
