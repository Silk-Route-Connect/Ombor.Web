import React from "react";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import NumericField from "components/shared/Inputs/NumericField";
import { ProductFormInputs } from "schemas/ProductSchema";

import { Stack, Typography } from "@mui/material";

interface ProductStockAlertFieldProps {
	control: Control<ProductFormInputs>;
	disabled: boolean;
}

/**
 * «Минимальный остаток» — optional. At or below it (stock summed over all
 * warehouses) the product reads «Мало» in lists; empty means the alert shows
 * only when the product runs out. Product-level for v1 (DR-23 amended).
 */
const ProductStockAlertField: React.FC<ProductStockAlertFieldProps> = ({ control, disabled }) => {
	const { t } = useTranslation();

	return (
		<Stack sx={{ gap: "7px", mt: "20px" }}>
			<FormFieldLabel label={t("product.form.lowStockLabel")} />
			<Controller
				name="lowStockThreshold"
				control={control}
				render={({ field, fieldState }) => (
					<NumericField
						name={field.name}
						inputRef={field.ref}
						value={field.value ?? ""}
						onBlur={field.onBlur}
						onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
						size="small"
						min={0}
						step={1}
						fullWidth={false}
						sx={{ width: { xs: "100%", sm: 240 } }}
						placeholder={t("product.form.optionalPlaceholder")}
						disabled={disabled}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
					/>
				)}
			/>
			<Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
				{t("product.form.lowStockHelper")}
			</Typography>
		</Stack>
	);
};

export default ProductStockAlertField;
