import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import { translate } from "i18n/i18n";
import { ProductFormInputs } from "schemas/ProductSchema";

export interface ProductDescriptionFieldProps {
	form: UseFormReturn<ProductFormInputs>;
	disabled: boolean;
}

export const ProductDescriptionField: React.FC<ProductDescriptionFieldProps> = ({
	form,
	disabled,
}) => {
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<Grid size={{ xs: 12 }}>
			<Controller
				name="description"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label={translate("product.description")}
						fullWidth
						multiline
						minRows={3}
						error={!!errors.description}
						helperText={errors.description?.message}
						disabled={disabled}
					/>
				)}
			/>
		</Grid>
	);
};
