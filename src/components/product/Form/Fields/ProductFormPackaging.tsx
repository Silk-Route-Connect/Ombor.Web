import React from "react";
import { Control, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import NumericField from "components/shared/Inputs/NumericField";
import { ProductFormInputs } from "schemas/ProductSchema";

import {
	Box,
	Collapse,
	FormControlLabel,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";

export interface ProductFormPackagingProps {
	control: Control<ProductFormInputs>;
	disabled: boolean;
	hasPackaging: boolean;
	packPrice: number | null;
	enablePackaging: () => void;
	disablePackaging: () => void;
}

const toNumberOrZero = (raw: string): number => {
	const value = raw.trim();
	return value === "" ? 0 : Number(value);
};

const ProductFormPackaging: React.FC<ProductFormPackagingProps> = ({
	control,
	disabled,
	hasPackaging,
	packPrice,
	enablePackaging,
	disablePackaging,
}) => {
	const { t } = useTranslation();

	return (
		<Stack spacing={2}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography variant="subtitle1">{t("product.packaging")}</Typography>

				<FormControlLabel
					label={hasPackaging ? t("common.enabled") : t("common.enable")}
					control={
						<Switch
							checked={hasPackaging}
							onChange={(_, checked) => (checked ? enablePackaging() : disablePackaging())}
							disabled={disabled}
						/>
					}
				/>
			</Box>

			<Collapse in={hasPackaging} unmountOnExit>
				<Stack spacing={2}>
					<Controller
						name="packaging.size"
						control={control}
						render={({ field, fieldState }) => (
							<NumericField
								{...field}
								value={field.value}
								label={t("product.packaging.size")}
								min={2}
								step={1}
								selectOnFocus
								disabled={disabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
								onChange={(e) => field.onChange(toNumberOrZero(e.target.value))}
							/>
						)}
					/>

					<Controller
						name="packaging.label"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={t("product.packaging.label")}
								fullWidth
								disabled={disabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>

					<Controller
						name="packaging.barcode"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={t("product.packaging.barcode")}
								fullWidth
								disabled={disabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>

					<TextField
						label={t("product.packaging.price")}
						value={packPrice ?? "0"}
						fullWidth
						aria-readonly
						slotProps={{ input: { readOnly: true } }}
					/>
				</Stack>
			</Collapse>
		</Stack>
	);
};

export default ProductFormPackaging;
