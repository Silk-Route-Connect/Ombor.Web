import React, { useState } from "react";
import { Control, useController, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import { ProductFormInputs } from "schemas/ProductSchema";
import { measurementShort } from "utils/productUtils";
import { isQuantityDraft, parseWholeQuantity } from "utils/quantityInput";

import { InputAdornment, TextField } from "@mui/material";

interface ProductStockAlertFieldProps {
	control: Control<ProductFormInputs>;
	disabled: boolean;
}

/**
 * «Минимальный остаток» — optional, in the product's unit (shown in the field).
 * At or below it the product joins «Заканчивается» — the dashboard panel,
 * Products «Остаток» and the warehouses (over all of them on the first two, per
 * warehouse on the last); empty means it alerts only when the product runs out.
 * Product-level for v1 (DR-23 amended). The hint sits under its row (the core
 * fields), not under this half-width field.
 *
 * A whole number of base units: a typed «1,5» stays visible and fails the field
 * (NaN → «Укажите целое число…») instead of a number input dropping the comma
 * and saving 15 (R21).
 */
const ProductStockAlertField: React.FC<ProductStockAlertFieldProps> = ({ control, disabled }) => {
	const { t } = useTranslation();
	const { field, fieldState } = useController({ name: "lowStockThreshold", control });
	const unit = measurementShort(t, useWatch({ control, name: "measurement" }));
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
		<FormField label={t("product.form.lowStockLabel")}>
			<TextField
				name={field.name}
				inputRef={field.ref}
				value={shown}
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				onFocus={(e) => e.target.select()}
				size="small"
				fullWidth
				placeholder={t("product.form.optionalPlaceholder")}
				disabled={disabled}
				error={!!fieldState.error}
				helperText={fieldState.error?.message}
				slotProps={{
					htmlInput: { inputMode: "numeric" },
					input: unit
						? { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> }
						: {},
				}}
			/>
		</FormField>
	);
};

export default ProductStockAlertField;
