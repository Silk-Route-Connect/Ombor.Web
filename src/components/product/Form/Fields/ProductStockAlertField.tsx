import React, { useState } from "react";
import { Control, useController } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { ProductFormInputs } from "schemas/ProductSchema";
import { isQuantityDraft, parseWholeQuantity } from "utils/quantityInput";

import { Stack, TextField, Typography } from "@mui/material";

interface ProductStockAlertFieldProps {
	control: Control<ProductFormInputs>;
	disabled: boolean;
}

/**
 * «Минимальный остаток» — optional. At or below it (stock summed over all
 * warehouses) the product reads «Мало» in lists; empty means the alert shows
 * only when the product runs out. Product-level for v1 (DR-23 amended).
 *
 * A whole number of base units: a typed «1,5» stays visible and fails the field
 * (NaN → «Укажите целое число…») instead of a number input dropping the comma
 * and saving 15 (R21).
 */
const ProductStockAlertField: React.FC<ProductStockAlertFieldProps> = ({ control, disabled }) => {
	const { t } = useTranslation();
	const { field, fieldState } = useController({ name: "lowStockThreshold", control });
	const [draft, setDraft] = useState<string | null>(null);
	const shown = draft ?? (field.value == null ? "" : String(field.value));

	const handleChange = (raw: string) => {
		if (!isQuantityDraft(raw)) {
			return;
		}
		setDraft(raw);
		const parsed = parseWholeQuantity(raw);
		if (parsed.kind === "empty") {
			field.onChange(null);
		} else {
			field.onChange(parsed.kind === "whole" ? parsed.value : Number.NaN);
		}
	};

	const handleBlur = () => {
		const parsed = parseWholeQuantity(shown);
		if (parsed.kind === "empty" || parsed.kind === "whole") {
			setDraft(null);
		}
		field.onBlur();
	};

	return (
		<Stack sx={{ gap: "7px", mt: "20px" }}>
			<FormFieldLabel label={t("product.form.lowStockLabel")} />
			<TextField
				name={field.name}
				inputRef={field.ref}
				value={shown}
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				onFocus={(e) => e.target.select()}
				size="small"
				sx={{ width: { xs: "100%", sm: 240 } }}
				placeholder={t("product.form.optionalPlaceholder")}
				disabled={disabled}
				error={!!fieldState.error}
				helperText={fieldState.error?.message}
				slotProps={{ htmlInput: { inputMode: "numeric" } }}
			/>
			<Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
				{t("product.form.lowStockHelper")}
			</Typography>
		</Stack>
	);
};

export default ProductStockAlertField;
