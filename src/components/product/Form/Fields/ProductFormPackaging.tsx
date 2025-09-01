import React from "react";
import { Control, Controller } from "react-hook-form";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
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
	const v = raw.trim();
	return v === "" ? 0 : Number(v);
};

const ProductFormPackaging: React.FC<ProductFormPackagingProps> = ({
	control,
	disabled,
	hasPackaging,
	packPrice,
	enablePackaging,
	disablePackaging,
}) => {
	return (
		<Stack spacing={2}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography variant="subtitle1">{translate("product.packaging")}</Typography>

				<FormControlLabel
					label={hasPackaging ? translate("common.enabled") : translate("common.enable")}
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
						name="packaging.packSize"
						control={control}
						render={({ field, fieldState }) => (
							<NumericField
								{...field}
								value={field.value}
								label={translate("product.packaging.size")}
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
						name="packaging.packLabel"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={translate("product.packaging.label")}
								fullWidth
								disabled={disabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>

					<Controller
						name="packaging.packBarcode"
						control={control}
						render={({ field, fieldState }) => (
							<TextField
								{...field}
								label={translate("product.packaging.barcode")}
								fullWidth
								disabled={disabled}
								error={!!fieldState.error}
								helperText={fieldState.error?.message}
							/>
						)}
					/>

					<TextField
						label={translate("product.packaging.price")}
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
