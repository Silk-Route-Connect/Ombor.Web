import React from "react";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import { ProductFormInputs } from "schemas/ProductSchema";

import { MenuItem, TextField } from "@mui/material";

const MEASUREMENTS = ["Gram", "Kilogram", "Ton", "Piece", "Box", "None"] as const;

interface ProductMeasurementFieldProps {
	control: Control<ProductFormInputs>;
	disabled: boolean;
}

/** «Единица измерения» — the unit stock, prices and the «Минимальный остаток» count in. */
const ProductMeasurementField: React.FC<ProductMeasurementFieldProps> = ({ control, disabled }) => {
	const { t } = useTranslation();

	return (
		<FormField label={t("product.measurement")}>
			<Controller
				name="measurement"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						select
						size="small"
						fullWidth
						value={field.value}
						onChange={(e) => field.onChange(e.target.value)}
						disabled={disabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
					>
						{MEASUREMENTS.map((m) => (
							<MenuItem key={m} value={m}>
								{t(`product.measurement.${m}`)}
							</MenuItem>
						))}
					</TextField>
				)}
			/>
		</FormField>
	);
};

export default ProductMeasurementField;
