import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import { translate } from "i18n/i18n";
import { ProductFormInputs } from "schemas/ProductSchema";

export interface ProductCodesFieldsProps {
	form: UseFormReturn<ProductFormInputs>;
	disabled: boolean;
	onGenerateSku?: () => void;
}

export const ProductCodesFields: React.FC<ProductCodesFieldsProps> = ({
	form,
	disabled,
	onGenerateSku,
}) => {
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<>
			<Grid size={{ xs: 12, md: 6 }}>
				<Controller
					name="sku"
					control={control}
					disabled={disabled}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.sku")}
							fullWidth
							required
							error={!!errors.sku}
							helperText={errors.sku?.message}
							slotProps={{
								input: {
									endAdornment: onGenerateSku ? (
										<InputAdornment position="end">
											<IconButton
												onClick={onGenerateSku}
												size="small"
												aria-label={translate("action.generateSku")}
											>
												<AutorenewIcon fontSize="small" />
											</IconButton>
										</InputAdornment>
									) : undefined,
								},
							}}
						/>
					)}
				/>
			</Grid>

			<Grid size={{ xs: 12, md: 6 }}>
				<Controller
					name="barcode"
					control={control}
					disabled={disabled}
					render={({ field }) => (
						<TextField
							{...field}
							label={translate("product.barcode")}
							error={!!errors.barcode}
							helperText={errors.barcode?.message}
							fullWidth
						/>
					)}
				/>
			</Grid>
		</>
	);
};
